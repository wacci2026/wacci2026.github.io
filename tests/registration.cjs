const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const base = { fullName: 'Ada Lovelace', email: 'ada@example.com', institution: 'University', country: 'Colombia', authorStatus: 'author', paperIds: '12', position: 'student', travelGrant: 'yes', feeWaiver: 'no', codeOfConduct: 'accept', feeOption: 'advanced' };

for (const filename of ['Code.gs', 'Code.faster.gs']) {
  function backend() {
    const rows = [];
    let files = 0;
    const sentEmails = [];
    const settings = { failMail: false, quota: 100 };
    const cache = new Map();
    const properties = new Map([['RECEIPT_FOLDER_ID', 'private-folder']]);
    const file = { getUrl: () => 'https://drive.google.com/file/d/private-receipt/view' };
    const sheet = {
      getLastColumn: () => rows[0].length,
      getLastRow: () => rows.length,
      getRange: (r, c, nr = 1, nc = 1) => {
        // Faster backend searches an A1 column range for duplicate emails.
        if (typeof r === 'string') { r = 2; c = 4; nr = rows.length - 1; }
        const values = () => rows.slice(r - 1, r - 1 + nr).map(row => row.slice(c - 1, c - 1 + nc).map(v => String(v ?? '')));
        const finder = (needle) => ({ matchEntireCell() { return this; }, matchCase() { return this; }, findAll: () => values().flatMap((row, i) => row[0] === needle ? [{ getRow: () => r + i }] : []), findNext() { return this.findAll()[0] || null; } });
        return { getDisplayValues: values, getDisplayValue: () => values()[0][0], setValue: value => { rows[r - 1][c - 1] = value; }, createTextFinder: finder };
      },
      appendRow: row => rows.push(row),
    };
    const context = vm.createContext({
      ContentService: { MimeType: { JSON: "json" }, createTextOutput: json => ({ setMimeType: () => JSON.parse(json) }) },
      MailApp: { getRemainingDailyQuota: () => settings.quota, sendEmail: options => { if (settings.failMail) throw new Error('Temporary mail failure'); sentEmails.push(options); } },
      Session: { getEffectiveUser: () => ({ getEmail: () => 'deployer@example.test' }) },
      GmailApp: {
        getAliases: () => ['wacci2026@gmail.com'],
        sendEmail: (to, subject, body, options) => {
          if (settings.failMail) throw new Error('Temporary mail failure');
          sentEmails.push({ to, subject, body, ...options });
        },
      },
      UrlFetchApp: { fetch: () => ({ getResponseCode: () => 200, getBlob: () => ({ getContentType: () => 'image/png', getBytes: () => [137,80,78,71] }) }) },
      HtmlService: { createHtmlOutput: html => ({ getBlob: () => ({ getAs: type => ({ html, type, setName(name) { this.name = name; return this; } }) }) }) },
      console: { log() {}, warn() {}, error() {} },
      LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
      CacheService: { getScriptCache: () => ({ get: key => cache.get(key), put: (key, value) => cache.set(key, value) }) },
      PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) }) },
      SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet }), flush() {} },
      Utilities: { getUuid: () => require('node:crypto').randomUUID(), base64Decode: s => Array.from(Buffer.from(s, 'base64')), base64Encode: bytes => Buffer.from(bytes).toString('base64'), newBlob: (bytes, type, name) => ({ bytes, type, name }) },
      DriveApp: { getFolderById: () => ({ getFilesByName: () => ({ hasNext: () => files > 0, next: () => file }), createFile: blob => { assert.equal(blob.type, 'application/pdf'); files++; return file; } }) },
    });
    vm.runInContext(fs.readFileSync(`apps-script/registration/${filename}`, 'utf8'), context);
    rows.push(vm.runInContext('COLUMNS.map(c => c.title).concat("Payment Status")', context));
    return { context, rows, sentEmails, settings, fileCount: () => files, value: name => rows[1][rows[0].indexOf(name)] };
  }

  test(`${filename}: Chile hides only travel grant and clears stale answers`, () => {
    const { context: b } = backend();
    const r = b.validate_({ ...base, country: 'Chile', travelGrant: 'yes' });
    assert.equal(r.ok, true);
    assert.equal(r.data.travelGrant, '');
    assert.equal(r.data.feeWaiver, 'no');
    assert.equal(b.validate_({ ...base, country: 'Chile', travelGrant: '' }).ok, true);
    assert.equal(b.validate_({ ...base, country: 'Chile', feeWaiver: '' }).ok, false);
    assert.equal(b.validate_({ ...base, travelGrant: '' }).ok, false);
    assert.equal(b.validate_({ ...base, country: '' }).ok, false);
    assert.equal(b.validate_({ ...base, position: 'professor', travelGrant: '', feeWaiver: '' }).ok, true);
  });

  test(`${filename}: resume a pending receipt by matching the registered email`, () => {
    const b = backend();
    const registration = b.context.saveRegistration_(base, '');
    const resume = email => post({ action: 'resumeReceiptUpload', email });
    function post(body) {
      return b.context.doPost({ postData: { type: 'text/plain', contents: JSON.stringify(body) } });
    }

    assert.equal(resume('unknown@example.com').code, 'NO_PENDING_RECEIPT');
    const recovered = resume(' ADA@EXAMPLE.COM ');
    assert.equal(recovered.ok, true);
    assert.equal(recovered.submissionId, registration.submissionId);
    assert.notEqual(recovered.receiptToken, registration.receiptToken);
    assert.equal(b.sentEmails.length, 0);

    const uploaded = post({
      action: 'uploadReceipt',
      ...recovered,
      receiptBase64: Buffer.from('%PDF-1.4\nRecovered receipt').toString('base64'),
    });
    assert.equal(uploaded.ok, true);
    assert.equal(b.rows.length, 2);
    assert.equal(b.fileCount(), 1);
    assert.equal(resume(base.email).code, 'NO_PENDING_RECEIPT');
    assert.equal(b.sentEmails.length, 1);
    assert.equal(b.sentEmails[0].to, base.email);
    assert.equal(b.sentEmails[0].attachments[0].type, 'application/pdf');
  });

  test(`${filename}: save registration, authenticate PDF upload, update same row and retry`, () => {
    const b = backend();
    const registration = b.context.saveRegistration_(base, 'registration-token');
    assert.equal(registration.ok, true);
    assert.ok(registration.receiptToken);
    assert.equal(b.value('Receipt Upload Token'), registration.receiptToken);
    const upload = { submissionId: registration.submissionId, receiptToken: registration.receiptToken, receiptBase64: Buffer.from('%PDF-1.4\nReceipt test').toString('base64') };
    assert.equal(b.context.uploadReceipt_({ ...upload, receiptToken: '00000000-0000-0000-0000-000000000000' }).code, 'UNAUTHORIZED');
    assert.equal(b.context.uploadReceipt_({ ...upload, receiptBase64: Buffer.from('not a PDF').toString('base64') }).code, 'INVALID_RECEIPT');
    assert.equal(b.context.uploadReceipt_({ ...upload, receiptBase64: 'a'.repeat(7 * 1024 * 1024) }).code, 'INVALID_RECEIPT');
    assert.equal(b.fileCount(), 0);
    const uploaded = b.context.uploadReceipt_(upload);
    assert.equal(uploaded.ok, true);
    assert.equal(uploaded.confirmationEmailSent, true);
    assert.ok(b.value('Confirmation Email Sent At'));
    assert.equal(b.sentEmails.length, 1);
    assert.equal(b.sentEmails[0].to, base.email);
    assert.equal(b.sentEmails[0].from, 'wacci2026@gmail.com');
    assert.equal(b.sentEmails[0].attachments[0].type, 'application/pdf');
    assert.match(b.sentEmails[0].attachments[0].name, /-registration\.pdf$/);
    const attendeeContent = b.sentEmails[0].body + b.sentEmails[0].attachments[0].html;
    for (const excluded of ['Author Status', 'Travel Grant', 'Code of Conduct', 'Payment Status', 'Registration Fee Waiver', 'Receipt Upload Token', 'Payment Receipt PDF', 'Receipt Uploaded At', registration.receiptToken, 'private-receipt']) {
      assert.ok(!attendeeContent.includes(excluded), excluded + ' must stay internal');
    }
    assert.match(attendeeContent, /Full name/);
    assert.match(attendeeContent, /Ada Lovelace/);
    assert.match(attendeeContent, /WACCI logo/);
    assert.match(attendeeContent, /Pucón waterfront/);
    assert.match(b.value('Payment Receipt PDF'), /^https:\/\/drive.google.com/);
    assert.equal(b.value('Payment Status'), 'Receipt received — pending review');
    assert.ok(b.value('Receipt Uploaded At'));
    assert.equal(b.context.uploadReceipt_(upload).alreadyProcessed, true);
    assert.equal(b.fileCount(), 1);
    assert.equal(b.sentEmails.length, 1);
    assert.equal(b.rows.length, 2);
    assert.equal(b.context.saveRegistration_(base, 'registration-token').receiptToken, registration.receiptToken);
  });
  test(`${filename}: mail failure preserves receipt; retry sends once without another PDF upload`, () => {
    const b = backend();
    const registration = b.context.saveRegistration_(base, 'registration-token');
    const upload = { submissionId: registration.submissionId, receiptToken: registration.receiptToken, receiptBase64: Buffer.from('%PDF-1.4\nReceipt test').toString('base64') };
    b.settings.failMail = true;
    const result = b.context.uploadReceipt_(upload);
    assert.equal(result.ok, true);
    assert.equal(result.receiptSaved, true);
    assert.equal(result.confirmationEmailSent, false);
    assert.ok(b.value('Payment Receipt PDF'));
    assert.equal(b.value('Confirmation Email Sent At'), '');
    assert.equal(b.fileCount(), 1);
    b.settings.failMail = false;
    b.settings.quota = 0;
    const retry = { submissionId: registration.submissionId, receiptToken: registration.receiptToken };
    assert.equal(b.context.uploadReceipt_(retry).confirmationEmailSent, false);
    b.settings.quota = 100;
    assert.equal(b.context.uploadReceipt_(retry).confirmationEmailSent, true);
    assert.equal(b.context.uploadReceipt_(retry).alreadyProcessed, true);
    assert.equal(b.fileCount(), 1);
    assert.equal(b.sentEmails.length, 1);
  });

  test(`${filename}: attendee HTML escapes supplied names`, () => {
    const b = backend();
    const html = b.context.confirmationPdfHtml_([['Full name', '<script>bad()</script>']], 'logo', 'banner');
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });
}

test('frontend eligibility matches backend; countries include Chile and all ISO entries', () => {
  function load(path) {
    const context = vm.createContext({
      ContentService: { MimeType: { JSON: "json" }, createTextOutput: json => ({ setMimeType: () => JSON.parse(json) }) }, exports: {}, process: { env: {} } });
    vm.runInContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
    return context.exports;
  }
  const lib = load('src/lib/registration.ts');
  const { COUNTRY_OPTIONS } = load('src/lib/countries.ts');
  assert.equal(COUNTRY_OPTIONS.length, 250);
  assert.equal(new Set(COUNTRY_OPTIONS).size, 250);
  assert.ok(COUNTRY_OPTIONS.includes('Chile'));
  assert.equal(lib.asksTravelGrant('author', 'student', 'Chile'), false);
  assert.equal(lib.asksTravelGrant('author', 'student', 'Colombia'), true);
  assert.equal(lib.asksTravelGrant('not_author', 'student', 'Colombia'), false);
  assert.equal(lib.asksFeeWaiver('author', 'student'), true);
  assert.equal(lib.REGISTRATION_INFO.advancedDeadline, '9 December 2026');
});

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
      console: { log() {}, warn() {}, error() {} },
      LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
      CacheService: { getScriptCache: () => ({ get: key => cache.get(key), put: (key, value) => cache.set(key, value) }) },
      PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) }) },
      SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet }), flush() {} },
      Utilities: { getUuid: () => '12345678-1234-1234-1234-123456789abc', base64Decode: s => Array.from(Buffer.from(s, 'base64')), newBlob: (bytes, type, name) => ({ bytes, type, name }) },
      DriveApp: { getFolderById: () => ({ getFilesByName: () => ({ hasNext: () => files > 0, next: () => file }), createFile: blob => { assert.equal(blob.type, 'application/pdf'); files++; return file; } }) },
    });
    vm.runInContext(fs.readFileSync(`apps-script/registration/${filename}`, 'utf8'), context);
    rows.push(vm.runInContext('COLUMNS.map(c => c.title).concat("Payment Status")', context));
    return { context, rows, fileCount: () => files, value: name => rows[1][rows[0].indexOf(name)] };
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
    assert.equal(b.context.uploadReceipt_(upload).ok, true);
    assert.match(b.value('Payment Receipt PDF'), /^https:\/\/drive.google.com/);
    assert.equal(b.value('Payment Status'), 'Receipt received — pending review');
    assert.ok(b.value('Receipt Uploaded At'));
    assert.equal(b.context.uploadReceipt_(upload).alreadyProcessed, true);
    assert.equal(b.fileCount(), 1);
    assert.equal(b.rows.length, 2);
    assert.equal(b.context.saveRegistration_(base, 'registration-token').receiptToken, registration.receiptToken);
  });
}

test('frontend eligibility matches backend; countries include Chile and all ISO entries', () => {
  function load(path) {
    const context = vm.createContext({ exports: {}, process: { env: {} } });
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
  assert.equal(lib.REGISTRATION_INFO.advancedDeadline, '30 November 2026');
});

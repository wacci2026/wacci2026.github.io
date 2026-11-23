/**
 * WACCI 2026 — Registration backend (Google Apps Script Web App)
 * ---------------------------------------------------------------------------
 * Receives the JSON POSTed by src/app/(site)/registration/registration-form.tsx
 * and appends one row per registration to the "Registrations" sheet.
 *
 * Setup (full guide: apps-script/registration/SHEET_SETUP.md):
 *   1. Open the Google Sheet → Extensions → Apps Script → paste this file as Code.gs.
 *   2. Run `setupSheet` once (creates/validates the sheet and its headers).
 *   3. Run `runSelfTests` and check that every line says PASS.
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me   |   Who has access: Anyone
 *   5. Copy the /exec URL into NEXT_PUBLIC_REGISTRATION_ENDPOINT (src/lib/registration.ts).
 *
 * After ANY change to this file you must publish a new version:
 *   Deploy → Manage deployments → ✏️ Edit → Version: "New version" → Deploy
 * (editing the code alone does NOT update the live /exec URL).
 *
 * Responses are always HTTP 200 with JSON:
 *   { ok: true,  submissionId: "WACCI-XXXXXXXX", alreadyProcessed?: true }
 *   { ok: false, code: "VALIDATION_ERROR" | "DUPLICATE_EMAIL" | ..., message, fieldErrors? }
 */

// ============================================================================
// CONFIG — edit these values
// ============================================================================
const CONFIG = {
  // Leave empty if this script is bound to the spreadsheet (Extensions → Apps Script).
  // Otherwise paste the ID from the sheet URL: docs.google.com/spreadsheets/d/<ID>/edit
  SPREADSHEET_ID: '',
  SHEET_NAME: 'Registrations',

  // Reject a second registration with the same email address.
  REJECT_DUPLICATE_EMAILS: true,

  // Optional emails (each failure is logged but never breaks the registration).
  ORGANIZER_NOTIFY_EMAIL: '', // e.g. 'wacci2026@gmail.com' — empty = disabled
  CONTACT_EMAIL: 'wacci2026@gmail.com',
  CONFIRMATION_FROM: 'wacci2026@gmail.com',

  // Text shown in the sheet / emails. Keep in sync with src/lib/registration.ts.
  ADVANCED_FEE: 'US$150',
  STANDARD_FEE: 'US$180',
  ADVANCED_DEADLINE: '9 December 2026',
  CONFIRMATION_LOGO_URL: 'https://wacci2026.github.io/images/wacci-122x64.png',
  CONFIRMATION_BANNER_URL: 'https://wacci2026.github.io/images/hero/pucon.png',

  LOCK_TIMEOUT_MS: 25000,
  MAX_PAYLOAD_CHARS: 7 * 1024 * 1024, // 5 MB PDF encoded as base64 plus JSON
  MAX_RECEIPT_BYTES: 5 * 1024 * 1024,
  IDEMPOTENCY_TTL_SECONDS: 21600, // 6 h (CacheService maximum)
};

// ============================================================================
// SCHEMA — the sheet header row MUST contain every `title` below (any order).
// Extra columns are allowed (the script leaves them empty).
// ============================================================================
const COLUMNS = [
  { key: 'timestamp', title: 'Timestamp' },
  { key: 'submissionId', title: 'Submission ID' },
  { key: 'fullName', title: 'Full Name' },
  { key: 'email', title: 'Email' },
  { key: 'institution', title: 'Institution' },
  { key: 'country', title: 'Country' },
  { key: 'authorStatus', title: 'Author Status' },
  { key: 'paperIds', title: 'Paper IDs' },
  { key: 'position', title: 'Position' },
  { key: 'travelGrant', title: 'Travel Grant' },
  { key: 'feeWaiver', title: 'Registration Fee Waiver' },
  { key: 'codeOfConduct', title: 'Code of Conduct' },
  { key: 'feeOption', title: 'Registration Fee' },
  { key: 'receiptToken', title: 'Receipt Upload Token' },
  { key: 'receiptUrl', title: 'Payment Receipt PDF' },
  { key: 'receiptUploadedAt', title: 'Receipt Uploaded At' },
  { key: 'confirmationEmailSentAt', title: 'Confirmation Email Sent At' },
];

// Optional organizer columns: filled with a default ONLY if the header exists.
const ORGANIZER_DEFAULTS = {
  'Payment Status': 'Pending',
};

// Allowed values (keys MUST match the `value`s in src/lib/registration.ts).
// The label is what gets written to the sheet.
const OPTIONS = {
  authorStatus: {
    presenting_author: 'Yes, I am a presenting author',
    author: 'Yes, I am an author',
    not_author: 'No, I am not',
  },
  position: {
    student: 'Student',
    postdoc: 'Postdoc',
    professor: 'Professor',
  },
  feeWaiver: {
    yes: 'Yes',
    no: 'No',
  },
  travelGrant: {
    yes: 'Yes',
    no: 'No',
  },
  codeOfConduct: {
    accept: 'Yes, I accept',
    decline: 'No, I don’t accept',
  },
  feeOption: {
    advanced: 'Advance fee (' + CONFIG.ADVANCED_FEE + ' by ' + CONFIG.ADVANCED_DEADLINE + ')',
    later: 'Pay after ' + CONFIG.ADVANCED_DEADLINE + ' (' + CONFIG.STANDARD_FEE + ')',
  },
};

const LIMITS = {
  fullName: 120,
  email: 254,
  institution: 200,
  country: 100,
  paperIds: 200,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_REGEX = /^[A-Za-z0-9-]{8,64}$/;

// ============================================================================
// HTTP ENTRY POINTS
// ============================================================================

/** Health check: open the /exec URL in a browser → {"ok":true,...}. Never returns data. */
function doGet() {
  return json_({ ok: true, service: 'wacci-2026-registration', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const parsed = parseRequest_(e);
    if (!parsed.ok) return json_(parsed);

    const input = parsed.data;

    // Honeypot: bots fill the hidden "website" field. Pretend success, write nothing.
    if (str_(input.website) !== '') {
      console.warn('Honeypot triggered; submission ignored.');
      return json_({ ok: true, submissionId: 'WACCI-' + shortId_() });
    }

    if (input.action === 'uploadReceipt') return json_(uploadReceipt_(input));
    if (input.action && input.action !== 'register') return json_(fail_('BAD_REQUEST', 'Unknown action.'));

    const result = validate_(input);
    if (!result.ok) return json_(result);

    const token = TOKEN_REGEX.test(str_(input.submissionToken)) ? str_(input.submissionToken) : '';
    const response = saveRegistration_(result.data, token);

    if (response.ok && !response.alreadyProcessed) {
      sendEmails_(result.data, response.submissionId);
    }
    return json_(response);
  } catch (err) {
    console.error('Unhandled error in doPost: ' + (err && err.stack ? err.stack : err));
    return json_({
      ok: false,
      code: 'SERVER_ERROR',
      message:
        'Something went wrong on our side. Please try again in a few minutes or write to ' +
        CONFIG.CONTACT_EMAIL +
        '.',
    });
  }
}

// ============================================================================
// REQUEST PARSING & VALIDATION
// ============================================================================

function parseRequest_(e) {
  if (!e) {
    return fail_('BAD_REQUEST', 'Empty request.');
  }
  const body = e.postData && typeof e.postData.contents === 'string' ? e.postData.contents : '';

  if (body.length > CONFIG.MAX_PAYLOAD_CHARS) {
    return fail_('PAYLOAD_TOO_LARGE', 'The submitted data is too large.');
  }

  // Preferred: JSON body (sent as text/plain by the website to avoid CORS preflight).
  if (body && /^\s*\{/.test(body)) {
    try {
      const data = JSON.parse(body);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { ok: true, data: data };
      }
    } catch (err) {
      return fail_('BAD_REQUEST', 'The request body is not valid JSON.');
    }
    return fail_('BAD_REQUEST', 'The request body must be a JSON object.');
  }

  // Fallback: application/x-www-form-urlencoded (e.g. a plain HTML form or curl -d).
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return { ok: true, data: e.parameter };
  }

  return fail_('BAD_REQUEST', 'No data received.');
}

/** Returns { ok: true, data: cleanRecord } or { ok: false, code, message, fieldErrors }. */
function validate_(input) {
  const errors = {};
  const d = {
    fullName: collapse_(input.fullName),
    email: str_(input.email).toLowerCase(),
    institution: collapse_(input.institution),
    country: collapse_(input.country),
    authorStatus: str_(input.authorStatus),
    paperIds: str_(input.paperIds),
    position: str_(input.position),
    travelGrant: str_(input.travelGrant),
    feeWaiver: str_(input.feeWaiver),
    codeOfConduct: str_(input.codeOfConduct),
    feeOption: str_(input.feeOption),
  };

  if (d.fullName.length < 2) errors.fullName = 'Please enter your full name.';
  else if (d.fullName.length > LIMITS.fullName) errors.fullName = 'Maximum ' + LIMITS.fullName + ' characters.';

  if (!d.email) errors.email = 'Please enter your email.';
  else if (d.email.length > LIMITS.email || !EMAIL_REGEX.test(d.email)) errors.email = 'Please enter a valid email address.';

  if (!d.institution) errors.institution = 'Please enter your institution or company.';
  else if (d.institution.length > LIMITS.institution) errors.institution = 'Maximum ' + LIMITS.institution + ' characters.';

  if (!d.country) errors.country = 'Please select your country of origin.';
  else if (d.country.length > LIMITS.country) errors.country = 'Maximum ' + LIMITS.country + ' characters.';

  if (!has_(OPTIONS.authorStatus, d.authorStatus)) errors.authorStatus = 'Please select a valid option.';

  const author = d.authorStatus === 'presenting_author' || d.authorStatus === 'author';
  if (author) {
    if (!d.paperIds) errors.paperIds = 'Please add the EasyChair ID of each paper.';
    else if (d.paperIds.length > LIMITS.paperIds) errors.paperIds = 'Maximum ' + LIMITS.paperIds + ' characters.';
    else {
      const ids = parsePaperIds_(d.paperIds);
      if (!ids) errors.paperIds = 'Use numbers only, separated by commas (e.g. 12, 34).';
      else d.paperIds = ids.join(', ');
    }

    if (!has_(OPTIONS.position, d.position)) errors.position = 'Please select your position.';

    const asksGrant = d.position === 'student';
    if (asksGrant) {
      // Required when asked; Chilean students skip only the travel grant.
      if (d.country.toLowerCase() === 'chile') d.travelGrant = '';
      else if (!has_(OPTIONS.travelGrant, d.travelGrant)) errors.travelGrant = 'Please select an option.';
      if (!has_(OPTIONS.feeWaiver, d.feeWaiver)) errors.feeWaiver = 'Please select an option.';
    } else {
      d.travelGrant = ''; // Funding questions are only asked to students.
      d.feeWaiver = '';
    }
  } else {
    // Non-authors skip the Attendance and Travel Grant sections.
    d.paperIds = '';
    d.position = '';
    d.travelGrant = '';
    d.feeWaiver = '';
  }

  if (!has_(OPTIONS.codeOfConduct, d.codeOfConduct)) errors.codeOfConduct = 'Please select an option.';
  else if (d.codeOfConduct !== 'accept') errors.codeOfConduct = 'Accepting the Code of Conduct is required to attend WACCI 2026.';

  if (!has_(OPTIONS.feeOption, d.feeOption)) errors.feeOption = 'Please select an option.';

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Please correct the highlighted fields.',
      fieldErrors: errors,
    };
  }
  return { ok: true, data: d };
}

function parsePaperIds_(raw) {
  const tokens = raw
    .split(/[\s,;/]+/)
    .map(function (t) { return t.replace(/^#/, ''); })
    .filter(function (t) { return t !== ''; });
  if (tokens.length === 0) return null;
  for (let i = 0; i < tokens.length; i++) {
    if (!/^\d{1,7}$/.test(tokens[i])) return null;
  }
  return tokens.filter(function (t, i) { return tokens.indexOf(t) === i; });
}

// ============================================================================
// PERSISTENCE
// ============================================================================

function saveRegistration_(d, token) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.LOCK_TIMEOUT_MS)) {
    console.warn('Could not obtain lock within ' + CONFIG.LOCK_TIMEOUT_MS + ' ms.');
    return fail_('BUSY', 'The server is busy right now. Please try again in a few seconds.');
  }

  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = token ? 'reg_' + token : '';

    // Idempotency: the same submissionToken (a retry after a timeout) returns the original result.
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached) {
        const previous = JSON.parse(cached);
        previous.alreadyProcessed = true;
        return previous;
      }
    }

    const sheet = getSheet_();
    const headerMap = getHeaderMap_(sheet);

    if (CONFIG.REJECT_DUPLICATE_EMAILS && emailExists_(sheet, headerMap, d.email)) {
      return {
        ok: false,
        code: 'DUPLICATE_EMAIL',
        message:
          'This email is already registered. To change your registration, please write to ' +
          CONFIG.CONTACT_EMAIL +
          '.',
        fieldErrors: { email: 'This email is already registered.' },
      };
    }

    const submissionId = 'WACCI-' + shortId_();
    const receiptToken = Utilities.getUuid();
    const values = {
      timestamp: new Date(),
      submissionId: submissionId,
      receiptToken: receiptToken,
      receiptUrl: '',
      receiptUploadedAt: '',
      confirmationEmailSentAt: '',
      fullName: d.fullName,
      email: d.email,
      institution: d.institution,
      country: d.country,
      authorStatus: OPTIONS.authorStatus[d.authorStatus],
      paperIds: d.paperIds,
      position: d.position ? OPTIONS.position[d.position] : '',
      travelGrant: d.travelGrant ? OPTIONS.travelGrant[d.travelGrant] : '',
      feeWaiver: d.feeWaiver ? OPTIONS.feeWaiver[d.feeWaiver] : '',
      codeOfConduct: OPTIONS.codeOfConduct[d.codeOfConduct],
      feeOption: OPTIONS.feeOption[d.feeOption],
    };

    const row = new Array(headerMap.width).fill('');
    COLUMNS.forEach(function (col) {
      const v = values[col.key];
      // Paper IDs are always forced to text so "12" or "12, 34" never becomes a number/date.
      row[headerMap.index[normalizeHeader_(col.title)]] =
        col.key === 'paperIds' && v ? "'" + v : safeCell_(v);
    });
    Object.keys(ORGANIZER_DEFAULTS).forEach(function (title) {
      const idx = headerMap.index[normalizeHeader_(title)];
      if (idx !== undefined) row[idx] = ORGANIZER_DEFAULTS[title];
    });

    sheet.appendRow(row);
    SpreadsheetApp.flush(); // make sure the row is written before releasing the lock

    const response = { ok: true, submissionId: submissionId, receiptToken: receiptToken };
    if (cacheKey) {
      try {
        cache.put(cacheKey, JSON.stringify(response), CONFIG.IDEMPOTENCY_TTL_SECONDS);
      } catch (err) {
        console.warn('Could not cache idempotency key: ' + err);
      }
    }
    console.log('Registered ' + submissionId + ' (' + d.email + ')');
    return response;
  } finally {
    lock.releaseLock();
  }
}

/** Private Drive file; only a link is stored in Sheets. Never grant public sharing. */
function uploadReceipt_(input) {
  const submissionId = str_(input.submissionId);
  const receiptToken = str_(input.receiptToken);
  if (!/^WACCI-[A-F0-9]{8}$/.test(submissionId) || !/^[a-f0-9-]{36}$/i.test(receiptToken)) {
    return fail_('UNAUTHORIZED', 'Invalid receipt upload reference.');
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.LOCK_TIMEOUT_MS)) return fail_('BUSY', 'The server is busy. Please try again.');
  try {
    const sheet = getSheet_();
    const map = getHeaderMap_(sheet);
    const index = function (title) { return map.index[normalizeHeader_(title)] + 1; };
    const count = sheet.getLastRow() - 1;
    const matches = count > 0 ? sheet.getRange(2, index('Submission ID'), count, 1)
      .createTextFinder(submissionId).matchEntireCell(true).matchCase(true).findAll() : [];
    if (matches.length !== 1) return fail_('UNAUTHORIZED', 'Invalid receipt upload reference.');
    const row = matches[0].getRow();
    if (sheet.getRange(row, index('Receipt Upload Token')).getDisplayValue() !== receiptToken) {
      return fail_('UNAUTHORIZED', 'Invalid receipt upload reference.');
    }
    if (sheet.getRange(row, index('Payment Receipt PDF')).getDisplayValue()) {
      return sendReceiptConfirmation_(sheet, row, map, submissionId);
    }
    const encoded = typeof input.receiptBase64 === 'string' ? input.receiptBase64 : '';
    if (!encoded || encoded.length > 4 * Math.ceil(CONFIG.MAX_RECEIPT_BYTES / 3) ||
        encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
      return fail_('INVALID_RECEIPT', 'Please upload a PDF no larger than 5 MB.');
    }
    let bytes;
    try { bytes = Utilities.base64Decode(encoded); }
    catch (err) { return fail_('INVALID_RECEIPT', 'The PDF could not be decoded.'); }
    if (bytes.length > CONFIG.MAX_RECEIPT_BYTES || bytes.length < 5 ||
        String.fromCharCode.apply(null, bytes.slice(0, 5)) !== '%PDF-') {
      return fail_('INVALID_RECEIPT', 'Please upload a valid PDF no larger than 5 MB.');
    }
    const folderId = PropertiesService.getScriptProperties().getProperty('RECEIPT_FOLDER_ID');
    if (!folderId) return fail_('NOT_CONFIGURED', 'Receipt uploads are not available yet. Please contact ' + CONFIG.CONTACT_EMAIL + '.');
    const folder = DriveApp.getFolderById(folderId);
    const filename = submissionId + '-receipt.pdf';
    // Reuse the file if a previous upload saved it but failed to update the Sheet.
    const existing = folder.getFilesByName(filename);
    const file = existing.hasNext() ? existing.next() : folder.createFile(Utilities.newBlob(bytes, 'application/pdf', filename));
    sheet.getRange(row, index('Receipt Uploaded At')).setValue(new Date());
    if (map.index[normalizeHeader_('Payment Status')] !== undefined) {
      sheet.getRange(row, index('Payment Status')).setValue('Receipt received — pending review');
    }
    // Write the link last: this is the marker used for safe retries.
    sheet.getRange(row, index('Payment Receipt PDF')).setValue(file.getUrl());
    SpreadsheetApp.flush();
    return sendReceiptConfirmation_(sheet, row, map, submissionId);
  } finally {
    lock.releaseLock();
  }
}

function getSpreadsheet_() {
  if (CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No spreadsheet: bind this script to the sheet or set CONFIG.SPREADSHEET_ID.');
  }
  return ss;
}

function getSheet_() {
  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" not found. Run setupSheet() once.');
  }
  return sheet;
}

/** Maps normalized header title → 0-based column index. Throws if a required header is missing. */
function getHeaderMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) throw new Error('Header row is empty. Run setupSheet() once.');

  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const index = {};
  headers.forEach(function (h, i) {
    const key = normalizeHeader_(h);
    if (key && index[key] === undefined) index[key] = i;
  });

  const missing = COLUMNS.filter(function (c) {
    return index[normalizeHeader_(c.title)] === undefined;
  }).map(function (c) { return c.title; });

  if (missing.length > 0) {
    throw new Error('Missing header(s) in row 1 of "' + CONFIG.SHEET_NAME + '": ' + missing.join(', '));
  }
  return { index: index, width: lastCol };
}

function emailExists_(sheet, headerMap, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const col = headerMap.index[normalizeHeader_('Email')] + 1;
  const emails = sheet.getRange(2, col, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).trim().toLowerCase() === email) return true;
  }
  return false;
}

// ============================================================================
// EMAILS (attendee confirmation is sent only after receipt upload)
// ============================================================================

/** Explicit attendee-facing allowlist. Internal sheet columns never enter the email or PDF. */
function confirmationDetails_(sheet, row, map) {
  const fields = [
    ['Submission ID', 'Registration reference'],
    ['Full Name', 'Full name'],
    ['Email', 'Email'],
    ['Institution', 'Institution / company'],
    ['Country', 'Country'],
    ['Paper IDs', 'Paper IDs'],
    ['Position', 'Position'],
    ['Registration Fee', 'Selected registration fee'],
  ];
  return fields.map(function (field) {
    const column = map.index[normalizeHeader_(field[0])];
    return [field[1], sheet.getRange(row, column + 1).getDisplayValue()];
  }).filter(function (field) { return field[1] !== ''; });
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

function confirmationPdfHtml_(details, logo, destination) {
  const rows = details.map(function (field) {
    return '<tr><th>' + escapeHtml_(field[0]) + '</th><td>' + escapeHtml_(field[1]) + '</td></tr>';
  }).join('');
  return '<!doctype html><html lang="en"><head><meta charset="UTF-8"><style>' +
    '@page{size:A4;margin:32pt 36pt}body{font-family:Arial,sans-serif;color:#173b48;font-size:10pt;line-height:1.4;margin:0}' +
    '.brand{width:100%;border-bottom:2pt solid #1684aa;margin-bottom:16pt}.brand td{border:0;padding:0 0 10pt}.brand .event{text-align:right;font-size:17pt;font-weight:bold}' +
    '.destination{display:block;width:100%;height:auto;margin-bottom:16pt}' +
    'h1{font-size:23pt;line-height:1.15;margin:0 0 8pt}p{margin:0 0 12pt}.eyebrow{font-size:9pt;color:#25728b;letter-spacing:1pt;font-weight:bold}' +
    '.details{border-collapse:collapse;width:100%;margin:14pt 0;table-layout:fixed}.details th,.details td{padding:8pt 10pt;border-bottom:1pt solid #dbe7eb;vertical-align:top;text-align:left;overflow-wrap:anywhere;word-wrap:break-word}' +
    '.details th{width:33%;background:#f1f7f9;font-weight:bold}.details tr{page-break-inside:avoid}' +
    '.footer{margin-top:18pt;border-top:1pt solid #dbe7eb;padding-top:10pt;font-size:9pt;color:#496774}' +
    '</style></head><body>' +
    '<table class="brand"><tr><td><img src="' + logo + '" width="122" height="64" alt="WACCI logo"></td>' +
    '<td class="event">WACCI 2026<br><span style="font-size:10pt;font-weight:normal">Pucón, Chile · December 14-17, 2026</span></td></tr></table>' +
    '<img class="destination" src="' + destination + '" alt="Pucón waterfront and Villarrica volcano">' +
    '<p class="eyebrow">REGISTRATION CONFIRMATION</p><h1>See you in Pucón!</h1>' +
    '<p>Thank you for completing your registration and submitting your receipt. We look forward to welcoming you to WACCI 2026.</p>' +
    '<table class="details">' + rows + '</table>' +
    '<p class="footer">Please keep this confirmation for your records.<br>Questions or corrections? ' + escapeHtml_(CONFIG.CONTACT_EMAIL) +
    '<br>WACCI 2026 Organizing Committee</p></body></html>';
}

function confirmationImage_(url) {
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('Confirmation branding image could not be loaded.');
  const blob = response.getBlob();
  const type = blob.getContentType();
  if (!/^image\/(png|jpeg|webp)$/.test(type)) throw new Error('Invalid confirmation branding image.');
  return 'data:' + type + ';base64,' + Utilities.base64Encode(blob.getBytes());
}

/** Receipt persistence succeeds independently of email delivery; retries never upload it twice. */
function sendReceiptConfirmation_(sheet, row, map, submissionId) {
  const sentCell = sheet.getRange(row, map.index[normalizeHeader_('Confirmation Email Sent At')] + 1);
  if (sentCell.getDisplayValue()) {
    return { ok: true, submissionId: submissionId, receiptSaved: true, confirmationEmailSent: true, alreadyProcessed: true };
  }
  try {
    if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Email quota exhausted.');
    const sender = CONFIG.CONFIRMATION_FROM;
    const sendOptions = {};
    if (Session.getEffectiveUser().getEmail().toLowerCase() !== sender) {
      if (!GmailApp.getAliases().includes(sender)) {
        throw new Error('Configure ' + sender + ' as a verified Gmail send-as address.');
      }
      sendOptions.from = sender;
    }
    const details = confirmationDetails_(sheet, row, map);
    const email = sheet.getRange(row, map.index[normalizeHeader_('Email')] + 1).getDisplayValue().trim();
    const name = sheet.getRange(row, map.index[normalizeHeader_('Full Name')] + 1).getDisplayValue();
    if (!EMAIL_REGEX.test(email)) throw new Error('Invalid registration email.');
    const html = confirmationPdfHtml_(details, confirmationImage_(CONFIG.CONFIRMATION_LOGO_URL), confirmationImage_(CONFIG.CONFIRMATION_BANNER_URL));
    const pdf = HtmlService.createHtmlOutput(html).getBlob().getAs('application/pdf').setName(submissionId + '-registration.pdf');
    const detailText = details.map(function (field) { return field[0] + ': ' + field[1]; }).join('\n');
    const subject = 'WACCI 2026 - Registration confirmation (' + submissionId + ')';
    const body = 'Dear ' + name + ',\n\nThank you for completing your WACCI 2026 registration and submitting your receipt.\n' +
        'We look forward to welcoming you in Pucón, Chile, December 14-17, 2026.\n\n' + detailText +
        '\n\nYour registration confirmation PDF is attached. Please keep it for your records.\n\n' +
        'Questions or corrections? ' + CONFIG.CONTACT_EMAIL + '\n\nWACCI 2026 Organizing Committee';
    GmailApp.sendEmail(email, subject, body, {
      ...sendOptions,
      name: 'WACCI 2026 Organizing Committee',
      replyTo: CONFIG.CONTACT_EMAIL,
      attachments: [pdf],
    });
    sentCell.setValue(new Date());
    SpreadsheetApp.flush();
    return { ok: true, submissionId: submissionId, receiptSaved: true, confirmationEmailSent: true };
  } catch (err) {
    console.error('Receipt confirmation failed for ' + submissionId + ': ' + err);
    return {
      ok: true, submissionId: submissionId, receiptSaved: true, confirmationEmailSent: false,
      message: 'Your receipt is saved, but we could not send your confirmation email. Please retry or contact ' + CONFIG.CONTACT_EMAIL + '.',
    };
  }
}

/** Run once manually after updating the script to authorize email, image fetching and PDF conversion. Sends no email. */
function authorizeConfirmationEmail() {
  const html = confirmationPdfHtml_([['Full name', 'Setup preview']], confirmationImage_(CONFIG.CONFIRMATION_LOGO_URL), confirmationImage_(CONFIG.CONFIRMATION_BANNER_URL));
  const pdf = HtmlService.createHtmlOutput(html).getBlob().getAs('application/pdf');
  console.log('Confirmation PDF ready (' + pdf.getBytes().length + ' bytes). Remaining email recipients today: ' + MailApp.getRemainingDailyQuota());
}

function sendEmails_(d, submissionId) {
  if (CONFIG.ORGANIZER_NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail(
        CONFIG.ORGANIZER_NOTIFY_EMAIL,
        'New WACCI 2026 registration: ' + d.fullName,
        submissionId + '\n' + d.fullName + ' <' + d.email + '>\n' + d.institution + '\n' +
          OPTIONS.authorStatus[d.authorStatus] + (d.paperIds ? ' — papers: ' + d.paperIds : '')
      );
    } catch (err) {
      console.error('Organizer notification failed: ' + err);
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(code, message) {
  return { ok: false, code: code, message: message };
}

function str_(v) {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) v = v[0]; // e.parameters-style arrays
  return String(v).trim();
}

function collapse_(v) {
  return str_(v).replace(/\s+/g, ' ');
}

function has_(obj, key) {
  return key !== '' && Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizeHeader_(h) {
  return String(h).replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Prevents formula / CSV injection: "=HYPERLINK(...)" is stored as plain text. */
function safeCell_(v) {
  if (typeof v !== 'string') return v;
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function shortId_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
}

// ============================================================================
// ONE-TIME SETUP — run manually from the editor (select function → ▶ Run)
// ============================================================================

/** Creates the sheet if needed, writes missing headers, formats it. Safe to run many times. */
function setupSheet() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('RECEIPT_FOLDER_ID')) {
    properties.setProperty('RECEIPT_FOLDER_ID', DriveApp.createFolder('WACCI 2026 Payment Receipts').getId());
  }
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  const wanted = COLUMNS.map(function (c) { return c.title; }).concat(Object.keys(ORGANIZER_DEFAULTS));

  if (sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, wanted.length).setValues([wanted]);
  } else {
    // Append only the headers that are missing; never reorder or delete existing ones.
    const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(normalizeHeader_);
    const missing = wanted.filter(function (t) { return existing.indexOf(normalizeHeader_(t)) === -1; });
    if (missing.length > 0) {
      sheet.getRange(1, sheet.getLastColumn() + 1, 1, missing.length).setValues([missing]);
    }
  }

  const width = sheet.getLastColumn();
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#073A4B').setFontColor('#FFFFFF');

  const map = getHeaderMap_(sheet);
  const tsCol = map.index[normalizeHeader_('Timestamp')] + 1;
  sheet.getRange(2, tsCol, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.autoResizeColumns(1, width);

  console.log('Sheet "' + CONFIG.SHEET_NAME + '" ready with ' + width + ' columns. Timezone: ' + ss.getSpreadsheetTimeZone());
}

// ============================================================================
// TESTS — run manually from the editor
// ============================================================================

/** Validation-only tests. Writes nothing. Every line in the log must say PASS. */
function runSelfTests() {
  const base = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    institution: 'Universidad Industrial de Santander',
    country: 'Colombia',
    authorStatus: 'presenting_author',
    paperIds: '12, 34',
    position: 'student',
    travelGrant: 'yes',
    feeWaiver: 'no',
    codeOfConduct: 'accept',
    feeOption: 'advanced',
  };
  const w = function (overrides) { return Object.assign({}, base, overrides); };

  const cases = [
    ['valid presenting author (student)', w({}), true],
    ['valid non-author drops author fields', w({ authorStatus: 'not_author', paperIds: '', position: '' }), true],
    ['valid professor drops travel grant', w({ position: 'professor', travelGrant: 'yes' }), true],
    ['travel grant required for student', w({ travelGrant: '' }), false, 'travelGrant'],
    ['funding not required for postdoc', w({ position: 'postdoc', travelGrant: '', feeWaiver: '' }), true],
    ['fee waiver required for student', w({ feeWaiver: '' }), false, 'feeWaiver'],
    ['invalid fee waiver value', w({ feeWaiver: 'maybe' }), false, 'feeWaiver'],
    ['fee waiver independent of travel grant', w({ travelGrant: 'no', feeWaiver: 'yes' }), true],
    ['travel grant not required for professor', w({ position: 'professor', travelGrant: '' }), true],
    ['country required', w({ country: '' }), false, 'country'],
    ['Chilean student skips travel grant', w({ country: 'Chile', travelGrant: '' }), true],
    ['Chilean student still needs waiver answer', w({ country: 'Chile', travelGrant: '', feeWaiver: '' }), false, 'feeWaiver'],
    ['paper IDs with # and ;', w({ paperIds: '#12; 34 / 56' }), true],
    ['missing name', w({ fullName: ' ' }), false, 'fullName'],
    ['invalid email', w({ email: 'not-an-email' }), false, 'email'],
    ['missing institution', w({ institution: '' }), false, 'institution'],
    ['name too long', w({ fullName: new Array(200).join('a') }), false, 'fullName'],
    ['unknown author status', w({ authorStatus: 'maybe' }), false, 'authorStatus'],
    ['author without paper IDs', w({ paperIds: '' }), false, 'paperIds'],
    ['paper IDs with letters', w({ paperIds: 'paper twelve' }), false, 'paperIds'],
    ['author without position', w({ position: '' }), false, 'position'],
    ['invalid travel grant value', w({ travelGrant: 'maybe' }), false, 'travelGrant'],
    ['code of conduct declined', w({ codeOfConduct: 'decline' }), false, 'codeOfConduct'],
    ['missing fee option', w({ feeOption: '' }), false, 'feeOption'],
    ['prototype key as option', w({ feeOption: 'toString' }), false, 'feeOption'],
  ];

  let failures = 0;
  cases.forEach(function (c) {
    const r = validate_(c[1]);
    let pass = r.ok === c[2];
    if (pass && !c[2]) pass = Boolean(r.fieldErrors && r.fieldErrors[c[3]]);
    if (!pass) failures++;
    console.log((pass ? 'PASS ' : 'FAIL ') + c[0] + (pass ? '' : ' → ' + JSON.stringify(r)));
  });

  // Normalization checks
  const nonAuthor = validate_(w({ authorStatus: 'not_author' }));
  check_('non-author fields cleared', nonAuthor.ok && nonAuthor.data.paperIds === '' && nonAuthor.data.position === '' && nonAuthor.data.travelGrant === '' && nonAuthor.data.feeWaiver === '') || failures++;
  const prof = validate_(w({ position: 'professor' }));
  check_('professor travel grant cleared', prof.ok && prof.data.travelGrant === '' && prof.data.feeWaiver === '') || failures++;
  const ids = validate_(w({ paperIds: '12,12, 34' }));
  check_('paper IDs normalized + deduped', ids.ok && ids.data.paperIds === '12, 34') || failures++;
  check_('email lowercased', validate_(w({ email: 'ADA@Example.COM' })).data.email === 'ada@example.com') || failures++;
  check_('formula injection neutralized', safeCell_('=HYPERLINK("x")') === "'=HYPERLINK(\"x\")") || failures++;
  check_('bad JSON rejected', parseRequest_({ postData: { contents: '{bad' } }).code === 'BAD_REQUEST') || failures++;
  check_('empty request rejected', parseRequest_({}).code === 'BAD_REQUEST') || failures++;

  // Sheet structure
  try {
    getHeaderMap_(getSheet_());
    check_('sheet headers OK', true);
  } catch (err) {
    check_('sheet headers OK → ' + err.message, false);
    failures++;
  }

  console.log(failures === 0 ? '✅ ALL TESTS PASSED' : '❌ ' + failures + ' TEST(S) FAILED');
}

/**
 * End-to-end test through doPost: writes one row, checks idempotency and duplicate
 * detection, then DELETES the test row. Run it after setupSheet() and before deploying.
 */
function runEndToEndTest() {
  const email = 'e2e-test-' + Date.now() + '@example.com';
  const token = 'e2e-' + Utilities.getUuid();
  const payload = {
    submissionToken: token,
    fullName: 'E2E Test',
    email: email,
    institution: '=1+1 Test Institution',
    country: 'Colombia',
    authorStatus: 'author',
    paperIds: '7',
    position: 'postdoc',
    travelGrant: 'no',
    codeOfConduct: 'accept',
    feeOption: 'later',
  };
  const post = function (obj) {
    const out = doPost({ postData: { contents: JSON.stringify(obj), type: 'text/plain' }, parameter: {} });
    return JSON.parse(out.getContent());
  };

  const first = post(payload);
  check_('first submission ok', first.ok === true);

  const retry = post(payload);
  check_('retry with same token is idempotent', retry.ok === true && retry.alreadyProcessed === true && retry.submissionId === first.submissionId);

  const dup = post(Object.assign({}, payload, { submissionToken: 'e2e-' + Utilities.getUuid() }));
  check_('duplicate email rejected', CONFIG.REJECT_DUPLICATE_EMAILS ? dup.code === 'DUPLICATE_EMAIL' : dup.ok === true);

  // Clean up every row written by this test.
  const sheet = getSheet_();
  const map = getHeaderMap_(sheet);
  const emailCol = map.index[normalizeHeader_('Email')] + 1;
  const instCol = map.index[normalizeHeader_('Institution')] + 1;
  for (let r = sheet.getLastRow(); r >= 2; r--) {
    if (sheet.getRange(r, emailCol).getDisplayValue() === email) {
      check_('formula stored as text', sheet.getRange(r, instCol).getFormula() === '');
      sheet.deleteRow(r);
    }
  }
  CacheService.getScriptCache().remove('reg_' + token);
  console.log('E2E test finished; test rows deleted.');
}

function check_(name, ok) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name);
  return ok;
}

/**
 * After a load test (emails "loadtest+…@example.com"): checks the rows are intact and
 * deletes them. Run from the editor. Does NOT touch real registrations.
 * Logs: rows found, duplicate Submission IDs, blank rows inside the data, then deletes.
 */
function verifyAndDeleteLoadTestRows() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // don't race with real submissions while deleting
  try {
    const sheet = getSheet_();
    const map = getHeaderMap_(sheet);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return console.log('Sheet has no data rows.');

    const data = sheet.getRange(2, 1, lastRow - 1, map.width).getDisplayValues();
    const emailIdx = map.index[normalizeHeader_('Email')];
    const idIdx = map.index[normalizeHeader_('Submission ID')];

    const testRows = []; // 1-based sheet row numbers
    const ids = {};
    let duplicateIds = 0;
    let blankRows = 0;
    data.forEach(function (r, i) {
      if (r.every(function (c) { return c === ''; })) blankRows++;
      if (String(r[emailIdx]).indexOf('loadtest+') === 0) {
        testRows.push(i + 2);
        if (ids[r[idIdx]]) duplicateIds++;
        ids[r[idIdx]] = true;
      }
    });

    console.log('Load-test rows found: ' + testRows.length);
    check_('no duplicate Submission IDs', duplicateIds === 0);
    check_('no blank rows inside the data (' + blankRows + ')', blankRows === 0);

    // Delete bottom-up in contiguous blocks (fast and keeps row numbers valid).
    let i = testRows.length - 1;
    while (i >= 0) {
      let start = testRows[i];
      let count = 1;
      while (i - count >= 0 && testRows[i - count] === start - 1) {
        start--;
        count++;
      }
      sheet.deleteRows(start, count);
      i -= count;
    }
    console.log('Deleted ' + testRows.length + ' load-test rows.');
  } finally {
    lock.releaseLock();
  }
}

/**
 * WACCI 2026 — Registration backend (Google Apps Script Web App) — FASTER SAVES VERSION
 * ---------------------------------------------------------------------------
 * ⚠️  This file REPLACES Code.gs. In the Apps Script editor, select all the code in Code.gs
 *     and paste this file over it. Do NOT add it as a second file: both define doPost(),
 *     doGet(), CONFIG… and the project would break or behave unpredictably.
 *
 * Difference from Code.gs: everything that does not need the "one at a time" lock
 * (open the sheet, read the header row, build the row, generate the ID) now runs BEFORE
 * taking the lock, in parallel for all requests. Inside the lock only the steps that must
 * be serialized remain:
 *     idempotency check → duplicate-email check (TextFinder) → appendRow → flush → save token
 * Each execution logs how long it waited for the lock and how long it held it
 * (Executions → click a doPost run), so you can compare with the old version.
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
  SEND_CONFIRMATION_EMAIL: false, // email the registrant a copy
  ORGANIZER_NOTIFY_EMAIL: '', // e.g. 'wacci2026@gmail.com' — empty = disabled
  CONTACT_EMAIL: 'wacci2026@gmail.com',

  // Text shown in the sheet / emails. Keep in sync with src/lib/registration.ts.
  ADVANCED_FEE: 'US$100',
  STANDARD_FEE: 'US$130',
  ADVANCED_DEADLINE: 'November 11',
  RECEIPT_UPLOAD_URL: 'https://forms.gle/JUQLd4nAq2gkP4tq5',

  LOCK_TIMEOUT_MS: 25000,
  MAX_PAYLOAD_CHARS: 10000,
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
  { key: 'codeOfConduct', title: 'Code of Conduct' },
  { key: 'feeOption', title: 'Registration Fee' },
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
  travelGrant: {
    yes: 'Yes',
    no: 'No',
  },
  codeOfConduct: {
    accept: 'Yes, I accept',
    decline: 'No, I don’t accept',
  },
  feeOption: {
    advanced: 'Advanced fee (' + CONFIG.ADVANCED_FEE + ' before ' + CONFIG.ADVANCED_DEADLINE + ')',
    later: 'Pay later (' + CONFIG.STANDARD_FEE + ')',
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
    codeOfConduct: str_(input.codeOfConduct),
    feeOption: str_(input.feeOption),
  };

  if (d.fullName.length < 2) errors.fullName = 'Please enter your full name.';
  else if (d.fullName.length > LIMITS.fullName) errors.fullName = 'Maximum ' + LIMITS.fullName + ' characters.';

  if (!d.email) errors.email = 'Please enter your email.';
  else if (d.email.length > LIMITS.email || !EMAIL_REGEX.test(d.email)) errors.email = 'Please enter a valid email address.';

  if (!d.institution) errors.institution = 'Please enter your institution or company.';
  else if (d.institution.length > LIMITS.institution) errors.institution = 'Maximum ' + LIMITS.institution + ' characters.';

  if (d.country.length > LIMITS.country) errors.country = 'Maximum ' + LIMITS.country + ' characters.';

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

    const asksGrant = d.position === 'student' || d.position === 'postdoc';
    if (asksGrant) {
      // Required when asked (only the Country question is optional).
      if (!has_(OPTIONS.travelGrant, d.travelGrant)) errors.travelGrant = 'Please select an option.';
    } else {
      d.travelGrant = ''; // Professors are not asked (Google Form skip logic).
    }
  } else {
    // Non-authors skip the Attendance and Travel Grant sections.
    d.paperIds = '';
    d.position = '';
    d.travelGrant = '';
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
  const cache = CacheService.getScriptCache();
  const cacheKey = token ? 'reg_' + token : '';

  // ---- Phase 1: OUTSIDE the lock (runs in parallel for every request) -------------------

  // Fast path: a retry of an already-saved submission doesn't need the lock at all.
  const early = cachedResponse_(cache, cacheKey);
  if (early) return early;

  const sheet = getSheet_();
  const headerMap = getHeaderMap_(sheet); // header row doesn't change during a submission
  const emailColA1 = columnLetter_(headerMap.index[normalizeHeader_('Email')] + 1);
  const tsIdx = headerMap.index[normalizeHeader_('Timestamp')];

  const submissionId = 'WACCI-' + shortId_();
  const values = {
    timestamp: '', // set inside the lock so the sheet stays in chronological order
    submissionId: submissionId,
    fullName: d.fullName,
    email: d.email,
    institution: d.institution,
    country: d.country,
    authorStatus: OPTIONS.authorStatus[d.authorStatus],
    paperIds: d.paperIds,
    position: d.position ? OPTIONS.position[d.position] : '',
    travelGrant: d.travelGrant ? OPTIONS.travelGrant[d.travelGrant] : '',
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

  // ---- Phase 2: INSIDE the lock (only what must be one-at-a-time) -----------------------
  const lock = LockService.getScriptLock();
  const waitStart = Date.now();
  if (!lock.tryLock(CONFIG.LOCK_TIMEOUT_MS)) {
    console.warn('Could not obtain lock within ' + CONFIG.LOCK_TIMEOUT_MS + ' ms.');
    return fail_('BUSY', 'The server is busy right now. Please try again in a few seconds.');
  }
  const heldStart = Date.now();

  try {
    // Re-check: an identical request may have finished while we were waiting.
    const cached = cachedResponse_(cache, cacheKey);
    if (cached) return cached;

    if (CONFIG.REJECT_DUPLICATE_EMAILS && emailExistsFast_(sheet, emailColA1, d.email)) {
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

    row[tsIdx] = new Date();
    sheet.appendRow(row);
    SpreadsheetApp.flush(); // the next request's duplicate check must see this row

    const response = { ok: true, submissionId: submissionId };
    if (cacheKey) {
      // Kept inside the lock: otherwise a retry arriving right now would get DUPLICATE_EMAIL
      // instead of "already processed".
      try {
        cache.put(cacheKey, JSON.stringify(response), CONFIG.IDEMPOTENCY_TTL_SECONDS);
      } catch (err) {
        console.warn('Could not cache idempotency key: ' + err);
      }
    }
    console.log(
      'Registered ' + submissionId + ' (' + d.email + ') — waited ' + (heldStart - waitStart) +
        ' ms, held lock ' + (Date.now() - heldStart) + ' ms'
    );
    return response;
  } finally {
    lock.releaseLock();
  }
}

function cachedResponse_(cache, cacheKey) {
  if (!cacheKey) return null;
  const cached = cache.get(cacheKey);
  if (!cached) return null;
  const previous = JSON.parse(cached);
  previous.alreadyProcessed = true;
  return previous;
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

/**
 * Duplicate check with a single server-side search on the Email column
 * (instead of getLastRow() + downloading the whole column). Emails are stored lowercase
 * and TextFinder is case-insensitive by default; matchEntireCell avoids partial matches
 * (ana@x.co vs hana@x.co). The header cell "Email" can never match an address.
 */
function emailExistsFast_(sheet, emailColA1, email) {
  return (
    sheet
      .getRange(emailColA1 + ':' + emailColA1)
      .createTextFinder(email)
      .matchEntireCell(true)
      .findNext() !== null
  );
}

/** 1 → A, 26 → Z, 27 → AA */
function columnLetter_(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// ============================================================================
// EMAILS (optional, never break the registration)
// ============================================================================

function sendEmails_(d, submissionId) {
  if (CONFIG.SEND_CONFIRMATION_EMAIL) {
    try {
      if (MailApp.getRemainingDailyQuota() > 0) {
        MailApp.sendEmail({
          to: d.email,
          replyTo: CONFIG.CONTACT_EMAIL,
          subject: 'WACCI 2026 — Registration received (' + submissionId + ')',
          body:
            'Dear ' + d.fullName + ',\n\n' +
            'Thank you for registering for WACCI 2026 (Pucón, Chile, December 14–17, 2026).\n' +
            'Your reference is ' + submissionId + '.\n\n' +
            'You will receive a link to the registration payment shortly. Please check your spam folder, just in case.\n' +
            'After making the payment, upload your receipt here: ' + CONFIG.RECEIPT_UPLOAD_URL + '\n\n' +
            'Questions: ' + CONFIG.CONTACT_EMAIL + '\n\nWACCI 2026 Organizing Committee',
        });
      } else {
        console.warn('Mail quota exhausted; confirmation not sent to ' + d.email);
      }
    } catch (err) {
      console.error('Confirmation email failed for ' + d.email + ': ' + err);
    }
  }

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
    codeOfConduct: 'accept',
    feeOption: 'advanced',
  };
  const w = function (overrides) { return Object.assign({}, base, overrides); };

  const cases = [
    ['valid presenting author (student)', w({}), true],
    ['valid non-author drops author fields', w({ authorStatus: 'not_author', paperIds: '', position: '' }), true],
    ['valid professor drops travel grant', w({ position: 'professor', travelGrant: 'yes' }), true],
    ['travel grant required for student', w({ travelGrant: '' }), false, 'travelGrant'],
    ['travel grant required for postdoc', w({ position: 'postdoc', travelGrant: '' }), false, 'travelGrant'],
    ['travel grant not required for professor', w({ position: 'professor', travelGrant: '' }), true],
    ['country optional', w({ country: '' }), true],
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
  check_('non-author fields cleared', nonAuthor.ok && nonAuthor.data.paperIds === '' && nonAuthor.data.position === '' && nonAuthor.data.travelGrant === '') || failures++;
  const prof = validate_(w({ position: 'professor' }));
  check_('professor travel grant cleared', prof.ok && prof.data.travelGrant === '') || failures++;
  const ids = validate_(w({ paperIds: '12,12, 34' }));
  check_('paper IDs normalized + deduped', ids.ok && ids.data.paperIds === '12, 34') || failures++;
  check_('email lowercased', validate_(w({ email: 'ADA@Example.COM' })).data.email === 'ada@example.com') || failures++;
  check_('column letters', columnLetter_(1) === 'A' && columnLetter_(26) === 'Z' && columnLetter_(27) === 'AA' && columnLetter_(53) === 'BA') || failures++;
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
    country: '',
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

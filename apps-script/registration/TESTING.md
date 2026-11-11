# WACCI 2026 — Registration Test Plan

Run these **before announcing the form**, and again after every change to `Code.gs`
(new deployment version) or to the form.

Use emails like `test+01@example.com` so test rows are easy to find and delete afterwards.

---

## 0. Inside the Apps Script editor (no deployment needed)

| # | Run | Expected |
|---|---|---|
| 0.1 | `setupSheet` | Log: `Sheet "Registrations" ready with 13 columns` |
| 0.2 | `runSelfTests` | Every line `PASS`, last line `✅ ALL TESTS PASSED` |
| 0.3 | `runEndToEndTest` | `PASS first submission ok`, `PASS retry … idempotent`, `PASS duplicate email rejected`, `PASS formula stored as text`; sheet unchanged afterwards |

## 1. Endpoint tests from a terminal (after deploying)

```bash
URL="https://script.google.com/macros/s/XXXXXXXX/exec"   # your /exec URL
```

`-L` is required: Apps Script answers with a redirect to `script.googleusercontent.com`.

### 1.1 Health check
```bash
curl -sL "$URL"
# {"ok":true,"service":"wacci-2026-registration","time":"..."}
```
❗ If you get HTML (a Google login page) → access is not set to **Anyone**.

### 1.2 Valid registration (author, student, travel grant)
```bash
curl -sL -H 'Content-Type: text/plain;charset=utf-8' "$URL" -d '{
  "submissionToken":"curl-test-0001",
  "fullName":"Test Student","email":"test+01@example.com","institution":"UIS","country":"Colombia",
  "authorStatus":"presenting_author","paperIds":"12, 34","position":"student","travelGrant":"yes",
  "codeOfConduct":"accept","feeOption":"advanced"}'
# {"ok":true,"submissionId":"WACCI-XXXXXXXX"}
```
Check the sheet: `Paper IDs` shows `12, 34` (left-aligned text), `Payment Status` = `Pending`.

### 1.3 Retry with the same token → no second row
Run **exactly** the command from 1.2 again.
```
{"ok":true,"submissionId":"<same ID as before>","alreadyProcessed":true}
```
Sheet still has **one** row for `test+01`.

### 1.4 Duplicate email (new token)
Change only `"submissionToken":"curl-test-0002"` and resend.
```
{"ok":false,"code":"DUPLICATE_EMAIL",...,"fieldErrors":{"email":"This email is already registered."}}
```

### 1.5 Validation errors
```bash
curl -sL -H 'Content-Type: text/plain' "$URL" -d '{"fullName":"","email":"nope","authorStatus":"author","paperIds":"abc","codeOfConduct":"decline"}'
```
Expected `code: VALIDATION_ERROR` with `fieldErrors` for `fullName`, `email`, `institution`,
`paperIds`, `position`, `codeOfConduct`, `feeOption`. **No row written.**

### 1.6 Branching is enforced on the server
```bash
curl -sL -H 'Content-Type: text/plain' "$URL" -d '{
  "fullName":"Non Author","email":"test+02@example.com","institution":"X",
  "authorStatus":"not_author","paperIds":"99","position":"student","travelGrant":"yes",
  "codeOfConduct":"accept","feeOption":"later"}'
```
`ok:true`, but in the sheet `Paper IDs`, `Position`, `Travel Grant` are **empty**.
Repeat with `authorStatus:"author", position:"professor", travelGrant:"yes"` (new email) →
`Travel Grant` empty.

### 1.7 Formula injection
```bash
curl -sL -H 'Content-Type: text/plain' "$URL" -d '{
  "fullName":"=HYPERLINK(\"http://evil\",\"x\")","email":"test+03@example.com","institution":"+1+1",
  "authorStatus":"not_author","codeOfConduct":"accept","feeOption":"later"}'
```
The cells show the literal text `=HYPERLINK(...)` and `+1+1`, **not** a link or `2`.

### 1.8 Garbage / oversized input
```bash
curl -sL -H 'Content-Type: text/plain' "$URL" -d '{bad json'           # BAD_REQUEST
curl -sL -H 'Content-Type: text/plain' "$URL" -d '[1,2,3]'             # BAD_REQUEST
head -c 20000 /dev/zero | tr '\0' 'a' | sed 's/^/{"x":"/;s/$/"}/' \
  | curl -sL -H 'Content-Type: text/plain' "$URL" --data-binary @-     # PAYLOAD_TOO_LARGE
```

### 1.9 Honeypot (bot)
Send the body of 1.2 with a new email and `"website":"http://spam"` → `ok:true`, **no row** written.

### 1.10 Concurrency (20 simultaneous registrations)
```bash
seq -w 1 20 | xargs -P 20 -I{} curl -sL -H 'Content-Type: text/plain' "$URL" -d '{
  "fullName":"Load {}","email":"load+{}@example.com","institution":"X",
  "authorStatus":"not_author","codeOfConduct":"accept","feeOption":"later"}'
```
Expected: 20 × `ok:true` (a few `BUSY` are acceptable — the site tells the user to retry).
Sheet: exactly 20 new rows, **none overwritten, no blank rows**, 20 different Submission IDs.

### 1.11 Broken sheet → graceful failure
1. Rename header `Email` → `E-mail`. Send 1.2 with a new email → `code: SERVER_ERROR`
   with a friendly message; *Executions* log shows `Missing header(s) in row 1: Email`.
2. Rename it back, resend → `ok:true`.
3. Move the `Country` column to the end and add a column `Notes` → resend → values still land in
   the correct columns.

## 2. Website tests (browser)

Run locally first (`NEXT_PUBLIC_REGISTRATION_ENDPOINT=<url> npm run dev` → `/registration`),
then on the deployed GitHub Pages site.

| # | Action | Expected |
|---|---|---|
| 2.1 | Click **Submit** with everything empty | Inline errors under each required field, focus jumps to *Full Name*, **no network request** (DevTools → Network). |
| 2.2 | Choose *No, I am not* | *Attendance* and *Travel Grant* sections disappear. |
| 2.3 | Choose *Yes, I am an author* → *Professor* | Paper IDs + Position shown, Travel Grant **hidden**. |
| 2.4 | Switch to *Student*, leave Travel Grant empty, submit | Travel Grant appears marked `*`; error *Please select an option.* — nothing sent. |
| 2.5 | Fill Paper IDs then switch to *No, I am not* and submit | Row has empty Paper IDs / Position (hidden answers not sent). |
| 2.6 | Paper IDs = `paper 12` | Error *Use numbers only…* |
| 2.7 | Choose *No, I don’t accept* (Code of Conduct) | Error: accepting is required; nothing sent. |
| 2.8 | Valid submission | Spinner + button disabled → success panel with `WACCI-XXXXXXXX`, receipt link works, **one** row in the sheet with the same ID. |
| 2.9 | Double-click **Submit** fast | Still only **one** row. |
| 2.10 | Register the same email again | Red message *already registered*, error under *Email*. |
| 2.11 | DevTools → Network → **Offline**, submit | *Could not reach the registration server…*; go back online, submit again → success, **one** row. |
| 2.12 | DevTools → Network → **Slow 3G**, submit | Works (may take ~10 s); no duplicate row. |
| 2.13 | Check DevTools **Console** during a submit | No CORS errors. |
| 2.14 | Build without the env var (`npm run build`) | Banner *Online registration is not open yet*; submit shows contact message. |
| 2.15 | Mobile (≈375 px wide) | Form readable, no horizontal scroll, radio buttons easy to tap. |
| 2.16 | Keyboard only (Tab / Space / Enter) | Every field reachable, radios selectable, can submit. |
| 2.17 | Name/Institution with accents & ñ (`José Muñoz`, `Universidad de Concepción`) | Stored correctly in the sheet. |
| 2.18 | Email with capitals `Ana@UIS.edu.co` | Stored lowercase; re-registering `ana@uis.edu.co` is detected as duplicate. |

## 3. Production deployment checklist

- [ ] `runSelfTests` and `runEndToEndTest` pass.
- [ ] Web App access = **Anyone**, Execute as = **Me**, URL ends in **`/exec`**.
- [ ] Health check (1.1) returns JSON from a private/incognito window.
- [ ] `NEXT_PUBLIC_REGISTRATION_ENDPOINT` set in the GitHub Actions build (or the fallback in
      `src/lib/registration.ts`) — the success test 2.8 passes **on the live site**.
- [ ] Fees, deadline and receipt-upload link updated for 2026 in **both**
      `src/lib/registration.ts` and `CONFIG` in `Code.gs`.
- [ ] All test rows (`test+…`, `load+…`) deleted from the sheet.
- [ ] Sheet shared only with the organizing committee.
- [ ] After any later `Code.gs` edit: *Manage deployments → Edit → New version* (same URL), then
      repeat 1.1 and 1.2.

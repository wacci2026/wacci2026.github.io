# WACCI 2026 — Registration Sheet Setup

How the Google Sheet must be structured so the registration form on the website
(`src/app/(site)/registration/registration-form.tsx`) can write to it through
`apps-script/registration/Code.gs`.

```
Website form ──POST JSON──▶ Apps Script Web App (/exec) ──appendRow──▶ Sheet "Registrations"
```

---

## 1. The sheet (tab)

| Setting | Required value | Notes |
|---|---|---|
| Tab name | `Registrations` | Exact, case-sensitive. Change `CONFIG.SHEET_NAME` in `Code.gs` if you rename it. |
| Row 1 | Header row (table below) | Data starts at row 2. **Nothing above the headers.** |
| Frozen rows | 1 | `setupSheet()` does this for you. |

> The easiest way: create an empty spreadsheet, paste `Code.gs`, run **`setupSheet`**.
> It creates the tab, writes the headers and formats them. It is safe to run again later:
> it only **adds** missing headers and never deletes or reorders anything.

## 2. Header row (row 1)

The script finds columns **by header text, not by position**. That means:

- ✅ You can reorder columns.
- ✅ You can add your own columns (e.g. `Invoice #`, `Notes`) — the script leaves them empty.
- ✅ Header matching ignores upper/lower case and extra spaces.
- ❌ You **cannot rename or delete** a required header — every registration will fail with
  `SERVER_ERROR` and the Executions log will say `Missing header(s) in row 1: …`.

### Required columns (written by the script)

| # | Header (exact text) | Example value | Content |
|---|---|---|---|
| A | `Timestamp` | `2026-11-10 14:37:01` | Date/time the row was saved (spreadsheet timezone). |
| B | `Submission ID` | `WACCI-7381A552` | Unique reference shown to the registrant. |
| C | `Full Name` | `Ana Pérez` | Extra spaces collapsed. Max 120 chars. |
| D | `Email` | `ana@uis.edu.co` | Always **lowercase**. Used for the duplicate check. |
| E | `Institution` | `Universidad Industrial de Santander` | Max 200 chars. |
| F | `Country` | `Colombia` | Required country/territory selected from the dropdown. |
| G | `Author Status` | `Yes, I am a presenting author` | One of the 3 labels below. |
| H | `Paper IDs` | `12, 34` | EasyChair IDs, stored as **text**. Empty for non-authors. |
| I | `Position` | `Postdoc` | Empty for non-authors. |
| J | `Travel Grant` | `Yes` | Required for student authors outside Chile; empty for Chilean students and everyone else (not asked). |
| K | `Registration Fee Waiver` | `No` | Required for student authors; empty for everyone else. |
| L | `Code of Conduct` | `Yes, I accept` | Always this value (declining blocks the registration). |
| M | `Registration Fee` | `Advance fee (US$150 by 30 November 2026)` | One of the 2 labels below. |

Additional required headers (appended automatically by `setupSheet()`):

| Header | Content |
|---|---|
| `Receipt Upload Token` | Private upload credential. Keep this column and the spreadsheet restricted to organizers. |
| `Payment Receipt PDF` | Link to the PDF stored in a private Google Drive folder. Empty until uploaded. |
| `Receipt Uploaded At` | Timestamp of receipt upload. |

### Optional organizer column

| Header | Default written | Purpose |
|---|---|---|
| `Payment Status` | `Pending` | For you to update by hand (`Paid`, `Waived`…). Remove the header if you don't want it. |

### Values written to the sheet

| Column | Possible values |
|---|---|
| Author Status | `Yes, I am a presenting author` · `Yes, I am an author` · `No, I am not` |
| Position | `Student` · `Postdoc` · `Professor` · *(empty)* |
| Travel Grant | `Yes` · `No` · *(empty)* |
| Registration Fee Waiver | `Yes` · `No` · *(empty)* |
| Code of Conduct | `Yes, I accept` |
| Registration Fee | `Advance fee (US$150 by 30 November 2026)` · `Pay after 30 November 2026 (US$180)` |

Branching (same as the original Google Form):

```
Author Status = "No, I am not"  → Paper IDs, Position, Travel Grant, Registration Fee Waiver are empty
Position      = "Professor" or "Postdoc" → Travel Grant and Registration Fee Waiver are empty
```

## 3. Rules to avoid breaking the connection

1. **Don't edit row 1 required headers.** Add new columns freely, rename none.
2. **Don't rename the tab** unless you also change `CONFIG.SHEET_NAME` and deploy a new version.
3. **Don't put anything above the header row** or merge cells in row 1.
4. **Don't type in the empty rows below the data** (not even a space or a formula). New rows are
   appended after the **last row that has any content**, so a stray value at row 900 means new
   registrations land at row 901.
5. **Don't turn the range into a filter view with "sort range"** that moves row 1. Sorting with a
   filter (header row excluded) is fine.
6. **Don't use the `Email` column for anything else** — it's read to detect duplicate registrations.
7. **Sharing**: the Web App runs *as you* (the deployer). Registrants don't need access to the sheet.
   Keep the sheet private to the organizing committee.
8. **Changing `Code.gs` requires a new deployment version** (Deploy → Manage deployments → ✏️ →
   *New version*). Use *Manage deployments* (not *New deployment*) so the `/exec` URL stays the same.
9. To change fees/deadline: edit `CONFIG` in `Code.gs` **and** `REGISTRATION_INFO` in
   `src/lib/registration.ts`, then redeploy both.
10. **Option keys must match.** The website sends keys (`presenting_author`, `student`, `advanced`…)
    defined in `src/lib/registration.ts`; `Code.gs` (`OPTIONS`) accepts only those keys.

## 4. Deployment step by step

1. Create the spreadsheet (organizing-committee Google account, e.g. `wacci2026@gmail.com`).
2. **Extensions → Apps Script**. Delete the default code, paste `Code.gs`, save (💾).
3. **Project Settings (⚙️)**: Runtime = *Chrome V8* (default). Optionally set the Time zone to
   `America/Santiago`. Also check **File → Settings → Time zone** of the spreadsheet itself.
4. Select **`setupSheet`** → **Run**. Accept the authorization prompt
   (*Advanced → Go to project (unsafe)* is normal for your own scripts).
5. Select **`runSelfTests`** → Run → *Execution log* must end in `✅ ALL TESTS PASSED`.
6. Select **`runEndToEndTest`** → Run → all lines `PASS`; it deletes its own test row.
7. **Deploy → New deployment → ⚙️ Web app**
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone** ← *not* "Anyone with Google account", or the site gets a login page
     instead of JSON and every submission fails.
8. Copy the **Web app URL** (ends in `/exec`, **not** `/dev`).
9. Put it in the website, either:
   - **recommended:** GitHub repo → *Settings → Secrets and variables → Actions → Variables* →
     new variable `REGISTRATION_ENDPOINT` = `<url>`. The Pages workflow passes it to the build as
     `NEXT_PUBLIC_REGISTRATION_ENDPOINT`. Re-run the workflow after setting it.
   - or directly as the fallback value in `src/lib/registration.ts`.

   The form only enables submission when the URL looks like
   `https://script.google.com/macros/s/<id>/exec`.
10. Run the tests in [`TESTING.md`](./TESTING.md).

## 5. Optional settings in `CONFIG`

| Key | Default | Effect |
|---|---|---|
| `SPREADSHEET_ID` | `''` | Leave empty when the script is opened from the sheet (bound script). Fill it if the script is a standalone project. |
| `REJECT_DUPLICATE_EMAILS` | `true` | Second registration with the same email gets *"This email is already registered"*. |
| `SEND_CONFIRMATION_EMAIL` | `false` | Emails the registrant a copy with the receipt-upload link. |
| `ORGANIZER_NOTIFY_EMAIL` | `''` | Email address that gets a short notice per registration. |

Gmail quotas: ~100 emails/day on a free account (1,500 on Workspace). When the quota runs out
the registration is still saved; only the email is skipped (logged as a warning).

## 6. Where to look when something fails

**Apps Script editor → Executions (☰ left menu)**. Every `doPost` call is listed with its logs.

| Log message | Cause | Fix |
|---|---|---|
| `Sheet "Registrations" not found` | Tab renamed/deleted | Rename back or run `setupSheet()` |
| `Missing header(s) in row 1: X` | Header X renamed/deleted | Restore the exact header text |
| `Header row is empty` | Row 1 cleared | Run `setupSheet()` |
| `Could not obtain lock` | Many simultaneous submissions | Usually transient; user is told to retry |
| `No spreadsheet: bind this script…` | Standalone script without ID | Set `CONFIG.SPREADSHEET_ID` |
| No execution appears at all | Wrong URL, `/dev` URL, or access ≠ *Anyone* | Recheck deployment step 7–9 |

After updating either backend script for the student funding questions, run `setupSheet()` to append the `Registration Fee Waiver` header, then deploy a new Apps Script version. Existing rows are preserved.


## Payment step and PDF receipt uploads

1. Replace the deployed script with the updated `Code.gs` **or** `Code.faster.gs` (never both).
2. Run `setupSheet()` again. It adds the receipt columns without deleting data and creates a private
   **WACCI 2026 Payment Receipts** Drive folder. Accept the new Drive authorization when prompted.
   Its ID is saved in the Script Property `RECEIPT_FOLDER_ID`. You may instead set this property to
   an existing private folder's ID. Share the folder only with committee members who review receipts;
   sharing the spreadsheet does not automatically grant access to the PDFs.
3. Publish a **new Apps Script deployment version**. Keep Execute as **Me**, access **Anyone**.
4. Configure `NEXT_PUBLIC_REGISTRATION_ENDPOINT` (the `/exec` URL) for local development or builds.
   The form enables submission when that URL is configured.
5. After a successful registration, Step 2 shows the payment QR and accepts one PDF, up to 5 MB.
   The server validates its size and PDF header, checks the registration's private upload token,
   saves the PDF in Drive, and writes its link into that same row. Retries reuse the existing receipt.
   `Payment Status` becomes **Receipt received — pending review**, never automatically **Paid**.
6. Test with a real deployment and a test registration before opening registration to attendees:
   select Chile as a student author (Travel Grant hidden, fee waiver visible), submit, upload a PDF,
   and confirm the file link and payment review status on that row. Verify unauthorized uploads fail.

### Publish the QR without committing the image

The local image is `public/local-payment/QR_pago_WACCI.png`. The whole folder is ignored by Git.
GitHub Actions restores it from the `PAYMENT_QR_BASE64` Actions secret before building the site,
so the image is included in the deployed website without being added to the repository or Git history.
The QR is publicly accessible on the published website; the secret keeps it out of source control.

From this repository directory, configure the secret once using an account with repository access:

```bash
gh auth login
base64 -w 0 public/local-payment/QR_pago_WACCI.png | gh secret set PAYMENT_QR_BASE64 --repo wacci2026/wacci2026.github.io
```

Then commit/push the workflow change and let the **Deploy to GitHub Pages** workflow finish.
For future QR changes, update the local PNG, run the secret command again, and rerun the workflow.
The build deliberately fails if the secret is missing or does not contain a PNG, preserving the
previous deployment instead of publishing another payment page with a missing QR.
After deployment, verify `https://wacci2026.github.io/local-payment/QR_pago_WACCI.png` loads.
Keep Step 2 open until the receipt upload is complete.

Local regression checks: `node tests/registration.cjs` (both backend variants, eligibility, upload
credentials, PDF rejection, same-row receipt persistence, and retries). These tests use mocks;
Apps Script authorization and actual Drive/Sheets operations must also be checked in the deployment.

'use client';

import React, { useId, useRef, useState } from 'react';
import {
  AUTHOR_STATUS_OPTIONS,
  CODE_OF_CONDUCT_OPTIONS,
  EMAIL_REGEX,
  FEE_OPTIONS,
  FIELD_LIMITS,
  POSITION_OPTIONS,
  REGISTRATION_ENDPOINT,
  REGISTRATION_INFO,
  TRAVEL_GRANT_OPTIONS,
  asksTravelGrant,
  isAuthor,
  isValidRegistrationEndpoint,
  parsePaperIds,
} from '@/lib/registration';

const REGISTRATION_ENABLED = false;
const SHOW_FEE_AGREEMENT = false;

type FormValues = {
  fullName: string;
  email: string;
  institution: string;
  country: string;
  authorStatus: string;
  paperIds: string;
  position: string;
  travelGrant: string;
  codeOfConduct: string;
  feeOption: string;
  website: string; // honeypot — must stay empty
};

type FieldName = Exclude<keyof FormValues, 'website'>;
type FieldErrors = Partial<Record<FieldName, string>>;

type ServerResponse =
  | { ok: true; submissionId: string; alreadyProcessed?: boolean }
  | {
      ok: false;
      code?: string;
      message?: string;
      fieldErrors?: FieldErrors;
    };

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; submissionId: string; email: string }
  | { kind: 'error'; message: string };

const INITIAL_VALUES: FormValues = {
  fullName: '',
  email: '',
  institution: '',
  country: '',
  authorStatus: '',
  paperIds: '',
  position: '',
  travelGrant: '',
  codeOfConduct: '',
  feeOption: '',
  website: '',
};

// Order used to focus the first invalid field.
const FIELD_ORDER: FieldName[] = [
  'fullName',
  'email',
  'institution',
  'country',
  'authorStatus',
  'paperIds',
  'position',
  'travelGrant',
  'codeOfConduct',
  'feeOption',
];

// Must be longer than the Apps Script lock wait (CONFIG.LOCK_TIMEOUT_MS = 25 s) + the write itself,
// otherwise under load the browser gives up while the server is still saving the row.
const REQUEST_TIMEOUT_MS = 45_000;

function newSubmissionToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = collapse(values.fullName);
  const email = values.email.trim();
  const institution = collapse(values.institution);
  const country = collapse(values.country);

  if (fullName.length < 2) errors.fullName = 'Please enter your full name.';
  else if (fullName.length > FIELD_LIMITS.fullName)
    errors.fullName = `Maximum ${FIELD_LIMITS.fullName} characters.`;

  if (!email) errors.email = 'Please enter your email.';
  else if (email.length > FIELD_LIMITS.email || !EMAIL_REGEX.test(email))
    errors.email = 'Please enter a valid email address.';

  if (!institution) errors.institution = 'Please enter your institution or company.';
  else if (institution.length > FIELD_LIMITS.institution)
    errors.institution = `Maximum ${FIELD_LIMITS.institution} characters.`;

  if (country.length > FIELD_LIMITS.country)
    errors.country = `Maximum ${FIELD_LIMITS.country} characters.`;

  if (!values.authorStatus) errors.authorStatus = 'Please select an option.';

  if (isAuthor(values.authorStatus)) {
    if (!values.paperIds.trim()) errors.paperIds = 'Please add the EasyChair ID of each paper.';
    else if (values.paperIds.length > FIELD_LIMITS.paperIds)
      errors.paperIds = `Maximum ${FIELD_LIMITS.paperIds} characters.`;
    else if (!parsePaperIds(values.paperIds))
      errors.paperIds = 'Use numbers only, separated by commas (e.g. 12, 34).';

    if (!values.position) errors.position = 'Please select your position.';
  }

  if (asksTravelGrant(values.authorStatus, values.position) && !values.travelGrant)
    errors.travelGrant = 'Please select an option.';

  if (!values.codeOfConduct) errors.codeOfConduct = 'Please select an option.';
  else if (values.codeOfConduct !== 'accept')
    errors.codeOfConduct = 'Accepting the Code of Conduct is required to attend WACCI 2026.';

  if (SHOW_FEE_AGREEMENT && !values.feeOption) errors.feeOption = 'Please select an option.';

  return errors;
}

/** Only send the answers to questions the user actually saw (mirrors the Google Form branching). */
function buildPayload(values: FormValues, token: string) {
  const author = isAuthor(values.authorStatus);
  const grant = asksTravelGrant(values.authorStatus, values.position);
  return {
    submissionToken: token,
    fullName: collapse(values.fullName),
    email: values.email.trim().toLowerCase(),
    institution: collapse(values.institution),
    country: collapse(values.country),
    authorStatus: values.authorStatus,
    paperIds: author ? (parsePaperIds(values.paperIds) ?? []).join(', ') : '',
    position: author ? values.position : '',
    travelGrant: grant ? values.travelGrant : '',
    codeOfConduct: values.codeOfConduct,
    feeOption: values.feeOption,
    website: values.website,
  };
}

export default function RegistrationForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // One token per "logical" submission: retries after a network error reuse it,
  // so the Apps Script can recognise a duplicate and not write a second row.
  const tokenRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId();

  const endpointConfigured = isValidRegistrationEndpoint(REGISTRATION_ENDPOINT);
  const submitting = status.kind === 'submitting';
  const showAuthorSection = isAuthor(values.authorStatus);
  const showTravelGrant = asksTravelGrant(values.authorStatus, values.position);

  function setField<K extends keyof FormValues>(name: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Answers changed → this is a new logical submission.
    tokenRef.current = null;
    if (name !== 'website' && errors[name as FieldName]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function focusFirstError(errs: FieldErrors) {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!REGISTRATION_ENABLED || submitting) return;

    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setStatus({ kind: 'idle' });
      focusFirstError(clientErrors);
      return;
    }

    if (!endpointConfigured) {
      setStatus({
        kind: 'error',
        message: `Online registration is not available yet. Please contact ${REGISTRATION_INFO.contactEmail}.`,
      });
      return;
    }

    tokenRef.current ??= newSubmissionToken();
    const payload = buildPayload(values, tokenRef.current);

    setStatus({ kind: 'submitting' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // text/plain keeps this a "simple" CORS request (no preflight), which Apps Script cannot answer.
      const res = await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: controller.signal,
      });

      let data: ServerResponse;
      try {
        data = (await res.json()) as ServerResponse;
      } catch {
        throw new Error('INVALID_RESPONSE');
      }

      if (data.ok) {
        setStatus({ kind: 'success', submissionId: data.submissionId, email: payload.email });
        setValues(INITIAL_VALUES);
        tokenRef.current = null;
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
        setErrors(data.fieldErrors);
        focusFirstError(data.fieldErrors);
      }
      // Server rejected the data → the next attempt is a new submission.
      tokenRef.current = null;
      setStatus({
        kind: 'error',
        message: data.message || 'We could not process your registration. Please review the form.',
      });
    } catch (err) {
      // Network error / timeout / non-JSON: keep the token so a retry is idempotent.
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      setStatus({
        kind: 'error',
        message: aborted
          ? 'The server took too long to respond. Please try again — you will not be registered twice.'
          : `We could not reach the registration server. Please try again in a moment or write to ${REGISTRATION_INFO.contactEmail}.`,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const errorId = (name: string) => `${idPrefix}-${name}-error`;

  return (
    <div ref={containerRef} className="scroll-mt-28">
      {status.kind === 'success' ? (
        <div className="p-6 md:p-8 space-y-6" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <span
              className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl"
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-primary-500">Registration received</h2>
              <p className="text-sm text-gray-500">
                Reference:{' '}
                <span className="font-mono font-semibold text-gray-700">{status.submissionId}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 space-y-3 text-gray-700 leading-relaxed">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-600">
              Final steps
            </h3>
            <p>
              You&apos;ll receive a link to the registration payment at{' '}
              <span className="font-semibold">{status.email}</span> shortly. Please check your spam
              folder, just in case.
            </p>
            <p>
              After making the payment, upload your receipt here:{' '}
              <a
                href={REGISTRATION_INFO.receiptUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700"
              >
                {REGISTRATION_INFO.receiptUploadUrl}
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStatus({ kind: 'idle' })}
            className="text-sm font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700"
          >
            Register another person
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="p-4 md:p-6 space-y-8"
          aria-busy={submitting}
        >
          <header className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-500">
              Registration Form
            </h2>
            <p className="text-sm text-gray-500">
              <span className="text-red-600">*</span> Indicates a required question
            </p>
          </header>

          {!endpointConfigured && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Online registration is not open yet.
            </p>
          )}

          {/* Honeypot: hidden from humans, bots tend to fill it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={fieldId('website')}>Leave this field empty</label>
            <input
              id={fieldId('website')}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(e) => setField('website', e.target.value)}
            />
          </div>

          <fieldset disabled={submitting} className="space-y-8">
            <Section title="Personal Information">
              <TextField
                id={fieldId('fullName')}
                errorId={errorId('fullName')}
                name="fullName"
                label="Full Name"
                required
                autoComplete="name"
                maxLength={FIELD_LIMITS.fullName}
                value={values.fullName}
                error={errors.fullName}
                onChange={(v) => setField('fullName', v)}
              />
              <TextField
                id={fieldId('email')}
                errorId={errorId('email')}
                name="email"
                label="Email"
                required
                type="email"
                autoComplete="email"
                maxLength={FIELD_LIMITS.email}
                value={values.email}
                error={errors.email}
                onChange={(v) => setField('email', v)}
              />
              <TextField
                id={fieldId('institution')}
                errorId={errorId('institution')}
                name="institution"
                label="Institution or Company you represent"
                required
                autoComplete="organization"
                maxLength={FIELD_LIMITS.institution}
                value={values.institution}
                error={errors.institution}
                onChange={(v) => setField('institution', v)}
              />
              <TextField
                id={fieldId('country')}
                errorId={errorId('country')}
                name="country"
                label="Country of origin"
                autoComplete="country-name"
                maxLength={FIELD_LIMITS.country}
                value={values.country}
                error={errors.country}
                onChange={(v) => setField('country', v)}
              />
            </Section>

            <Section title="Conference Authorship">
              <RadioGroup
                name="authorStatus"
                errorId={errorId('authorStatus')}
                required
                legend="Are you an author of any papers accepted at the conference?"
                options={AUTHOR_STATUS_OPTIONS}
                value={values.authorStatus}
                error={errors.authorStatus}
                onChange={(v) => setField('authorStatus', v)}
              />
            </Section>

            {showAuthorSection && (
              <Section title="Attendance">
                <TextField
                  id={fieldId('paperIds')}
                  errorId={errorId('paperIds')}
                  name="paperIds"
                  required
                  label="ID - Papers (add the EasyChair ID of each paper)"
                  hint="Separate multiple IDs with commas, e.g. 12, 34"
                  maxLength={FIELD_LIMITS.paperIds}
                  inputMode="numeric"
                  value={values.paperIds}
                  error={errors.paperIds}
                  onChange={(v) => setField('paperIds', v)}
                />
                <RadioGroup
                  name="position"
                  errorId={errorId('position')}
                  required
                  legend="What is your position?"
                  options={POSITION_OPTIONS}
                  value={values.position}
                  error={errors.position}
                  onChange={(v) => setField('position', v)}
                />
              </Section>
            )}

            {showTravelGrant && (
              <Section title="Travel Grant">
                <RadioGroup
                  name="travelGrant"
                  errorId={errorId('travelGrant')}
                  required
                  legend={`Do you want to apply for the WACCI Travel Grant (${REGISTRATION_INFO.travelGrantAmount})?`}
                  options={TRAVEL_GRANT_OPTIONS}
                  value={values.travelGrant}
                  error={errors.travelGrant}
                  onChange={(v) => setField('travelGrant', v)}
                />
              </Section>
            )}

            <Section title="Additional Comments">
              <RadioGroup
                name="codeOfConduct"
                errorId={errorId('codeOfConduct')}
                required
                legend="Do you accept the OPTICA Anti-Harassment Policy and Code of Conduct?"
                description={
                  <a
                    href={REGISTRATION_INFO.codeOfConductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700 break-all"
                  >
                    {REGISTRATION_INFO.codeOfConductUrl}
                  </a>
                }
                options={CODE_OF_CONDUCT_OPTIONS}
                value={values.codeOfConduct}
                error={errors.codeOfConduct}
                onChange={(v) => setField('codeOfConduct', v)}
              />
              {SHOW_FEE_AGREEMENT && (
                <RadioGroup
                  name="feeOption"
                  errorId={errorId('feeOption')}
                  required
                  legend={`By submitting, you agree to pay the advanced registration fee of ${REGISTRATION_INFO.advancedFee} before ${REGISTRATION_INFO.advancedDeadline}?`}
                  options={FEE_OPTIONS}
                  value={values.feeOption}
                  error={errors.feeOption}
                  onChange={(v) => setField('feeOption', v)}
                />
              )}
            </Section>
          </fieldset>

          {status.kind === 'error' && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!REGISTRATION_ENABLED || submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white text-base font-semibold rounded-[20px] shadow-lg shadow-primary-500/20 transition-all duration-300 hover:bg-primary-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {submitting ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  aria-hidden="true"
                />
                Submitting…
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary-600 border-b border-gray-100 pb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {' '}
      *
    </span>
  );
}

function TextField({
  id,
  errorId,
  name,
  label,
  value,
  onChange,
  error,
  required,
  hint,
  type = 'text',
  autoComplete,
  maxLength,
  inputMode,
}: {
  id: string;
  errorId: string;
  name: FieldName;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  hint?: string;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const hintId = `${id}-hint`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <RequiredMark />}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined
        }
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-primary-300 disabled:bg-gray-50 ${
          error ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'
        }`}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function RadioGroup({
  name,
  errorId,
  legend,
  description,
  options,
  value,
  onChange,
  error,
  required,
}: {
  name: FieldName;
  errorId: string;
  legend: string;
  description?: React.ReactNode;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <fieldset
      className="space-y-2"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
      aria-required={required}
    >
      <legend className="block text-sm font-semibold text-gray-800 mb-1">
        {legend}
        {required && <RequiredMark />}
      </legend>
      {description && <div className="text-sm">{description}</div>}
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
              value === opt.value
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-200 hover:border-primary-200'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 accent-[var(--color-primary-500)]"
            />
            <span className="text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

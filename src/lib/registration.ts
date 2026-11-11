/**
 * Shared configuration for the WACCI 2026 registration form.
 *
 * IMPORTANT: the option `value`s below MUST match the keys in
 * `apps-script/registration/Code.gs` (OPTIONS object). The Apps Script
 * rejects any value it does not know, so if you rename one here, rename it there.
 */

/**
 * Google Apps Script Web App URL (ends in `/exec`).
 * Set NEXT_PUBLIC_REGISTRATION_ENDPOINT at build time, or paste the URL as the fallback.
 * The URL ends up in the public JS bundle either way — it is not a secret.
 */
export const REGISTRATION_ENDPOINT = (process.env.NEXT_PUBLIC_REGISTRATION_ENDPOINT || '') // ← paste https://script.google.com/macros/s/XXXX/exec here if you don't use the env var
  .trim();

/** Accepts personal (`/macros/s/…`) and Google Workspace (`/a/macros/<domain>/s/…`) Web App URLs. */
export const isValidRegistrationEndpoint = (url: string) =>
  /^https:\/\/script\.google\.com\/(a\/macros\/[^/]+|macros)\/s\/[^/]+\/exec$/.test(url);

// TODO: confirm fees / deadline for 2026 — these come from the previous edition's form.
export const REGISTRATION_INFO = {
  advancedFee: 'US$100',
  standardFee: 'US$130',
  advancedDeadline: 'November 11',
  travelGrantAmount: 'US$500',
  codeOfConductUrl: 'https://www.optica.org/events/code_of_conduct/',
  // TODO: replace with the 2026 receipt-upload form if it changed.
  receiptUploadUrl: 'https://forms.gle/JUQLd4nAq2gkP4tq5',
  contactEmail: 'wacci2026@gmail.com',
} as const;

export const AUTHOR_STATUS_OPTIONS = [
  { value: 'presenting_author', label: 'Yes, I am a presenting author' },
  { value: 'author', label: 'Yes, I am an author' },
  { value: 'not_author', label: 'No, I am not' },
] as const;

export const POSITION_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'postdoc', label: 'Postdoc' },
  { value: 'professor', label: 'Professor' },
] as const;

export const TRAVEL_GRANT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const;

export const CODE_OF_CONDUCT_OPTIONS = [
  { value: 'accept', label: 'Yes, I accept' },
  { value: 'decline', label: 'No, I don’t accept' },
] as const;

export const FEE_OPTIONS = [
  { value: 'advanced', label: 'I agree' },
  {
    value: 'later',
    label: `I will pay later (${REGISTRATION_INFO.standardFee})`,
  },
] as const;

export type AuthorStatus = (typeof AUTHOR_STATUS_OPTIONS)[number]['value'];
export type Position = (typeof POSITION_OPTIONS)[number]['value'];
export type TravelGrant = (typeof TRAVEL_GRANT_OPTIONS)[number]['value'];
export type CodeOfConduct = (typeof CODE_OF_CONDUCT_OPTIONS)[number]['value'];
export type FeeOption = (typeof FEE_OPTIONS)[number]['value'];

/** Same limits as the Apps Script (LIMITS object). */
export const FIELD_LIMITS = {
  fullName: 120,
  email: 254,
  institution: 200,
  country: 100,
  paperIds: 200,
} as const;

export const isAuthor = (status: string) => status === 'presenting_author' || status === 'author';

/** Travel grant is only asked to authors who are students or postdocs. */
export const asksTravelGrant = (status: string, position: string) =>
  isAuthor(status) && (position === 'student' || position === 'postdoc');

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** EasyChair IDs: one or more numbers separated by commas, spaces, semicolons or slashes. */
export function parsePaperIds(raw: string): string[] | null {
  const tokens = raw
    .split(/[\s,;/]+/)
    .map((t) => t.replace(/^#/, ''))
    .filter(Boolean);
  if (tokens.length === 0 || tokens.some((t) => !/^\d{1,7}$/.test(t))) {
    return null;
  }
  return Array.from(new Set(tokens));
}

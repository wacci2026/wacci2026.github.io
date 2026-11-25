'use client';

import { useId, useState } from 'react';
import { FIELD_LIMITS, REGISTRATION_ENDPOINT, REGISTRATION_INFO, isValidRegistrationEndpoint } from '@/lib/registration';
import PaymentStep from './payment-step';

export default function ReceiptRecovery() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recovered, setRecovered] = useState<{ submissionId: string; receiptToken: string } | null>(null);

  async function recover(verify: boolean) {
    if (busy) return;
    setError('');
    if (!isValidRegistrationEndpoint(REGISTRATION_ENDPOINT)) {
      setError(`Receipt recovery is unavailable. Please contact ${REGISTRATION_INFO.contactEmail}.`);
      return;
    }

    setBusy(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: verify ? 'verifyReceiptRecovery' : 'requestReceiptRecovery',
          email: email.trim().toLowerCase(),
          ...(verify ? { code: code.trim() } : {}),
        }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (result.code === 'BAD_REQUEST') {
        setError(`Receipt recovery is unavailable. Please contact ${REGISTRATION_INFO.contactEmail}.`);
      } else if (!result.ok) {
        setError(result.message || 'We could not resume your receipt upload. Please try again.');
      } else if (!verify) {
        setCodeRequested(true);
      } else if (result.submissionId && result.receiptToken) {
        setRecovered({ submissionId: result.submissionId, receiptToken: result.receiptToken });
      } else {
        setError('We could not verify your code. Request a new code and try again.');
      }
    } catch {
      setError(`We could not reach the registration server. Please try again or contact ${REGISTRATION_INFO.contactEmail}.`);
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }

  return (
    <details className="mt-2">
      <summary className="cursor-pointer font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700">
        Resume receipt upload
      </summary>
      {recovered ? (
        <div className="mt-3">
          <PaymentStep
            {...recovered}
            email={email.trim().toLowerCase()}
            onRegisterAnother={() => {
              setRecovered(null);
              setCodeRequested(false);
              setEmail('');
              setCode('');
              document.getElementById('registration-form')?.scrollIntoView();
            }}
          />
        </div>
      ) : (
        <form
          className="mt-3 space-y-3 text-sm"
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault();
            void recover(codeRequested);
          }}
        >
          {codeRequested ? (
            <>
              <p role="status">
                If <strong className="break-all">{email.trim()}</strong> matches a registration with a pending receipt,
                you’ll receive a verification code. Check your inbox and spam folder.
              </p>
              <label htmlFor={`${id}-code`} className="block font-semibold">Verification code</label>
              <input
                id={`${id}-code`}
                type="text"
                autoComplete="one-time-code"
                spellCheck={false}
                required
                disabled={busy}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
            </>
          ) : (
            <>
              <label htmlFor={`${id}-email`} className="block font-semibold">Email used to register</label>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                maxLength={FIELD_LIMITS.email}
                required
                disabled={busy}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
            </>
          )}
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-60">
            {busy ? 'Please wait…' : codeRequested ? 'Verify and continue' : 'Email me a code'}
          </button>
          {codeRequested && (
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => { setCodeRequested(false); setCode(''); setError(''); }} className="font-semibold text-primary-500 underline disabled:opacity-60">
                Change email
              </button>
              <button type="button" disabled={busy} onClick={() => void recover(false)} className="font-semibold text-primary-500 underline disabled:opacity-60">
                Resend code
              </button>
            </div>
          )}
        </form>
      )}
    </details>
  );
}

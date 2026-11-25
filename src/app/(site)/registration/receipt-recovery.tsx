'use client';

import { useId, useState } from 'react';
import { FIELD_LIMITS, REGISTRATION_ENDPOINT, REGISTRATION_INFO, isValidRegistrationEndpoint, type PaymentDetails } from '@/lib/registration';

export default function ReceiptRecovery({ onRecovered }: { onRecovered: (details: PaymentDetails) => void }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function recover() {
    if (busy) return;
    setError('');
    if (!isValidRegistrationEndpoint(REGISTRATION_ENDPOINT)) {
      setError(`Receipt recovery is unavailable. Please contact ${REGISTRATION_INFO.contactEmail}.`);
      return;
    }

    const registeredEmail = email.trim().toLowerCase();
    setBusy(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'resumeReceiptUpload',
          email: registeredEmail,
        }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (result.code === 'BAD_REQUEST') {
        setError(`Receipt recovery is unavailable. Please contact ${REGISTRATION_INFO.contactEmail}.`);
      } else if (!result.ok) {
        setError(result.message || 'We could not resume your receipt upload. Please try again.');
      } else if (result.submissionId && result.receiptToken) {
        onRecovered({ submissionId: result.submissionId, receiptToken: result.receiptToken, email: registeredEmail });
      } else {
        setError('We could not resume your receipt upload. Please try again.');
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
      <form
        className="mt-3 space-y-3 text-sm"
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          void recover();
        }}
      >
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
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-60">
          {busy ? 'Checking registration…' : 'Continue to payment and receipt'}
        </button>
      </form>
    </details>
  );
}

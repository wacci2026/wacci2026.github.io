'use client';

import { useId, useState } from 'react';
import { withBasePath } from '@/lib/base-path';
import { MAX_RECEIPT_BYTES, REGISTRATION_ENDPOINT, REGISTRATION_INFO } from '@/lib/registration';

export default function PaymentStep({ submissionId, receiptToken, email, onRegisterAnother }: { submissionId: string; receiptToken: string; email: string; onRegisterAnother: () => void }) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [qrUnavailable, setQrUnavailable] = useState(false);

  async function submitReceipt(receiptBase64?: string) {
    setUploading(true);
    setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);
    try {
      const response = await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'uploadReceipt', submissionId, receiptToken, receiptBase64 }),
        redirect: 'follow',
        signal: controller.signal,
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message || 'The receipt could not be saved. Please try again.');
      setSaved(true);
      setEmailSent(result.confirmationEmailSent === true);
      if (result.confirmationEmailSent !== true) {
        setError(result.message || `Your receipt is saved. We could not confirm that your email was sent. Please retry or contact ${REGISTRATION_INFO.contactEmail}.`);
      }
    } catch (err) {
      setError(err instanceof Error && err.name !== 'AbortError'
        ? err.message
        : 'The server took too long to respond. Please retry; your registration will not be duplicated.');
    } finally {
      clearTimeout(timeout);
      setUploading(false);
    }
  }

  async function uploadReceipt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading || saved) return;
    setError('');
    if (!file || !/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
      setError('Please choose a PDF payment receipt.');
      return;
    }
    if (file.size === 0 || file.size > MAX_RECEIPT_BYTES) {
      setError('Please choose a non-empty PDF no larger than 5 MB.');
      return;
    }
    if (!receiptToken) {
      setError(`Receipt uploads are not available yet. Please contact ${REGISTRATION_INFO.contactEmail} with reference ${submissionId}.`);
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (String.fromCharCode(...bytes.slice(0, 5)) !== '%PDF-') {
        setError('This file is not a valid PDF. Please choose your PDF payment receipt.');
        return;
      }
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 8192) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
      }
      await submitReceipt(btoa(binary));
    } catch {
      setError('The selected file could not be read. Please choose your PDF receipt again.');
    } finally {
      setUploading(false);
    }
  }

  if (saved) {
    return (
      <section className="rounded-2xl border border-primary-100 bg-primary-50 p-6 md:p-8 space-y-5 text-gray-700" aria-live="polite">
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-600">Thank you for registering!</h2>
        <p>Your registration and receipt have been received. We look forward to welcoming you to WACCI 2026 in Pucón.</p>
        {emailSent ? (
          <p>A confirmation email with your registration details and a PDF attachment has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.</p>
        ) : (
          <div className="space-y-3">
            <p role="alert">{error}</p>
            <button type="button" disabled={uploading} onClick={() => submitReceipt()} className="rounded-xl bg-primary-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
              {uploading ? 'Sending confirmation…' : 'Retry confirmation email'}
            </button>
          </div>
        )}
        <p className="text-sm">Registration reference: <span className="font-mono font-semibold">{submissionId}</span></p>
        <button type="button" disabled={uploading} onClick={onRegisterAnother} className="text-sm font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700 disabled:opacity-60">
          Register another person
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-primary-50 p-5 space-y-5 text-gray-700">
      <h2 className="text-xl font-bold text-primary-600">Step 2: Payment and receipt</h2>
      <p className="text-sm">Registration reference: <span className="font-mono font-semibold">{submissionId}</span></p>
      <p>Your registration has been saved. Scan the QR code to make your payment, then upload your PDF receipt below. Keep this page open until your receipt has been uploaded.</p>
      {qrUnavailable ? (
        <p className="text-sm text-red-600">Payment QR unavailable. Please contact {REGISTRATION_INFO.contactEmail} for payment instructions.</p>
      ) : (
        // This asset is deliberately local and ignored by Git.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={withBasePath('/local-payment/QR_pago_WACCI.png')} alt="Scan this QR code to pay the WACCI registration fee" className="mx-auto w-full max-w-xs h-auto rounded-xl bg-white p-3" onError={() => setQrUnavailable(true)} />
      )}
      <form onSubmit={uploadReceipt} className="space-y-3" aria-busy={uploading}>
        <label htmlFor={id} className="block text-sm font-semibold">Upload payment receipt (PDF, maximum 5 MB)</label>
        <input id={id} type="file" accept="application/pdf,.pdf" required disabled={uploading} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(''); }} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} aria-invalid={Boolean(error)} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2" />
        <p id={`${id}-help`} className="text-sm">Your receipt will be stored for the organizing committee and linked to your registration.</p>
        {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={uploading || !file} className="rounded-xl bg-primary-500 px-5 py-3 font-semibold text-white disabled:opacity-60">{uploading ? 'Saving receipt and sending confirmation…' : 'Upload receipt'}</button>
      </form>
    </section>
  );
}

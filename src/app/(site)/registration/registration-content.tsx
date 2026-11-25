'use client';

import { useEffect, useRef, useState } from 'react';
import { REGISTRATION_INFO, type PaymentDetails } from '@/lib/registration';
import ReceiptRecovery from './receipt-recovery';
import RegistrationForm from './registration-form';

export default function RegistrationContent() {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const registrationColumn = useRef<HTMLDivElement>(null);

  function openPayment(details: PaymentDetails) {
    setPayment((current) => current ?? details);
  }

  useEffect(() => {
    if (!payment) return;
    registrationColumn.current?.focus({ preventScroll: true });
    registrationColumn.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [payment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8 lg:gap-12 items-start">
      {/* Left Column: Registration form */}
      <div ref={registrationColumn} tabIndex={-1} className="scroll-mt-28 bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-2 md:p-4 w-full animate-fade-up animate-delay-2 relative">
        <RegistrationForm
          payment={payment}
          onRegistered={openPayment}
          onRegisterAnother={() => setPayment(null)}
        />
      </div>

      {/* Right Column: Fees and notes */}
      <div className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-10 text-base md:text-lg text-gray-600 leading-relaxed space-y-8 animate-fade-up animate-delay-3 lg:sticky lg:top-28">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-primary-500 mb-4">Important Dates</h3>
          <ul className="space-y-2 text-sm md:text-base">
            <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
              <span className="font-semibold text-gray-800">
                Early registration payment deadline:
              </span>
              <span className="font-bold text-primary-500">
                {REGISTRATION_INFO.advancedDeadline}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-primary-500 mb-4">WACCI Registration Fee</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Advance fee
              </div>
              <div className="text-base font-extrabold text-primary-500">
                {REGISTRATION_INFO.advancedFee}
              </div>
              <p className="mt-2 text-sm text-gray-500">By {REGISTRATION_INFO.advancedDeadline}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Standard fee
              </div>
              <div className="text-base font-extrabold text-primary-500">
                {REGISTRATION_INFO.standardFee}
              </div>
              <p className="mt-2 text-sm text-gray-500">After {REGISTRATION_INFO.advancedDeadline}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-primary-500 mb-4">Notes</h3>
          <ul className="space-y-3 list-none pl-0 text-sm md:text-base text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-primary-500 font-bold">a.</span>
              <span>
                Registration fee includes participation in the workshop, coffee breaks and
                banquet.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 font-bold">b.</span>
              <span>
                Questions? Write to{' '}
                <a
                  href={`mailto:${REGISTRATION_INFO.contactEmail}`}
                  className="font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700"
                >
                  {REGISTRATION_INFO.contactEmail}
                </a>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 font-bold">c.</span>
              <div className="min-w-0 w-full">
                Already registered and still need to upload your receipt? Resume with the email you used to register.
                {!payment && <ReceiptRecovery onRecovered={openPayment} />}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import RegistrationForm from './registration-form';
import { REGISTRATION_INFO } from '@/lib/registration';

export const metadata: Metadata = {
  title: 'Registration | WACCI 2026',
  description: 'Register for the WACCI 2026 conference.',
};

export default function RegistrationPage() {
  return (
    <main className="min-h-screen py-16 lg:py-24 bg-[#FAFAFA] relative overflow-hidden">
      {/* Blue-only background gradients */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" />
      <div
        className="absolute top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60"
        style={{ animationDelay: '2000ms' }}
      />

      <div className="container px-4 lg:px-8 mx-auto relative z-10 max-w-[1440px]">
        <div className="text-center mb-16 section-title-motion">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-500 mb-4">
            Registration
          </h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-gray-600 leading-relaxed">
            Thank you for your interest in attending WACCI 2026! Please fill out the form below to
            register for the event and help us make your experience exceptional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8 lg:gap-12 items-start">
          {/* Left Column: Registration form */}
          <div className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-2 md:p-4 w-full animate-fade-up animate-delay-2 relative">
            <RegistrationForm />
          </div>

          {/* Right Column: Fees and notes */}
          <div className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-10 text-base md:text-lg text-gray-600 leading-relaxed space-y-8 animate-fade-up animate-delay-3 lg:sticky lg:top-28">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-primary-500 mb-4">Important Dates</h3>
              <ul className="space-y-2 text-sm md:text-base">
                <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                  <span className="font-semibold text-gray-800">
                    Advanced registration deadline:
                  </span>
                  <span className="font-bold text-primary-500">
                    {REGISTRATION_INFO.advancedDeadline}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary-500 mb-4">WACCI Registration Fee</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Advanced fee
                  </div>
                  <div className="text-3xl font-extrabold text-primary-500">
                    {REGISTRATION_INFO.advancedFee}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Standard fee
                  </div>
                  <div className="text-3xl font-extrabold text-primary-500">
                    {REGISTRATION_INFO.standardFee}
                  </div>
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
                    After registering you will receive the online payment link by email. Once paid,
                    upload your receipt{' '}
                    <a
                      href={REGISTRATION_INFO.receiptUploadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary-500 underline underline-offset-4 hover:text-primary-700"
                    >
                      here
                    </a>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-500 font-bold">c.</span>
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

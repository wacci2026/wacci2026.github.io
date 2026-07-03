import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Registration | WACCI 2026',
  description: 'Register for the WACCI 2026 conference.',
};

export default function RegistrationPage() {
  return (
    <main className="min-h-screen py-16 lg:py-24 bg-gray-50 dark:bg-dark-secondary relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2000ms' }} />

      <div className="container px-4 mx-auto relative z-10 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-primary-500 font-semibold tracking-wider uppercase text-sm mb-4 block">Join Us</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Conference Registration
          </h1>
        </div>

        <div className="bg-white dark:bg-dark-primary rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-8">
          
          <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Important Dates</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="font-semibold min-w-[240px]">Advanced registration deadline:</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">November 11</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">WACCI Registration Fee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-dark-secondary p-6 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Advanced registration fee</div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">US$100</div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-secondary p-6 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Standard registration fee</div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">US$130</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notes</h3>
            <ul className="space-y-3 list-none pl-0">
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">a.</span>
                <span>Registration fee includes participation in the workshop, coffee breaks and banquet.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">b.</span>
                <span>Online payment instructions available with the registration form.</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-8">
            <Link href="/online-registration" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Online registration
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

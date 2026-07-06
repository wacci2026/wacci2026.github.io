import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Abstract Submission | WACCI 2026',
  description: 'Submit your abstract for the WACCI 2026 conference.',
};

export default function SubmissionPage() {
  return (
    <main className="min-h-screen py-16 lg:py-24 bg-gray-50 dark:bg-dark-secondary relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2000ms' }} />

      <div className="container px-4 mx-auto relative z-10 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-primary-500 font-semibold tracking-wider uppercase text-sm mb-4 block">Call for Papers</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Abstract Submission
          </h1>
        </div>

        <div className="bg-white dark:bg-dark-primary rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
          <p>
            The 1-page abstract must be original and summarize their novel contribution in the Computational Imaging field.
          </p>
          <p>
            Presentation can be either &quot;Oral&quot; or &quot;Poster&quot;. Corresponding session allocation is subject to the Chairs&apos; discretion given schedule availability.
          </p>
          <p>
            The abstract must be submitted in PDF format and should follow the formatting rules that can be found in <Link href="/guidelines" className="text-primary-500 hover:text-primary-600 font-medium underline underline-offset-4">Submission Guidelines</Link>.
          </p>

          <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Important Dates</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="font-semibold min-w-[220px]">1-page abstract submission deadline:</span>
                <span><del className="text-gray-400 mr-2">September 23</del> <span className="font-bold text-primary-600 dark:text-primary-400">October 4</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold min-w-[220px]">Acceptance:</span>
                <span><del className="text-gray-400 mr-2">October 10</del> <span className="font-bold text-primary-600 dark:text-primary-400">October 14</span></span>
              </li>
            </ul>
          </div>
          
          <div className="pt-8">
            <button className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Submit Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

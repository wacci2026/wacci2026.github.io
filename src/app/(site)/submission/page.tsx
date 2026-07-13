import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abstract Submission | WACCI 2026',
  description: 'Submit your abstract for the WACCI 2026 conference.',
};

export default function SubmissionPage() {
  return (
    <main className="min-h-screen py-16 lg:py-24 bg-[#FAFAFA] relative overflow-hidden">
      {/* Blue-only background gradients */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" style={{ animationDelay: '2000ms' }} />

      <div className="container px-4 mx-auto relative z-10 max-w-5xl">
        <div className="text-center mb-16 section-title-motion">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-500 mb-4">
            Abstract Submission
          </h1>
          <span className="text-primary-500 font-bold tracking-widest uppercase text-xs mb-6 block">Call for Papers</span>
        </div>

        <div className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-12 text-base md:text-lg text-gray-600 leading-relaxed space-y-6 animate-fade-up animate-delay-2">
          <p>
            The 1-page abstract must be original and summarize their novel contribution in the Computational Imaging field.
          </p>
          <p>
            Presentation can be either &quot;Oral&quot; or &quot;Poster&quot;. Corresponding session allocation is subject to the Chairs&apos; discretion given schedule availability.
          </p>
          <p>
            The abstract submission portal will be enabled soon.
          </p>
        </div>
      </div>
    </main>
  );
}

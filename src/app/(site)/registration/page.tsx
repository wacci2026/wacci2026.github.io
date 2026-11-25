import React from 'react';
import type { Metadata } from 'next';
import RegistrationContent from './registration-content';

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

        <RegistrationContent />
      </div>
    </main>
  );
}

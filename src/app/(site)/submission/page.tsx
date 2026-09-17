'use client';

import React from 'react';
import { motion } from 'framer-motion';

const IMPORTANT_DATES = [
  {
    label: 'Abstract Submission',
    date: 'October 21, 2026',
  },
  {
    label: 'Acceptance Notification',
    date: 'November 4, 2026',
  },
];

const SERIES_BASE_URL = 'https://www.dropbox.com/scl/fi';

const SERIES_FILES = {
  samplePdf: `${SERIES_BASE_URL}/9phebcqz38y8zmsq4181h/ExtendedAbstract.pdf?rlkey=6esflk4st7msiu6sskil1ytd3&st=2wi9qpyn&e=1&dl=0`,
  latexTemplate: `${SERIES_BASE_URL}/ltu299hy6lrvb9eu1df39/WACCI2024-Template.rar?rlkey=7qwcisb3czclvvkn7v6cctcyd&st=iitc1ov0&e=1&dl=0`,
};

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

const cardFadeUp = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function FormatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function PresentationIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-primary-600">
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center">
        {icon}
      </span>
      {children}
    </h3>
  );
}

function TemplateLink({
  href,
  label,
  ariaLabel,
}: {
  href: string;
  label: string;
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-sm font-semibold text-primary-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-100 hover:border-primary-200"
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
    >
      <DownloadIcon className="w-3.5 h-3.5" />
      {label}
    </a>
  );
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
        <CheckIcon className="w-3 h-3" />
      </span>
      <p className="text-base md:text-lg text-gray-700 leading-[1.7]">{children}</p>
    </li>
  );
}

export default function SubmissionPage() {
  return (
    <main className="min-h-screen py-16 lg:py-24 bg-[#FAFAFA] relative overflow-hidden">
      {/* Background gradients */}
      <div
        className="absolute top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60"
        style={{ animationDelay: '2000ms' }}
        aria-hidden="true"
      />

      <div className="container px-4 mx-auto relative z-10 max-w-5xl">
        {/* Hero */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-500 mb-4">
            Abstract Submission
          </h1>
          <span className="text-primary-500 font-bold tracking-widest uppercase text-xs mb-8 block">
            Call for Papers
          </span>
        </motion.div>

        {/* Important Dates — placed above the main content */}
        <motion.div
          className="mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >

          <div className="grid gap-6 md:grid-cols-2">
            {IMPORTANT_DATES.map((item, index) => (
              <motion.div
                key={item.label}
                className="group relative bg-white rounded-[20px] shadow-lg shadow-gray-200/50 border border-gray-100 border-t-4 border-t-primary-400 p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={cardFadeUp}
                transition={{
                  type: 'spring',
                  stiffness: 85,
                  damping: 18,
                  delay: index * 0.12,
                }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-100">
                  <CalendarIcon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-1">
                    {item.label}
                  </p>
                  <p className="text-xl font-extrabold text-primary-500">
                    {item.date}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    Upcoming
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Content card */}
        <motion.div
          className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={cardFadeUp}
          transition={{ type: 'spring', stiffness: 85, damping: 18, delay: 0.1 }}
        >
          <header className="border-b border-gray-100 pb-6 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              Guidelines
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-primary-500">
              Submission Guidelines
            </h2>
          </header>

          <div className="space-y-10">
            <section className="space-y-3">
              <SectionHeading icon={<DocumentIcon className="w-4 h-4" />}>
                Submission Requirements
              </SectionHeading>
              <p className="text-base md:text-lg text-gray-700 leading-[1.7]">
                The 1-page abstract must be original and summarize their novel contribution in the Computational Imaging field.
              </p>
            </section>

            <section className="space-y-3">
              <SectionHeading icon={<FormatIcon className="w-4 h-4" />}>
                Format
              </SectionHeading>
              <ul className="space-y-2.5">
                <ChecklistItem>
                  Abstract must be submitted in English.
                </ChecklistItem>
                <ChecklistItem>
                  The abstract must be submitted in PDF format and should follow the formatting rules found in the{' '}
                  <TemplateLink
                    href={SERIES_FILES.samplePdf}
                    label="Sample PDF"
                    ariaLabel="Download Sample PDF abstract"
                  />{' '}
                  file or follow the{' '}
                  <TemplateLink
                    href={SERIES_FILES.latexTemplate}
                    label="LaTeX example"
                    ariaLabel="Download LaTeX template"
                  />
                  .
                </ChecklistItem>
              </ul>
            </section>

            <section className="space-y-3">
              <SectionHeading icon={<PresentationIcon className="w-4 h-4" />}>
                Presentations
              </SectionHeading>
              <p className="text-base md:text-lg text-gray-700 leading-[1.7]">
                Presentation can be either{' '}
                <span className="inline-flex items-center rounded-full bg-primary-500 text-white text-sm font-bold px-3 py-0.5">
                  Oral
                </span>{' '}
                or{' '}
                <span className="inline-flex items-center rounded-full bg-primary-400 text-white text-sm font-bold px-3 py-0.5">
                  Poster
                </span>
                . Corresponding session allocation is subject to the Chairs&apos; discretion given schedule
                availability. Instructions for oral and poster presentations shall be found later from the
                &quot;For Authors/Presenters&quot; link.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-[1.7]">
                The poster should follow the formatting rules found in the following{' '}
                <TemplateLink
                  href={SERIES_FILES.latexTemplate}
                  label="LaTeX example"
                  ariaLabel="Download LaTeX template for poster"
                />
                .
              </p>
            </section>

            <section className="space-y-3">
              <SectionHeading icon={<ClipboardIcon className="w-4 h-4" />}>
                Review Process
              </SectionHeading>
              <p className="text-base md:text-lg text-gray-700 leading-[1.7]">
                To ensure a high-quality workshop, all submitted works will be reviewed by the Program
                Committee for technical merit and suitability of content. Conference Chairs reserve the
                right to reject for presentation any paper that does not meet content or presentation
                expectations.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
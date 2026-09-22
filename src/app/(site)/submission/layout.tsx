import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Abstract Submission | WACCI 2026',
  description: 'Submit your abstract for the WACCI 2026 conference.',
};

export default function SubmissionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import React from 'react';
import type { Metadata } from 'next';
import ProgramContent from './program-content';

export const metadata: Metadata = {
  title: 'Program | WACCI 2026',
  description: 'Conference program and schedule for WACCI 2026.',
};

export default function ProgramPage() {
  return <ProgramContent />;
}

import type { Metadata } from 'next';
import './globals.css';
import { ToasterProvider } from './providers/toaster';

export const metadata: Metadata = {
  title: {
    default: 'WACCI 2026',
    template: '%s | WACCI 2026',
  },
  description:
    'International Workshop on Adaptive, Compressive and Computational Imaging, Pucón, Chile, December 14-17, 2026.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        {/* ToasterProvider must render before the children components */}
        {/* https://github.com/emilkowalski/sonner/issues/168#issuecomment-1773734618 */}
        <ToasterProvider />

        <div className="isolate flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}

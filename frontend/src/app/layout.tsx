import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kisan Alert - AI Agricultural Intelligence Platform',
  description: 'Empowering Indian farmers with real-time AI weather advisories, soil crop recommendations, visual disease diagnostics, and expert escalation.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-primary-200">
        {children}
      </body>
    </html>
  );
}

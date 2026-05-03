import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DomainStacker | Turn ideas into launch-ready domains',
  description: 'Generate brandable domain ideas, check launch fit, and build your starter business stack in minutes.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'DomainStacker | Turn ideas into launch-ready domains',
    description: 'Generate brandable domain ideas, check launch fit, and build your starter business stack in minutes.',
    images: ['/assets/hero-stack.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

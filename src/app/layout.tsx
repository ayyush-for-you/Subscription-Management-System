import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brightloop Subscription Management System (BSMS)',
  description: 'Enterprise Subscription Lifecycle, Automated Billing & Financial Operations Backbone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}


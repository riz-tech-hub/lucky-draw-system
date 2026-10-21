import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sistem Cabutan Bertuah Multi-Event | Lucky Draw Pro',
  description: 'Aplikasi web sistem cabutan bertuah moden, interaktif, responsif dengan sokongan cabutan pukal 10 serentak dan cabutan individu 1-demi-1.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className={`${inter.className} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-yellow-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}

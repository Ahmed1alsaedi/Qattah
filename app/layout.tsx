import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'قطّة الاستراحة',
  description: 'تسجيل ومتابعة تحويلات قطّة الاستراحة الشهرية',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

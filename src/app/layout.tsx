import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClearText AI — Accessible Reading for Everyone',
  description: 'Transform complex web content into a clean, customizable, dyslexia-friendly reading experience with AI-powered simplification.',
  keywords: ['accessibility', 'dyslexia', 'reading tool', 'text simplification', 'bionic reading'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

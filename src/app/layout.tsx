import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/frontend/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Study Buddy AI - Your Intelligent Learning Companion',
  description: 'Upload study materials and chat with AI for personalized learning assistance',
  openGraph: {
    title: 'Study Buddy AI - Your Intelligent Learning Companion',
    description: 'Upload study materials and chat with AI for personalized learning assistance',
    siteName: 'Study Buddy AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Buddy AI - Your Intelligent Learning Companion',
    description: 'Upload study materials and chat with AI for personalized learning assistance',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

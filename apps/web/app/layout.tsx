import './globals.css';
import { Providers } from '../components/providers';

export const metadata = {
  title: 'Sentinel — AI-Powered Content Usage Tracking',
  description: 'Monitor, detect, and protect your digital content across the internet with AI-powered intelligence.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

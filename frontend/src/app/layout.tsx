import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const display = Sora({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = { title: 'Comply iV — Client Portal' };

// Applies the saved theme before first paint so the page does not flash.
const themeScript = `try{var t=localStorage.getItem('civ-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}

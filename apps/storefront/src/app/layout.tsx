import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { CartDrawer } from '../components/cart-drawer';
import { WhatsAppFloatingWidget } from '../components/whatsapp-floating';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NUSAVA — Satu Indonesia, Banyak Cerita.',
  description:
    'Platform kurasi resmi oleh-oleh khas daerah, kopi nusantara, batik, dan kriya tradisional langsung dari sentra UMKM Indonesia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col font-sans antialiased text-ink bg-white`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloatingWidget />
        </Providers>
      </body>
    </html>
  );
}

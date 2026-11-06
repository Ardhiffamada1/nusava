import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers';
import { AdminSidebar } from '../components/admin-sidebar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'WiNk / CommerceOS — Panel Kelola UMKM & Toko Oleh-oleh',
  description:
    'Sistem manajemen terpadu inventaris, pemrosesan pesanan, dan pembukuan stok untuk pengrajin dan UMKM.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} min-h-screen bg-[#F4F4F6] text-ink antialiased font-sans`}>
        <Providers>
          <div className="min-h-screen flex w-full">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <main className="flex-1 p-6 md:p-8 lg:p-10">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

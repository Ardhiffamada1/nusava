import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { AdminSidebar } from '../components/admin-sidebar';

export const metadata: Metadata = {
  title: 'WiNk / CommerceOS — Admin Console',
  description: 'Executive management suite for catalog, inventory, order fulfillment, and transaction ledgers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F4F6] text-ink antialiased">
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

import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { CartDrawer } from '../components/cart-drawer';

export const metadata: Metadata = {
  title: 'CommerceOS — Fullstack E-Commerce Platform',
  description: 'Production-grade fullstack modular monolith e-commerce platform built with NestJS, Next.js, Prisma, and PostgreSQL.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}

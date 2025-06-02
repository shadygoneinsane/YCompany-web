import type { Metadata } from 'next';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Product Hub',
  description: 'Manage your products easily.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto h-16 flex items-center justify-between px-4">
            <Link href="/" className="text-2xl font-bold font-headline text-primary hover:text-primary/90 transition-colors">
              Product Hub
            </Link>
            <nav>
              <Button asChild variant="ghost" className="text-foreground hover:text-accent-foreground hover:bg-accent">
                <Link href="/add-product">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Product
                </Link>
              </Button>
            </nav>
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 md:p-8 flex-grow">
          {children}
        </main>
        <footer className="bg-card border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Product Hub. All rights reserved.
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

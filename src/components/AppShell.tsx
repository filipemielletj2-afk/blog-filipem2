'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';

interface AppShellProps {
  children: React.ReactNode;
  categories: any[];
  siteTitle?: string;
  footerText?: string;
}

export default function AppShell({
  children,
  categories = [],
  siteTitle = 'BLOG FILIPEM2',
  footerText
}: AppShellProps) {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const isAdmin = pathname.startsWith('/admin');

  // If inside admin, ensure admin uses its dedicated dark dashboard theme
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.classList.remove('light-theme');
      document.body?.classList.remove('light-theme');
    } else {
      const savedTheme = localStorage.getItem('filipem2_theme');
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.body?.classList.add('light-theme');
      }
    }
  }, [isAdmin]);

  // Admin pages have their own full-screen standalone layout
  if (isAdmin) {
    return <>{children}</>;
  }

  // Public portal pages render standard Header, Main, Footer and CookieBanner
  return (
    <>
      <Header categories={categories} siteTitle={siteTitle} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} footerText={footerText} />
      <CookieBanner />
    </>
  );
}

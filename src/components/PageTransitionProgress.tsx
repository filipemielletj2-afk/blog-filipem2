'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PageTransitionProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress on route change
  useEffect(() => {
    if (active) {
      setProgress(100);
      const timer = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to trigger top progress bar immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external, hash links, mailto, tel, or target="_blank"
      if (
        !href ||
        targetAttr === '_blank' ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('http://') ||
        href.startsWith('https://')
      ) {
        return;
      }

      // Check if navigating to the same URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start top loading bar
      setActive(true);
      setProgress(25);

      // Progressive increment
      const step1 = setTimeout(() => setProgress(55), 100);
      const step2 = setTimeout(() => setProgress(80), 250);

      // Auto-timeout fallback in case route change takes longer or is aborted
      const fallback = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setActive(false);
          setProgress(0);
        }, 200);
      }, 5000);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(fallback);
      };
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  if (!active && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99998] pointer-events-none h-1 bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(220,38,38,0.9)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 150ms ease-out, opacity 250ms ease-out' : 'width 200ms ease-out'
        }}
      />
    </div>
  );
}

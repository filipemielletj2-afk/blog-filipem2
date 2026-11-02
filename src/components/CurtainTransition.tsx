'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function CurtainTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Phases: 'initial' (opening on mount), 'idle' (curtain away), 'covering' (curtain sliding up), 'revealing' (curtain sliding away)
  const [phase, setPhase] = useState<'initial' | 'idle' | 'covering' | 'revealing'>('initial');
  const [showLogo, setShowLogo] = useState(true);
  const pendingUrlRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  // Initial load: curtain is covering and slides away with staggered columns
  useEffect(() => {
    if (isAdmin) {
      setPhase('idle');
      setShowLogo(false);
      return;
    }

    const timer = setTimeout(() => {
      setPhase('revealing');
      setShowLogo(false);
      setTimeout(() => {
        setPhase('idle');
      }, 700);
    }, 300);

    return () => clearTimeout(timer);
  }, [isAdmin]);

  // When pathname changes (route has changed)
  useEffect(() => {
    if (phase === 'covering') {
      const timer = setTimeout(() => {
        setPhase('revealing');
        setShowLogo(false);
        setTimeout(() => {
          setPhase('idle');
          isTransitioningRef.current = false;
          pendingUrlRef.current = null;
        }, 700);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept all internal link clicks to trigger the Elementor-style curtain transition
  useEffect(() => {
    if (isAdmin) return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external, download, tel, mailto, anchors, new tabs
      if (
        !href ||
        targetAttr === '_blank' ||
        target.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      // Check external domain
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }

      // Ignore same-url clicks
      const currentFullUrl = window.location.pathname + window.location.search;
      if (href === currentFullUrl || href === window.location.pathname) {
        return;
      }

      // Don't intercept clicks inside admin panel
      if (href.startsWith('/admin')) {
        return;
      }

      // Intercept and start transition
      e.preventDefault();
      isTransitioningRef.current = true;
      pendingUrlRef.current = href;

      // Phase 1: Curtain covers the screen from bottom
      setPhase('covering');
      setShowLogo(true);

      // Once curtain covers (~480ms), navigate to the new page
      setTimeout(() => {
        router.push(href);
      }, 480);

      // Safety timeout: in case navigation stalls, force reveal after 2.8s
      setTimeout(() => {
        if (isTransitioningRef.current) {
          setPhase('revealing');
          setShowLogo(false);
          setTimeout(() => {
            setPhase('idle');
            isTransitioningRef.current = false;
          }, 600);
        }
      }, 2800);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [router, isAdmin]);

  if (isAdmin || phase === 'idle') {
    return null;
  }

  // 5 Staggered vertical columns (Elementor Slices technique)
  const slices = [0, 1, 2, 3, 4];

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] overflow-hidden select-none ${
        phase === 'covering' ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* 5 Vertical Slices */}
      <div className="w-full h-full flex">
        {slices.map((index) => {
          // Staggered delays: 0ms, 40ms, 80ms, 120ms, 160ms
          const delayMs = index * 40;

          let transformClass = 'translate-y-full'; // default at bottom
          let transitionStyle = `transform 480ms cubic-bezier(0.76, 0, 0.24, 1) ${delayMs}ms`;

          if (phase === 'initial' || phase === 'covering') {
            transformClass = 'translate-y-0';
          } else if (phase === 'revealing') {
            transformClass = '-translate-y-full';
          }

          return (
            <div
              key={index}
              className={`flex-1 h-full bg-[#08090e] border-r border-neutral-900/60 relative will-change-transform ${transformClass}`}
              style={{
                transition: transitionStyle
              }}
            >
              {/* Neon Red/Amber Top Edge Line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(220,38,38,0.9)]" />
              {/* Bottom Edge Line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600/30" />
            </div>
          );
        })}
      </div>

      {/* Center Branded Logo & Tagline */}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center p-4 z-10 transition-all duration-250 ${
          showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative flex flex-col items-center space-y-4 max-w-sm text-center">
          {/* Ambient Glow */}
          <div className="absolute w-64 h-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none animate-pulse" />

          {/* Pulsing Neon Logo Container */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-red-600 to-amber-500 opacity-40 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0e1017] border-2 border-red-500/60 p-4 shadow-2xl flex items-center justify-center">
              <img
                src="/logo.png"
                alt="BLOG FILIPEM2"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">
              BLOG FILIPEM2
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-red-400 font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>CARREGANDO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

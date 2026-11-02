'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SitePreloader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(20);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // If inside admin, don't show the consumer splash preloader
    if (isAdmin) {
      setLoading(false);
      return;
    }

    // Fast, responsive progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 25) + 12;
      });
    }, 60);

    const timer = setTimeout(() => {
      setProgress(100);
      setFadingOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 350); // 350ms smooth fadeout
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isAdmin]);

  if (!loading) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] bg-[#07080c] flex flex-col items-center justify-center px-4 transition-all duration-350 ease-out select-none ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute w-96 h-96 rounded-full bg-red-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-purple-600/15 blur-[90px] pointer-events-none" />

      {/* Center Brand Identity */}
      <div className="relative flex flex-col items-center space-y-6 z-10 max-w-sm text-center">
        {/* Logo Emblem with Pulse */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-red-600 to-amber-500 opacity-40 blur-lg animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0f1118] border-2 border-red-500/50 p-4 shadow-2xl flex items-center justify-center">
            <img
              src="/logo.png"
              alt="BLOG FILIPEM2"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.7)] animate-pulse"
            />
          </div>
        </div>

        {/* Portal Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center justify-center gap-2">
            <span>BLOG FILIPEM2</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 font-mono tracking-widest uppercase">
            PORTAL DEFINITIVO DE GAMES &amp; CULTURA GEEK
          </p>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="w-56 sm:w-64 space-y-2">
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-120 ease-out shadow-[0_0_12px_rgba(220,38,38,0.9)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-neutral-300">CARREGANDO PORTAL</span>
            </span>
            <span className="text-red-400 font-bold">{Math.min(100, progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

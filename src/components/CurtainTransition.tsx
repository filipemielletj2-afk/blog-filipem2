'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type TransitionEffect =
  | 'slices_vertical'
  | 'slices_horizontal'
  | 'curtain_vertical'
  | 'curtain_lateral'
  | 'curtain_split'
  | 'zoom_fade'
  | 'cyberpunk_glitch'
  | 'minimal_topbar'
  | 'disabled';

export type TransitionSpeed = 'fast' | 'normal' | 'cinematic';

interface CurtainTransitionProps {
  initialEffect?: string;
  initialSpeed?: string;
  initialShowLogo?: boolean;
}

export default function CurtainTransition({
  initialEffect = 'slices_vertical',
  initialSpeed = 'normal',
  initialShowLogo = true
}: CurtainTransitionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Active configuration
  const [effect, setEffect] = useState<TransitionEffect>((initialEffect as TransitionEffect) || 'slices_vertical');
  const [speed, setSpeed] = useState<TransitionSpeed>((initialSpeed as TransitionSpeed) || 'normal');
  const [showLogoOption, setShowLogoOption] = useState<boolean>(initialShowLogo);

  // Animation Phase: 'initial' (opening on first mount), 'idle' (curtain away), 'covering' (curtain sliding in), 'revealing' (curtain sliding away)
  const [phase, setPhase] = useState<'initial' | 'idle' | 'covering' | 'revealing'>('initial');
  const [logoVisible, setLogoVisible] = useState(false);

  // Preview state
  const [isPreview, setIsPreview] = useState(false);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);

  // Active effect and speed refs to avoid closure stale issues in event handlers
  const activeEffectRef = useRef(effect);
  const activeSpeedRef = useRef(speed);
  const activeShowLogoRef = useRef(showLogoOption);

  useEffect(() => {
    activeEffectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    activeSpeedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    activeShowLogoRef.current = showLogoOption;
  }, [showLogoOption]);

  // Timing helpers
  const getTimings = (s: TransitionSpeed) => {
    switch (s) {
      case 'fast':
        return { durationMs: 280, staggerMs: 25, coverHoldMs: 280, revealDurationMs: 320 };
      case 'cinematic':
        return { durationMs: 700, staggerMs: 65, coverHoldMs: 680, revealDurationMs: 720 };
      case 'normal':
      default:
        return { durationMs: 440, staggerMs: 40, coverHoldMs: 440, revealDurationMs: 480 };
    }
  };

  // Listen for admin live preview & settings updates
  useEffect(() => {
    const handlePreview = (e: Event) => {
      const customEvent = e as CustomEvent<{
        effect?: TransitionEffect;
        speed?: TransitionSpeed;
        showLogo?: boolean;
      }>;
      const detail = customEvent.detail || {};
      const eff = detail.effect || activeEffectRef.current;
      const spd = detail.speed || activeSpeedRef.current;
      const shw = detail.showLogo !== undefined ? detail.showLogo : activeShowLogoRef.current;

      if (eff === 'disabled') {
        alert('O modo "Instantâneo (Desativado)" não exibe tela de transição.');
        return;
      }

      // If already animating preview, clear previous timer
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

      setIsPreview(true);
      setEffect(eff);
      setSpeed(spd);
      setShowLogoOption(shw);

      const timings = getTimings(spd);

      // Phase 1: Covering
      setPhase('covering');
      setLogoVisible(shw);

      // Phase 2: Revealing after cover hold
      previewTimerRef.current = setTimeout(() => {
        setPhase('revealing');
        setLogoVisible(false);

        // Phase 3: Back to idle
        previewTimerRef.current = setTimeout(() => {
          setPhase('idle');
          setIsPreview(false);
          // Restore original saved settings
          setEffect(activeEffectRef.current);
          setSpeed(activeSpeedRef.current);
          setShowLogoOption(activeShowLogoRef.current);
        }, timings.revealDurationMs + 100);
      }, timings.coverHoldMs + (eff.startsWith('slices') ? 200 : 100));
    };

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        effect?: TransitionEffect;
        speed?: TransitionSpeed;
        showLogo?: boolean;
      }>;
      const detail = customEvent.detail || {};
      if (detail.effect) {
        setEffect(detail.effect);
        activeEffectRef.current = detail.effect;
      }
      if (detail.speed) {
        setSpeed(detail.speed);
        activeSpeedRef.current = detail.speed;
      }
      if (detail.showLogo !== undefined) {
        setShowLogoOption(detail.showLogo);
        activeShowLogoRef.current = detail.showLogo;
      }
    };

    window.addEventListener('preview-transition', handlePreview);
    window.addEventListener('update-transition-settings', handleSettingsUpdate);

    return () => {
      window.removeEventListener('preview-transition', handlePreview);
      window.removeEventListener('update-transition-settings', handleSettingsUpdate);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  // Initial site load: smoothly reveal content if not admin
  useEffect(() => {
    if (isAdmin || effect === 'disabled') {
      setPhase('idle');
      setLogoVisible(false);
      return;
    }

    const timings = getTimings(speed);
    const initialTimer = setTimeout(() => {
      setPhase('revealing');
      setLogoVisible(false);
      setTimeout(() => {
        setPhase('idle');
      }, timings.revealDurationMs);
    }, 200);

    return () => clearTimeout(initialTimer);
  }, [isAdmin]);

  // When pathname changes (route transition completed)
  useEffect(() => {
    if (phase === 'covering') {
      const timings = getTimings(speed);
      const timer = setTimeout(() => {
        setPhase('revealing');
        setLogoVisible(false);
        setTimeout(() => {
          setPhase('idle');
          isTransitioningRef.current = false;
        }, timings.revealDurationMs);
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [pathname, speed]);

  // Intercept all internal clicks on public portal
  useEffect(() => {
    if (isAdmin || effect === 'disabled') return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (isTransitioningRef.current || isPreview) {
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

      const timings = getTimings(speed);

      // Phase 1: Cover screen
      setPhase('covering');
      setLogoVisible(showLogoOption);

      // Once curtain covers, route to the new page
      setTimeout(() => {
        router.push(href);
      }, timings.coverHoldMs);

      // Safety fallback: if navigation stalls, force reveal after 2.6s
      setTimeout(() => {
        if (isTransitioningRef.current) {
          setPhase('revealing');
          setLogoVisible(false);
          setTimeout(() => {
            setPhase('idle');
            isTransitioningRef.current = false;
          }, timings.revealDurationMs);
        }
      }, 2600);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [router, isAdmin, effect, speed, showLogoOption, isPreview]);

  // If idle, or disabled, render nothing
  if (phase === 'idle' || effect === 'disabled') {
    return null;
  }

  const timings = getTimings(speed);
  const cubicEase = 'cubic-bezier(0.76, 0, 0.24, 1)';

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] overflow-hidden select-none ${
        phase === 'covering' ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* EFFECT 1: SLICES VERTICAL (Elementor Multi-Column Slices) */}
      {effect === 'slices_vertical' && (
        <div className="w-full h-full flex">
          {[0, 1, 2, 3, 4].map((index) => {
            const delayMs = index * timings.staggerMs;
            let transformStyle = 'translateY(100%)';
            if (phase === 'initial' || phase === 'covering') {
              transformStyle = 'translateY(0%)';
            } else if (phase === 'revealing') {
              transformStyle = 'translateY(-100%)';
            }

            return (
              <div
                key={index}
                className="flex-1 h-full bg-[#08090e] border-r border-neutral-900/60 relative will-change-transform"
                style={{
                  transform: transformStyle,
                  transition: `transform ${timings.durationMs}ms ${cubicEase} ${delayMs}ms`
                }}
              >
                {/* Top Neon Border */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(220,38,38,0.9)]" />
                {/* Bottom Border Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600/30" />
              </div>
            );
          })}
        </div>
      )}

      {/* EFFECT 2: SLICES HORIZONTAL (Horizontal Blinds) */}
      {effect === 'slices_horizontal' && (
        <div className="w-full h-full flex flex-col">
          {[0, 1, 2, 3, 4].map((index) => {
            const delayMs = index * timings.staggerMs;
            let transformStyle = 'translateX(-100%)';
            if (phase === 'initial' || phase === 'covering') {
              transformStyle = 'translateX(0%)';
            } else if (phase === 'revealing') {
              transformStyle = 'translateX(100%)';
            }

            return (
              <div
                key={index}
                className="w-full flex-1 bg-[#08090e] border-b border-neutral-900/60 relative will-change-transform"
                style={{
                  transform: transformStyle,
                  transition: `transform ${timings.durationMs}ms ${cubicEase} ${delayMs}ms`
                }}
              >
                {/* Right Edge Neon Glow Blade */}
                <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-gradient-to-b from-red-600 via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(220,38,38,0.9)]" />
              </div>
            );
          })}
        </div>
      )}

      {/* EFFECT 3: CURTAIN VERTICAL (Monolithic Smooth Wipe Up) */}
      {effect === 'curtain_vertical' && (
        <div
          className="w-full h-full bg-[#08090e] relative will-change-transform"
          style={{
            transform:
              phase === 'initial' || phase === 'covering'
                ? 'translateY(0%)'
                : phase === 'revealing'
                ? 'translateY(-100%)'
                : 'translateY(100%)',
            transition: `transform ${timings.durationMs}ms ${cubicEase}`
          }}
        >
          {/* Top Edge Neon Beam */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 shadow-[0_0_25px_rgba(220,38,38,1)]" />
        </div>
      )}

      {/* EFFECT 4: CURTAIN LATERAL (Cyberpunk Lateral Swipe) */}
      {effect === 'curtain_lateral' && (
        <div
          className="w-full h-full bg-[#08090e] relative will-change-transform"
          style={{
            transform:
              phase === 'initial' || phase === 'covering'
                ? 'translateX(0%)'
                : phase === 'revealing'
                ? 'translateX(100%)'
                : 'translateX(-100%)',
            transition: `transform ${timings.durationMs}ms ${cubicEase}`
          }}
        >
          {/* Right Edge Laser Blade */}
          <div className="absolute top-0 bottom-0 right-0 w-[4px] bg-gradient-to-b from-red-600 via-amber-500 to-rose-600 shadow-[0_0_25px_rgba(220,38,38,1)]" />
        </div>
      )}

      {/* EFFECT 5: CURTAIN SPLIT (Portas de Aço Dupla / Split Bi-Parting) */}
      {effect === 'curtain_split' && (
        <div className="w-full h-full flex">
          {/* Left Door */}
          <div
            className="w-1/2 h-full bg-[#08090e] border-r-2 border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.5)] will-change-transform"
            style={{
              transform:
                phase === 'initial' || phase === 'covering'
                  ? 'translateX(0%)'
                  : 'translateX(-100%)',
              transition: `transform ${timings.durationMs}ms ${cubicEase}`
            }}
          />
          {/* Right Door */}
          <div
            className="w-1/2 h-full bg-[#08090e] border-l-2 border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.5)] will-change-transform"
            style={{
              transform:
                phase === 'initial' || phase === 'covering'
                  ? 'translateX(0%)'
                  : 'translateX(100%)',
              transition: `transform ${timings.durationMs}ms ${cubicEase}`
            }}
          />
        </div>
      )}

      {/* EFFECT 6: ZOOM FADE (Dissolução Cinematográfica & Scale) */}
      {effect === 'zoom_fade' && (
        <div
          className="w-full h-full bg-[#08090e]/98 backdrop-blur-2xl flex items-center justify-center will-change-[opacity,transform]"
          style={{
            opacity: phase === 'initial' || phase === 'covering' ? 1 : 0,
            transform:
              phase === 'initial' || phase === 'covering' ? 'scale(1)' : 'scale(1.06)',
            transition: `opacity ${timings.durationMs}ms ease-out, transform ${timings.durationMs}ms ease-out`
          }}
        >
          {/* Ambient Radial Spotlight */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* EFFECT 7: CYBERPUNK GLITCH & SCANLINE GRID */}
      {effect === 'cyberpunk_glitch' && (
        <div
          className="w-full h-full bg-[#08090e] relative overflow-hidden will-change-transform"
          style={{
            transform:
              phase === 'initial' || phase === 'covering'
                ? 'translateY(0%)'
                : phase === 'revealing'
                ? 'translateY(-100%)'
                : 'translateY(100%)',
            transition: `transform ${timings.durationMs}ms ${cubicEase}`
          }}
        >
          {/* Tech Grid Background Lines */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          {/* Rapid Laser Scanline */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-bounce" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
        </div>
      )}

      {/* EFFECT 8: MINIMAL TOPBAR (YouTube / GitHub Laser Line) */}
      {effect === 'minimal_topbar' && (
        <div className="fixed top-0 left-0 right-0 h-[4px] z-[99999] pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(220,38,38,1)] transition-all ease-out"
            style={{
              width:
                phase === 'initial'
                  ? '100%'
                  : phase === 'covering'
                  ? '75%'
                  : phase === 'revealing'
                  ? '100%'
                  : '0%',
              opacity: phase === 'revealing' ? 0.3 : 1,
              transitionDuration: `${timings.durationMs}ms`
            }}
          />
        </div>
      )}

      {/* CENTER LOGO & BRANDING DISPLAY (Visible on full-screen transitions when showLogoOption is enabled) */}
      {effect !== 'minimal_topbar' && (
        <div
          className={`fixed inset-0 flex flex-col items-center justify-center p-4 z-20 pointer-events-none transition-all duration-300 ${
            logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="relative flex flex-col items-center space-y-4 max-w-sm text-center">
            {/* Ambient Background Aura */}
            <div className="absolute w-72 h-72 rounded-full bg-red-600/25 blur-3xl pointer-events-none animate-pulse" />

            {/* Glowing Emblem Container */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-red-600 to-amber-500 opacity-40 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0e1017] border-2 border-red-500/70 p-3 shadow-2xl flex items-center justify-center">
                {/* SVG Vector Hexagon Logo */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full drop-shadow-[0_0_15px_rgba(220,38,38,0.9)] animate-pulse"
                >
                  <polygon
                    points="50,10 88,32 88,68 50,90 12,68 12,32"
                    fill="#12141c"
                    stroke="#DC2626"
                    strokeWidth="4"
                  />
                  <path
                    d="M 32 35 L 68 35 L 60 48 L 42 48 L 38 58 L 56 58 L 50 70 L 28 70 Z"
                    fill="#DC2626"
                  />
                  <circle cx="70" cy="65" r="4" fill="#FFFFFF" />
                </svg>
              </div>
            </div>

            {/* Title & Pulse Indicator */}
            <div className="space-y-1 z-10">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider drop-shadow-md">
                BLOG FILIPEM2
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-red-400 font-mono tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>CARREGANDO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

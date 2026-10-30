'use client';

import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: 'header' | 'sidebar' | 'article' | 'footer';
  enabled: boolean;
  code?: string;
  className?: string;
}

export default function AdBanner({ slot, enabled, code, className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !code || !containerRef.current) return;

    // React dangerouslySetInnerHTML does not execute <script> tags automatically by HTML spec.
    // We dynamically recreate any nested scripts so Google AdSense / ad networks execute properly.
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [code, enabled]);

  if (!enabled || !code) return null;

  return (
    <div className={`my-6 w-full flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] tracking-widest text-neutral-600 uppercase mb-1 font-mono">
        Publicidade Patrocinada
      </span>
      <div
        ref={containerRef}
        className="w-full overflow-hidden flex items-center justify-center min-h-[50px]"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </div>
  );
}

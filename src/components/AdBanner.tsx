'use client';

import React from 'react';

interface AdBannerProps {
  slot: 'header' | 'sidebar' | 'article' | 'footer';
  enabled: boolean;
  code?: string;
}

export default function AdBanner({ slot, enabled, code }: AdBannerProps) {
  if (!enabled || !code) return null;

  return (
    <div className="my-6 w-full flex flex-col items-center justify-center">
      <span className="text-[10px] tracking-widest text-neutral-600 uppercase mb-1 font-mono">
        Publicidade Patrocinada
      </span>
      <div
        className="w-full overflow-hidden flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </div>
  );
}

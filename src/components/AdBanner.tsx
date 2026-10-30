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

  if (!enabled || !code || !code.trim()) return null;

  // Do not render empty or placeholder text boxes
  const trimmed = code.trim();
  if (
    trimmed.includes('Espaço Reservado para Anúncios') ||
    trimmed.includes('Espaço Publicitário Disponível') ||
    trimmed.includes('Publicidade / Espaço Reservado') ||
    trimmed === '<p></p>' ||
    trimmed === '<div></div>'
  ) {
    return null;
  }

  return (
    <div className={`my-4 w-full flex items-center justify-center ${className}`}>
      <div
        ref={containerRef}
        className="w-full overflow-hidden flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5 text-red-500" />
        Compartilhar:
      </span>

      <a
        href={shareWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900 text-emerald-400 text-xs font-bold transition-colors"
      >
        WhatsApp
      </a>

      <a
        href={shareTwitter}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
      >
        X / Twitter
      </a>

      <a
        href={shareFacebook}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/80 hover:bg-blue-900 text-blue-400 text-xs font-bold transition-colors"
      >
        Facebook
      </a>

      <button
        onClick={handleCopy}
        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Link Copiado!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Copiar Link</span>
          </>
        )}
      </button>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';

interface BreakingTickerProps {
  articles?: Array<{ id: number; title: string; slug: string; category_name?: string }>;
  badgeText?: string;
}

export default function BreakingTicker({ articles = [], badgeText = 'EM ALTA' }: BreakingTickerProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-[#12141c] border-y border-neutral-800/80 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
        {/* Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-black tracking-wider uppercase shrink-0 shadow-md shadow-red-600/30">
          <Flame className="w-3.5 h-3.5 animate-bounce" />
          <span>{badgeText}</span>
        </div>

        {/* Headlines */}
        <div className="flex-1 flex items-center space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap text-xs sm:text-sm text-neutral-300">
          {articles.map((art, idx) => (
            <Link
              key={art.id}
              href={`/artigo/${art.slug}`}
              className="inline-flex items-center space-x-2 hover:text-red-400 transition-colors shrink-0 group"
            >
              <span className="text-neutral-600 font-mono text-[11px]">0{idx + 1}.</span>
              <span className="font-medium group-hover:underline">{art.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-red-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

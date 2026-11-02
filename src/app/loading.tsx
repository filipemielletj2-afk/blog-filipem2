import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 space-y-6">
      {/* Animated Glowing Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow Rings */}
        <div className="absolute w-28 h-28 rounded-full bg-red-600/20 blur-xl animate-pulse pointer-events-none" />
        <div className="absolute w-20 h-20 rounded-full border border-red-500/30 animate-ping opacity-40 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-[#0f1118] border-2 border-red-600/60 p-3 flex items-center justify-center shadow-xl shadow-red-600/25 relative z-10">
          <img
            src="/logo.png"
            alt="Carregando BLOG FILIPEM2"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
      </div>

      {/* Loading Text & Status */}
      <div className="text-center space-y-1.5 max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-black tracking-widest uppercase text-white font-mono">
            CARREGANDO...
          </span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Carregando as últimas matérias e conteúdos do portal.
        </p>
      </div>

      {/* Sleek Progress Indeterminate Bar */}
      <div className="w-52 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 relative">
        <div className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full animate-pulse w-3/4 mx-auto" />
      </div>
    </div>
  );
}

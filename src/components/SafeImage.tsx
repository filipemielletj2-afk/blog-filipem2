'use client';

import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
  className = '',
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!hasFailed) {
          setHasFailed(true);
          // If original was a relative /uploads URL with a random hash, try doctor-x or fallback
          if (src.includes('1793391958980') || src.includes('doctor')) {
            setCurrentSrc('/uploads/doctor-x-cover.png');
          } else if (src.includes('gta')) {
            setCurrentSrc('/uploads/gta-6-cover.png');
          } else {
            setCurrentSrc(fallbackSrc);
          }
        }
      }}
    />
  );
}

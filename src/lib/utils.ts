import sanitizeHtml from 'sanitize-html';

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // decompose combined graphemes
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}

export function calculateReadingTime(text: string): number {
  const plain = text.replace(/<[^>]*>/g, '');
  const words = plain.trim().split(/\s+/).length;
  const wpm = 200;
  const time = Math.ceil(words / wpm);
  return Math.max(1, time);
}

export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDateTimeBR(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora há pouco';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  return formatDateBR(dateString);
}

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'figure', 'figcaption',
      'iframe', 'video', 'source', 'audio', 'span', 'mark', 'hr'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'style', 'id', 'data-*'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
      'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
      'a': ['href', 'name', 'target', 'rel', 'title']
    },
    allowedIframeHostnames: [
      'www.youtube.com',
      'youtube.com',
      'player.vimeo.com',
      'open.spotify.com',
      'clips.twitch.tv',
      'player.twitch.tv',
      'store.steampowered.com'
    ]
  });
}

export function truncateText(text: string, maxLength: number = 160): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>/g, '').trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
}

export function formatYouTubeEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already an iframe tag, extract src
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const target = iframeMatch ? iframeMatch[1] : trimmed;

  // If already embed URL
  if (target.includes('youtube.com/embed/') || target.includes('youtube-nocookie.com/embed/')) {
    return target;
  }

  // Handle youtu.be/ID
  const shortMatch = target.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // Handle youtube.com/live/ID
  const liveMatch = target.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/);
  if (liveMatch) {
    return `https://www.youtube.com/embed/${liveMatch[1]}`;
  }

  // Handle youtube.com/shorts/ID
  const shortsMatch = target.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Handle youtube.com/watch?v=ID
  const watchMatch = target.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Fallback: If it's a standalone 11-char ID like hyNtX7HWP5g
  if (/^[a-zA-Z0-9_-]{11}$/.test(target)) {
    return `https://www.youtube.com/embed/${target}`;
  }

  return target;
}

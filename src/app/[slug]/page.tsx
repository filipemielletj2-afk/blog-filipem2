import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { ChevronRight, ShieldCheck, Mail } from 'lucide-react';
import ContactForm from './ContactForm';

export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const db = getDb();
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(params.slug) as any;

  if (!page) {
    return { title: 'Página não encontrada | BLOG FILIPEM2' };
  }

  return {
    title: page.meta_title || `${page.title} | BLOG FILIPEM2`,
    description: page.meta_description || `Página oficial ${page.title} do portal BLOG FILIPEM2.`
  };
}

export default function DynamicPage({ params }: PageProps) {
  const db = getDb();
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(params.slug) as any;

  if (!page) {
    notFound();
  }

  const isContact = page.slug === 'contato';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-white font-semibold">{page.title}</span>
      </nav>

      {/* Main Container */}
      <article className="p-6 sm:p-12 rounded-3xl bg-[#14161f] border border-neutral-800 shadow-2xl space-y-8">
        <div className="prose prose-invert max-w-none prose-lg prose-red prose-headings:font-black prose-headings:tracking-tight prose-a:text-red-400 prose-a:underline hover:prose-a:text-red-300 leading-relaxed text-neutral-300">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>

        {/* Interactive Contact Form if this is the contact page */}
        {isContact && <ContactForm />}
      </article>
    </div>
  );
}

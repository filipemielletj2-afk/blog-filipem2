import React from 'react';
import { notFound } from 'next/navigation';
import { getDb, toPlain } from '@/lib/db';
import ArticleEditor from '@/components/ArticleEditor';

export const revalidate = 0;

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const db = getDb();
  const id = parseInt(params.id, 10);
  if (!id) notFound();

  const article = toPlain(db.prepare('SELECT * FROM articles WHERE id = ?').get(id)) as any;
  if (!article) notFound();

  const tags = toPlain(db.prepare(`
    SELECT t.name FROM tags t
    JOIN article_tags at ON t.id = at.tag_id
    WHERE at.article_id = ?
  `).all(id));

  article.tags = tags;

  return <ArticleEditor initialData={article} articleId={id} />;
}

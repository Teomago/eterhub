import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPage, getPageStaticParams } from '@/modules/pages/data'
import { BlocksRenderer } from '@/modules/blocks/BlocksRenderer'
import { ArticleListTemplate } from '@/modules/articles/ArticleListTemplate'
import { ArticleTemplate } from '@/modules/articles/ArticleTemplate'
import { getArticle, getArticleStaticParams } from '@/modules/articles/data'
import { resolvePathname } from '@/lib/utils/resolvePathname'
import { generatePageMeta, generateArticleMeta } from '@/lib/metadata'
import { Welcome } from '@/modules/common/Welcome'

type Props = {
  params: Promise<{ segments?: string[], locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateStaticParams() {
  const [pageParams] = await Promise.all([getPageStaticParams(), getArticleStaticParams()])

  return [
    ...pageParams,
    // Article slugs are handled via their pathname which already includes parent segments
  ]
}

const VALID_LOCALES = ['en', 'es']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments, locale } = await params

  // Guard: reject invalid locales before any DB query
  if (!VALID_LOCALES.includes(locale)) return {}

  const { isEnabled: draft } = await draftMode()
  const page = await getPage({ segments, draft, locale })

  if (page) {
    return generatePageMeta(page)
  }

  // Try article
  if (segments && segments.length > 0) {
    const slug = segments[segments.length - 1]
    const article = await getArticle(slug, draft, locale)
    if (article) {
      return generateArticleMeta(article)
    }
  }

  return {}
}

export default async function Page({ params, searchParams }: Props) {
  const { segments, locale } = await params

  // Guard: reject invalid locales before any DB query
  if (!VALID_LOCALES.includes(locale)) notFound()

  const { isEnabled: draft } = await draftMode()
  const page = await getPage({ segments, draft, locale })

  if (page) {
    // Dynamic listing page (e.g., articles)
    if (page.type === 'dynamic' && page.dynamicCollection) {
      const resolvedSearchParams = await searchParams
      const currentPage = Number(resolvedSearchParams.page) || 1

      return <ArticleListTemplate page={page} currentPage={currentPage} />
    }

    // Standard page with blocks
    return <BlocksRenderer blocks={page.blocks} />
  }

  // No page found — try article by pathname
  if (segments && segments.length > 0) {
    const slug = segments[segments.length - 1]
    const article = await getArticle(slug, draft, locale)

    if (article) {
      // Verify full pathname matches if article has a pathname
      const pathname = resolvePathname({ segments })
      if (!article.pathname || article.pathname === pathname) {
        return <ArticleTemplate article={article} />
      }
    }
  }

  // Root path with no home page — show welcome/instructions
  if (!segments || segments.length === 0) {
    return <Welcome />
  }

  notFound()
}

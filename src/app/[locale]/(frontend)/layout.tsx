import React from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import '@/styles/index.css'
import { Header } from '@/modules/layout/Header'
import { Footer } from '@/modules/layout/Footer'
import { ExitPreview } from '@/modules/layout/ExitPreview'
import { LivePreviewListener } from '@/modules/layout/LivePreviewListener'
import { getCachedGlobal } from '@/modules/common/data'
import type { GeneralSettings, SEOSettings } from '@/payload-types'
import { getGoogleFontsUrl } from '@/payload/constants/googleFonts'
import { getPayload } from '@/lib/payload/getPayload'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCachedGlobal<SEOSettings>('seo-settings', 0)

  return {
    title: {
      default: seo.siteName || 'Heionhub',
      template: `%s | ${seo.siteName || 'Heionhub'}`,
    },
    description: seo.tagline || '',
  }
}

export default async function RootLayout(props: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { children } = props
  const { locale } = await props.params

  // Next.js 15: calling draftMode() everywhere opts the entire layout into dynamic rendering.
  // We handle it gracefully so static routes like `/es` don't throw DYNAMIC_SERVER_USAGE.
  let isDraftMode = false
  try {
    const draft = await draftMode()
    isDraftMode = draft.isEnabled
  } catch (err) {
    // If it throws DYNAMIC_SERVER_USAGE here, we safely ignore it and assume not in draft mode.
  }

  // Load typography settings
  const general = await getCachedGlobal<GeneralSettings>('general-settings', 0).catch(() => null)
  const headingFont = general?.typography?.headingFont || 'Inter'
  const bodyFont = general?.typography?.bodyFont || 'Inter'
  const fontsUrl = getGoogleFontsUrl([headingFont, bodyFont])

  // Check if a home page exists — hide chrome (header/footer) when it doesn't
  const payload = await getPayload()
  const homeResult = await payload
    .find({
      collection: 'pages',
      where: { isHome: { equals: true } },
      limit: 1,
      depth: 0,
      locale: locale as any,
      select: { isHome: true },
    })
    .catch(() => ({ totalDocs: 0 }))
  const hasHomePage = homeResult.totalDocs > 0

  // Get locale messages for client components (e.g. LanguageSwitcher)
  // Explicitly passing { locale } prevents getMessages from reading headers() internally
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={fontsUrl} />
          </>
        )}
      </head>
      <body
        className="min-h-screen flex flex-col"
        style={
          {
            '--font-heading': `'${headingFont}', sans-serif`,
            '--font-body': `'${bodyFont}', sans-serif`,
            fontFamily: `'${bodyFont}', sans-serif`,
          } as React.CSSProperties
        }
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              {isDraftMode && <LivePreviewListener />}
              {isDraftMode && <ExitPreview />}
              {hasHomePage && <Header locale={locale} />}
              <main className="flex-1">{children}</main>
              {hasHomePage && <Footer locale={locale} />}
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

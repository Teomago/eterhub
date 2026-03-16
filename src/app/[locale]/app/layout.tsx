import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload/getPayload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import '@/styles/index.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { SidebarLayout } from './components/SidebarLayout'
import { getCachedGlobal } from '@/modules/common/data'
import type { GeneralSettings, SEOSettings } from '@/payload-types'
import { getGoogleFontsUrl } from '@/payload/constants/googleFonts'
import { Toaster } from '@/components/ui/sonner'
import { TransactionModal } from './components/TransactionModal'
import { ScheduledTransactionModal } from './scheduled-transactions/components/ScheduledTransactionModal'
import { AccountModal } from './accounts/components/AccountModal'
import { CategoryModal } from './categories/components/CategoryModal'
import { BudgetModal } from './budget/components/BudgetModal'
import { AuthSync } from './components/AuthSync'
import { TourProvider, type Tour } from '@/components/ui/tour'
import { tourSteps } from '@/lib/tour-constants'
import { markTourCompleted } from '@/app/actions/tour'
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

const tours: Tour[] = [
  {
    id: 'dashboard-onboarding',
    steps: [
      {
        id: tourSteps.totalBalance,
        title: 'Welcome to your Dashboard!',
        content: 'This is your total net balance across all your registered accounts.',
        side: 'bottom',
        align: 'start',
      },
      {
        id: tourSteps.budgetHealth,
        title: 'Keep an eye on spending',
        content:
          'Your active budgets and their progress are instantly visible here so you never overspend.',
        side: 'top',
        align: 'center',
      },
      {
        id: tourSteps.recentTransactions,
        title: 'Your Recent Activity',
        content: 'View your most recent transactions and activity at a glance.',
        side: 'bottom',
        align: 'center',
      },
      {
        id: tourSteps.quickAdd,
        title: 'Ready to track?',
        content:
          'Use the Quick Add buttons anywhere in the app to instantly record new income, expenses, or transfers.',
        side: 'bottom',
        align: 'end',
      },
    ],
  },
]

export default async function AppLayout(props: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { children } = props
  const { locale } = await props.params
  const payload = await getPayload()
  const headersList = await headers()

  // Load typography settings
  const general = await getCachedGlobal<GeneralSettings>('general-settings', 0).catch(() => null)
  const headingFont = general?.typography?.headingFont || 'Inter'
  const bodyFont = general?.typography?.bodyFont || 'Inter'
  const fontsUrl = getGoogleFontsUrl([headingFont, bodyFont])

  // Get locale messages
  const messages = await getMessages()

  // Fetch Kill-Switch Global Setting
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' as any }).catch(() => null)
  const isMultiLangEnabled = siteSettings?.enableMultiLanguage !== false

  const { user } = await payload.auth({ headers: headersList })

  console.log('App Layout Auth Check:', {
    hasUser: !!user,
    userId: user?.id,
    collection: user?.collection,
  })

  if (!user || (user.collection !== 'members' && user.collection !== 'users')) {
    console.log('Redirecting to login...')
    redirect('/login')
  }

  // Fetch data for the global transaction modal
  const accountsReq = payload.find({
    collection: 'accounts',
    where: { owner: { equals: user.id } },
    pagination: false,
  })

  const categoriesReq = payload.find({
    collection: 'categories',
    where: { or: [{ owner: { equals: user.id } }, { isDefault: { equals: true } }] },
    pagination: false,
    sort: 'name',
  })

  const [accounts, categories] = await Promise.all([accountsReq, categoriesReq])

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
        className="bg-gray-50 dark:bg-gray-900"
        style={
          {
            '--font-heading': `'${headingFont}', sans-serif`,
            '--font-body': `'${bodyFont}', sans-serif`,
            fontFamily: `'${bodyFont}', sans-serif`,
          } as React.CSSProperties
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <TourProvider
                tours={tours}
                onComplete={async (id) => {
                  'use server'
                  if (id === 'dashboard-onboarding') {
                    await markTourCompleted()
                  }
                }}
              >
                <AuthSync />
                <SidebarLayout isMultiLangEnabled={isMultiLangEnabled}>{children}</SidebarLayout>
                 <Toaster />
                 <React.Suspense fallback={null}>
                   <TransactionModal accounts={accounts.docs} categories={categories.docs} />
                 </React.Suspense>
                 <React.Suspense fallback={null}>
                   <ScheduledTransactionModal accounts={accounts.docs} categories={categories.docs} />
                 </React.Suspense>
                 <React.Suspense fallback={null}>
                   <AccountModal />
                 </React.Suspense>
                 <React.Suspense fallback={null}>
                   <CategoryModal />
                 </React.Suspense>
                 <React.Suspense fallback={null}>
                   <BudgetModal categories={categories.docs} />
                 </React.Suspense>
               </TourProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

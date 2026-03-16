import React from 'react'
import { isMember } from '@/lib/auth/typeGuards'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { Budget, Category } from '@/payload-types'
import { DashboardClient } from './components/DashboardClient'

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    redirect('/login')
  }

  // Current Month for Budgets (YYYY-MM)
  const now = new Date()
  const yearMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Fetch Core Data
  const [accounts, categories, budgetsRaw, scheduledTransactionsRaw] = await Promise.all([
    payload.find({
      collection: 'accounts',
      where: { owner: { equals: user.id } },
      pagination: false,
    }),
    payload.find({
      collection: 'categories',
      where: { or: [{ owner: { equals: user.id } }, { isDefault: { equals: true } }] },
      pagination: false,
    }),
    payload.find({
      collection: 'budgets',
      where: { and: [{ owner: { equals: user.id } }, { month: { equals: yearMonthStr } }] },
      pagination: false,
      depth: 1, // Get categories
    }),
    payload.find({
      collection: 'scheduled-transactions',
      where: { owner: { equals: user.id } },
      sort: 'nextDueDate',
      pagination: false,
      limit: 10,
    }),
  ])

  const totalBalanceCents = accounts.docs.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  const totalBalance = totalBalanceCents / 100

  // Fetch transactions for Recent Activity (Current Month)
  const recentTransactionsRaw = await payload.find({
    collection: 'transactions',
    where: {
      and: [{ owner: { equals: user.id } }],
    },
    sort: '-date',
    limit: 10,
    depth: 1,
  })

  // FETCH ACCELERATED BUDGET HEALTH FROM DB AGGREGATIONS
  const { getDashboardAggregationsWithCache } = await import('./reports/actions')
  const { dashboard } = await getDashboardAggregationsWithCache()
  const currentMonthCategorySpend = dashboard.currentMonthCategorySpend

  // Use the single source of truth from the DB for budgets
  const allBudgetsHealth = budgetsRaw.docs.map((budget: Budget) => {
    const spentCents = budget.currentSpend || 0
    const limitCents = budget.amount || 0
    const progress = limitCents > 0 ? (spentCents / limitCents) * 100 : 0
    const isOver = progress > 100

    const categoriesArray = Array.isArray(budget.category)
      ? budget.category
      : budget.category
        ? [budget.category]
        : []
    const firstCat = categoriesArray[0] as Category | undefined
    const categoryColor = firstCat?.color || null

    return {
      ...budget,
      spent: spentCents / 100,
      limit: limitCents / 100,
      progress: Math.min(progress, 100),
      isOver,
      categoryColor,
    }
  })

  // Sort by highest spend first, then take the top 3
  const budgetHealth = allBudgetsHealth.sort((a, b) => b.spent - a.spent).slice(0, 3)

  let hasCompletedTour = false
  let userCurrency: string | undefined
  if (isMember(user)) {
    hasCompletedTour = user.hasCompletedTour || false
    userCurrency = user.currency || undefined
  }

  const initialData = {
    totalBalance,
    budgetHealth,
    upcomingBills: scheduledTransactionsRaw.docs,
    recentTransactions: recentTransactionsRaw.docs,
    categories: categories.docs,
    hasCompletedTour,
    userCurrency,
  }

  return <DashboardClient initialData={initialData} />
}

'use client'

import React, { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, CircleHelp } from 'lucide-react'
import { Button } from '@/components/buttons/Button'
import { useTour } from '@/components/ui/tour'
import { getCategoryIcon } from '@/constants/category-icons'
import { TransactionActions } from '../transactions/components/TransactionActions'
import type { Budget, Category, ScheduledTransaction, Transaction } from '@/payload-types'
import { tourSteps } from '@/lib/tour-constants'
import { useTranslations } from 'next-intl'

interface DashboardData {
  totalBalance: number
  budgetHealth: Array<
    Budget & {
      spent: number
      limit: number
      progress: number
      isOver: boolean
      categoryColor: string | null
    }
  >
  upcomingBills: ScheduledTransaction[]
  recentTransactions: Transaction[]
  categories: Category[]
  hasCompletedTour: boolean
  userCurrency?: string
}

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const t = useTranslations('Dashboard')
  // Claude's Rule: COP fallback if user.currency is undefined or null
  const currency = initialData.userCurrency || 'COP'
  const formatAmount = (amount: number) =>
    amount.toLocaleString('es-CO', { style: 'currency', currency })

  // We'll set up a query to refetch this exact dataset every 30 seconds
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    // Dashboard data is refreshed via Server Components passing new initialData (Server Actions + router.refresh).
    // This dummy queryFn satisfies React Query v5's requirement.
    queryFn: async () => initialData,
    // We provide the initial data so the page renders instantly on the server without loading states
    initialData,
  })

  const tour = useTour()
  const startedRef = useRef(false)

  useEffect(() => {
    // Rely exclusively on the database flag returned from the server via initialData
    if (!dashboard.hasCompletedTour && !startedRef.current) {
      const timeout = setTimeout(() => {
        tour.start('dashboard-onboarding')
        startedRef.current = true
      }, 500) // Small delay to let animations/layout settle

      return () => clearTimeout(timeout)
    }
  }, [dashboard.hasCompletedTour, tour])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <div data-tour-step-id={tourSteps.quickAdd} className="flex items-center gap-2">
          <Link href="?addTx=true&type=income">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-900/20"
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              {t('income')}
            </Button>
          </Link>
          <Link href="?addTx=true&type=expense">
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {t('expense')}
            </Button>
          </Link>
          <Link href="?addTx=true&type=transfer">
            <Button size="sm" variant="outline">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {t('transfer')}
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground hover:text-foreground ml-2"
            onClick={() => tour.start('dashboard-onboarding')}
            title={t('takeTour')}
          >
            <CircleHelp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          data-tour-step-id={tourSteps.totalBalance}
          className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div className="text-sm font-medium text-muted-foreground">{t('totalBalance')}</div>
          <div className="text-2xl font-bold">
            {formatAmount(dashboard.totalBalance)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {/* Budget Health */}
        <div
          data-tour-step-id={tourSteps.budgetHealth}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">{t('budgetHealth')}</h3>
          <div className="space-y-4">
            {dashboard.budgetHealth.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noBudgets')}</p>
            ) : (
              dashboard.budgetHealth.map((b) => {
                const isIncome = b.budgetType === 'income'
                return (
                  <div key={b.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{b.name}</span>
                        <span className={`text-[9px] font-bold uppercase ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncome ? 'Goal' : 'Limit'}
                        </span>
                      </div>
                      <span className={!isIncome && b.isOver ? 'text-red-600 font-bold' : ''}>
                        ${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${
                          isIncome 
                            ? 'bg-green-500' 
                            : b.isOver ? 'bg-red-600' : 'bg-primary'
                        }`}
                        style={{
                          width: `${b.progress}%`,
                          backgroundColor: isIncome 
                            ? undefined 
                            : b.isOver ? undefined : b.categoryColor || undefined,
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">{t('upcomingBills')}</h3>
          <div className="space-y-4">
            {dashboard.upcomingBills.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noUpcoming')}</p>
            ) : (
              dashboard.upcomingBills.map((sub) => {
                const amount = sub.amount / 100
                return (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{sub.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {sub.frequency} - {t('due')} {new Date(sub.nextDueDate).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      {formatAmount(amount)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold" data-tour-step-id={tourSteps.recentTransactions}>
          {t('recentActivity')}
        </h2>
        <div className="space-y-4">
          {dashboard.recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">{t('noTransactions')}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {dashboard.recentTransactions.map((tx) => {
                const amount = tx.amount / 100
                const isExpense = tx.type === 'expense'
                const isTransfer = tx.type === 'transfer'
                const sign = isExpense ? '-' : isTransfer ? '' : '+'
                const colorClass = isExpense
                  ? 'text-red-600 dark:text-red-500'
                  : isTransfer
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-green-600 dark:text-green-500'

                // Resolve category name and icon
                let catName = t('uncategorized')
                let catColor = undefined
                let Icon = getCategoryIcon('default')

                if (tx.category && typeof tx.category === 'object' && 'name' in tx.category) {
                  catName = tx.category.name as string
                  catColor = tx.category.color

                  // If the category has a saved string icon, try to resolve it directly.
                  // Otherwise, fall back to resolving by the category name.
                  if ('icon' in tx.category && typeof tx.category.icon === 'string') {
                    Icon = getCategoryIcon(tx.category.icon)
                  } else {
                    Icon = getCategoryIcon(catName)
                  }
                }

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="p-2 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: catColor ? `${catColor}20` : 'rgba(156, 163, 175, 0.2)', // 20% opacity matching original design
                          color: catColor || '#6b7280',
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{tx.description || t('noDescription')}</div>
                        <div className="text-sm text-muted-foreground">
                          {catName} • {new Date(tx.date).toLocaleDateString('es-CO')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <div className={`font-bold ${colorClass}`}>
                        {sign}
                        {formatAmount(amount)}
                      </div>

                      <TransactionActions
                        transaction={tx}
                        accounts={[]} // We aren't doing the edit form here for now, handled by modal
                        categories={dashboard.categories}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

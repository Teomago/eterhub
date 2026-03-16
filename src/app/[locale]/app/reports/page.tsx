import React from 'react'
import { getPayload } from '@/lib/payload/getPayload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SpendingChart } from '@/components/charts/SpendingChart'
import { IncomeVsExpenseChart } from '@/components/charts/IncomeVsExpenseChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/display/Card'
import { getTranslations } from 'next-intl/server'

export default async function ReportsPage() {
  const payload = await getPayload()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    redirect('/login')
  }

  const t = await getTranslations('Miru.reports')

  // FETCH ACCELERATED ANALYTICS FROM DB AGGREGATIONS
  const { getAnalyticsAggregationsWithCache } = await import('./actions')
  const { analytics } = await getAnalyticsAggregationsWithCache()

  const totalIncome = analytics.totalIncome
  const totalExpense = analytics.totalExpense
  const currentMonthIncome = analytics.currentMonthIncome
  const currentMonthExpense = analytics.currentMonthExpense
  const incomeVsExpenseData = analytics.incomeVsExpenseData
  const combinedSpendingChartData = analytics.spendingChartData

  // Calculate net trend for 12 months
  const netTrend = totalIncome - totalExpense

  // Calculate monthly savings rate
  const savingsRate =
    currentMonthIncome > 0
      ? ((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('twelveMonthIncome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('twelveMonthExpense')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netTwelveMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {(totalIncome - totalExpense).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-80">{t('monthlySavingsRate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs opacity-70 mt-1">{t('currentMonth')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <IncomeVsExpenseChart data={incomeVsExpenseData} />
        <SpendingChart data={combinedSpendingChartData} />
      </div>
    </div>
  )
}

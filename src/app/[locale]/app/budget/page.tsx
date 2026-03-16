import React from 'react'
import { getPayload } from '@/lib/payload/getPayload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/buttons/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/display/Card'
import { Plus, Lock, PieChart } from 'lucide-react'
import { redirect } from 'next/navigation'
import { BudgetActions } from './components/BudgetActions'
import { getCategoryIcon } from '@/constants/category-icons'
import { getTranslations } from 'next-intl/server'

export default async function BudgetPage() {
  const payload = await getPayload()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) return redirect('/login')

  const t = await getTranslations('Miru.budget')

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  const budgets = await payload.find({
    collection: 'budgets',
    where: {
      and: [{ owner: { equals: user.id } }, { month: { equals: currentMonth } }],
    },
    depth: 1,
  })

  const categories = await payload.find({
    collection: 'categories',
    where: {
      owner: {
        equals: user.id,
      },
    },
    pagination: false,
    sort: 'name',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('titleMonth', { month: currentMonth })}</h1>
        <div className="flex space-x-2">
          <Link href="?addBudget=true">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createBudget')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.docs.length === 0 ? (
          <Card className="col-span-full shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <PieChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{t('noBudgetsFound')}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                {t('noBudgetsDesc')}
              </p>
              <Link href="?addBudget=true" className="mt-6">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createBudget')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          budgets.docs.map((budget) => {
            const category = typeof budget.category === 'object' ? budget.category : null
            const categoryName = category?.name || t('unknownCategory')

            const Icon = getCategoryIcon(category?.icon)
            const color = category?.color || '#000000'

            const currentAmount = budget.currentSpend || 0
            const progress = Math.min((currentAmount / budget.amount) * 100, 100)
            const isIncome = budget.budgetType === 'income'

            return (
              <Card
                key={budget.id}
                className={budget.locked ? 'opacity-90 border-dashed' : ''}
                style={{
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1 rounded-md bg-opacity-20 flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-wrap">
                        {categoryName}
                        {budget.name && (
                          <span className="text-muted-foreground font-normal">({budget.name})</span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isIncome ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {isIncome ? t('incomeGoal') : t('expenseLimit')}
                        </span>
                        {budget.locked && (
                          <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3" /> {t('locked')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <BudgetActions budget={budget} categories={categories.docs} />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {(currentAmount / 100).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      /{' '}
                      {(budget.amount / 100).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isIncome 
                          ? 'bg-green-500' 
                          : progress > 100 ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isIncome 
                          ? undefined 
                          : progress <= 100 ? color : undefined,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

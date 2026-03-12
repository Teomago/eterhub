'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/buttons/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/display/Card'
import { createBudget, updateBudget } from '@/app/[locale]/app/budget/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import type { Category, Budget } from '@/payload/payload-types'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  name: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format'),
  recurrenceType: z.enum(['monthly', 'fixed', 'indefinite']).default('monthly'),
  recurrenceDuration: z.number().min(2).max(24).optional(),
})

interface BudgetFormProps {
  categories: Category[]
  budget?: Budget
  onSuccess?: () => void
}

export function BudgetForm({ categories, budget, onSuccess }: BudgetFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Miru')
  const form = useForm({
    defaultValues: {
      category:
        budget?.category && typeof budget.category === 'object'
          ? budget.category.id
          : (budget?.category as string) || (categories.length > 0 ? categories[0].id : ''),
      name: (budget?.name as string) || '',
      amount: budget?.amount ? budget.amount / 100 : 0,
      month: budget?.month || new Date().toISOString().slice(0, 7), // YYYY-MM
      recurrenceType: 'monthly' as 'monthly' | 'fixed' | 'indefinite',
      recurrenceDuration: 3,
    },
    onSubmit: async ({ value }) => {
      let res
      if (budget) {
        res = await updateBudget(budget.id, value)
      } else {
        res = await createBudget(value)
      }

      if (res?.error) {
        toast.error(res.error)
        return
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/app/budget')
        router.refresh()
      }
    },
  })

  return (
    <Card className={!budget ? 'w-full max-w-lg mx-auto' : 'border-0 shadow-none'}>
      {!budget && (
        <CardHeader>
          <CardTitle>{t('budget.setBudget')}</CardTitle>
          <CardDescription>{t('budget.limitSpending')}</CardDescription>
        </CardHeader>
      )}
      <CardContent className={budget ? 'p-0' : ''}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="category"
            validators={{
              onChange: ({ value }) => {
                const res = budgetSchema.shape.category.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('budget.category')}</Label>
                <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('budget.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const res = budgetSchema.shape.name.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Budget Name (Optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Main Groceries"
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if ((value as any) === '') return 'Amount is required'
                const parsed = parseFloat(value.toString())
                if (isNaN(parsed)) return 'Amount is required'
                const res = budgetSchema.shape.amount.safeParse(parsed)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('budget.monthlyLimit')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === '' ? ('' as any) : parseFloat(e.target.value),
                    )
                  }
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="month">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('budget.month')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="month"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {!budget && (
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="recurrenceType">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{t('budget.recurrence')}</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: any) => field.handleChange(val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">One-time</SelectItem>
                        <SelectItem value="fixed">{t('budget.fixedDuration')}</SelectItem>
                        <SelectItem value="indefinite">Indefinite (1 Year)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field name="recurrenceDuration">
                {(field) => {
                  // only show if type is fixed
                  const type = form.getFieldValue('recurrenceType')
                  if (type !== 'fixed') return null
                  return (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Duration (Months)</Label>
                      <Input
                        type="number"
                        min={2}
                        max={24}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(parseInt(e.target.value))}
                      />
                    </div>
                  )
                }}
              </form.Field>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting ? 'Saving...' : budget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// @ts-nocheck
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
import {
  createScheduledTransaction,
  updateScheduledTransaction,
} from '@/app/[locale]/app/scheduled-transactions/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import type { Account, Category } from '@/payload/payload-types'
import { MoneyInput } from '@/components/ui/money-input'

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  nextDueDate: z.string(),
  account: z.string().optional(),
  category: z.string().optional(),
})

export function ScheduledTransactionForm({
  accounts,
  categories,
  initialData,
  onSuccess,
}: {
  accounts: Account[]
  categories: Category[]
  initialData?: any // Payload Subscription type is complex with relationships
  onSuccess?: () => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Miru.scheduled')
  // Helper to get ID from string or object
  const getId = (item: any) => (typeof item === 'object' && item?.id ? item.id : item)

  const defaultValues = initialData
    ? {
        name: initialData.name,
        amount: initialData.amount / 100,
        frequency: initialData.frequency as 'weekly' | 'monthly' | 'yearly',
        nextDueDate: initialData.nextDueDate.slice(0, 10),
        account: getId(initialData.account) || '',
        category: getId(initialData.category) || '',
      }
    : {
        name: '',
        amount: 0,
        frequency: 'monthly' as 'weekly' | 'monthly' | 'yearly',
        nextDueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        account: accounts.length > 0 ? accounts[0].id : '',
        category: '',
      }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // Ensure category and toAccount are undefined if empty string or "no-category"
      const payloadData = {
        ...value,
        category:
          value.category === 'no-category' || value.category === '' ? undefined : value.category,
        account: value.account === 'no-account' || value.account === '' ? undefined : value.account,
      }

      if (initialData) {
        await updateScheduledTransaction(initialData.id, payloadData)
      } else {
        await createScheduledTransaction(payloadData)
      }

      // Instantly refresh the Dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] })

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    },
  })

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? t('editSubscription') : t('addSubscription')}</CardTitle>
        <CardDescription>{t('recordNew')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const res = subscriptionSchema.shape.name.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('subscriptionName')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t('placeholderName')}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="amount"
              validators={{
                onChange: ({ value }) => {
                  if (value === '') return 'Amount is required'
                  const parsed = parseFloat(value.toString())
                  if (isNaN(parsed)) return 'Amount is required'
                  const res = subscriptionSchema.shape.amount.safeParse(parsed)
                  return res.success ? undefined : res.error.issues[0].message
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('amount')}</Label>
                  <MoneyInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(val) => field.handleChange(val)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="frequency">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('frequency')}</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as 'weekly' | 'monthly' | 'yearly')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectFrequency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t('weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="nextDueDate"
            validators={{
              onChange: ({ value }) => {
                const res = subscriptionSchema.shape.nextDueDate.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('nextDueDate')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="account">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('selectAccount')}</Label>
                <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-account">{t('noAccount')}</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('selectCategory')}</Label>
                <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">{t('noCategory')}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting
              ? t('saving')
              : initialData
                ? t('updateSubscription')
                : t('saveSubscription')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

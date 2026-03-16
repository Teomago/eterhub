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
import { createTransaction, updateTransaction } from '@/app/[locale]/app/transactions/actions'
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

const transactionSchema = z.object({
  amount: z.number(),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string(),
  description: z.string().optional(),
  account: z.string().min(1, 'Account is required'),
  toAccount: z.string().optional(),
  category: z.string().optional(),
})

export function TransactionForm({
  accounts,
  categories,
  initialData,
  onSuccess,
}: {
  accounts: Account[]
  categories: Category[]
  initialData?: any // Payload Transaction type is complex with relationships
  onSuccess?: () => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Miru')
  // Helper to get ID from string or object
  const getId = (item: any) => (typeof item === 'object' && item?.id ? item.id : item)

  const defaultValues = initialData
    ? {
        amount: initialData.amount / 100,
        type: initialData.type as 'income' | 'expense' | 'transfer',
        date: initialData.date.slice(0, 10),
        description: initialData.description || '',
        account: getId(initialData.account) || '',
        toAccount: getId(initialData.toAccount) || '',
        category: getId(initialData.category) || '',
      }
    : {
        amount: 0,
        type: 'expense' as 'income' | 'expense' | 'transfer',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        description: '',
        account: accounts.length > 0 ? accounts[0].id : '',
        toAccount: '',
        category: '',
      }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // Ensure category is undefined if empty string or "no-category"
      const payloadData = {
        ...value,
        category:
          value.category === 'no-category' || value.category === '' ? undefined : value.category,
        toAccount: value.toAccount === '' ? undefined : value.toAccount,
      }

      if (initialData) {
        await updateTransaction(initialData.id, payloadData)
      } else {
        await createTransaction(payloadData)
      }

      // Instantly refresh the Dashboard data without reloading the page
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    },
  })

  // Watch type to conditionally show toAccount
  // TanStack form 'useStore' or checking state in render.
  // form.state.values.type is available.

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{t('transactions.addTransaction')}</CardTitle>
        <CardDescription>{t('transactions.recordIncomeExpenseTransfer')}</CardDescription>
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
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="type">
              {(field) => (
              <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('transactions.type')}</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as 'income' | 'expense' | 'transfer')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('transactions.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">{t('transactions.expense')}</SelectItem>
                      <SelectItem value="income">{t('transactions.income')}</SelectItem>
                      <SelectItem value="transfer">{t('transactions.transfer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field
              name="date"
              validators={{
                onChange: ({ value }) => {
                  const res = transactionSchema.shape.date.safeParse(value)
                  return res.success ? undefined : res.error.issues[0].message
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('transactions.date')}</Label>
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
          </div>

          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (value === '') return 'Amount is required'
                const parsed = parseFloat(value.toString())
                if (isNaN(parsed)) return 'Amount is required'
                const res = transactionSchema.shape.amount.safeParse(parsed)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('transactions.amount')}</Label>
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

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('transactions.description')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t('transactions.placeholderDesc')}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="account"
            validators={{
              onChange: ({ value }) => {
                const res = transactionSchema.shape.account.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('transactions.account')}</Label>
                <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transactions.selectAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
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

          <form.Field name="category">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('transactions.category')}</Label>
                <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transactions.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">{t('transactions.noCategory')}</SelectItem>
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

          <form.Subscribe selector={(state) => [state.values.type]}>
            {([type]) => {
              if (type === 'transfer') {
                return (
                  <form.Field
                    name="toAccount"
                    validators={{
                      onChange: () => {
                        // Optional technically but required for transfer logic ideally.
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>{t('transactions.toAccount')}</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(val) => field.handleChange(val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('transactions.selectDestination')} />
                          </SelectTrigger>
                          <SelectContent>
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
                )
              }
              return null
            }}
          </form.Subscribe>

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting
              ? t('transactions.saving')
              : initialData
                ? t('transactions.updateTransaction')
                : t('transactions.saveTransaction')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

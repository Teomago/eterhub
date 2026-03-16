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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/display/Card'
import { createAccount, updateAccount } from '@/app/[locale]/app/accounts/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import type { Account } from '@/payload/payload-types'
import Link from 'next/link'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { MoneyInput } from '@/components/ui/money-input'

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['checking', 'savings', 'credit', 'cash', 'investment']),
  balance: z.number(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'COP']),
  color: z.string().optional(),
  creditLimit: z.number().optional(),
})

interface AccountFormProps {
  account?: Account
  onSuccess?: () => void
}

export function AccountForm({ account, onSuccess }: AccountFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Miru.accounts')
  const form = useForm({
    defaultValues: {
      name: account?.name || '',
      type:
        (account?.type as 'checking' | 'savings' | 'credit' | 'cash' | 'investment') || 'checking',
      balance: account?.balance ? account.balance / 100 : 0, // Convert cents to units for display
      currency: (account?.currency as 'USD' | 'EUR' | 'GBP' | 'COP') || 'USD',
      color: account?.color || '#000000',
      creditLimit: account?.creditLimit ? account.creditLimit / 100 : undefined,
    },
    onSubmit: async ({ value }) => {
      let res
      if (account) {
        res = await updateAccount(account.id, value)
      } else {
        res = await createAccount(value)
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
        router.push('/app/accounts')
        router.refresh()
      }
    },
  })

  return (
    <Card className={!account ? 'w-full max-w-lg mx-auto' : 'border-0 shadow-none'}>
      {!account && (
        <CardHeader>
          <CardTitle>{t('createAccount')}</CardTitle>
          <CardDescription>{t('addAccountDesc')}</CardDescription>
        </CardHeader>
      )}
      <CardContent className={account ? 'p-0' : ''}>
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
                const res = accountSchema.shape.name.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('accountName')}</Label>
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

          <form.Field name="type">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('accountType')}</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val) =>
                    field.handleChange(
                      val as 'checking' | 'savings' | 'credit' | 'cash' | 'investment',
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">{t('checking')}</SelectItem>
                    <SelectItem value="savings">{t('savings')}</SelectItem>
                    <SelectItem value="credit">{t('creditCard')}</SelectItem>
                    <SelectItem value="cash">{t('cash')}</SelectItem>
                    <SelectItem value="investment">{t('investment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="currency">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('currency')}</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as 'USD' | 'EUR' | 'GBP' | 'COP')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCurrency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="COP">COP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="color">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('color')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="color"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-10 w-12 p-1 cursor-pointer"
                    />
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="balance"
            validators={{
              onChange: ({ value }) => {
                const parsed = parseFloat(value.toString())
                const res = accountSchema.shape.balance.safeParse(parsed)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {account ? t('currentBalance') : t('initialBalance')}
                </Label>
                <MoneyInput
                  id={field.name}
                  name={field.name}
                  value={
                    field.state.value === 0 && field.state.meta.isTouched ? 0 : field.state.value
                  }
                  onBlur={field.handleBlur}
                  onChange={(val) => field.handleChange(val)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {account
                    ? t('balanceHelpText')
                    : "Enter your current actual bank balance. This will be the starting point for your tracking."}
                </p>
                {form.state.values.type === 'credit' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('creditHelpTextPositive')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {form.state.values.type === 'credit' && (
            <form.Field
              name="creditLimit"
              validators={{
                onChange: ({ value }) => {
                  if (value === undefined) return undefined
                  const parsed = parseFloat(value.toString())
                  return isNaN(parsed) || parsed < 0 ? 'Credit limit must be positive' : undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('creditLimit')}</Label>
                  <MoneyInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? 0}
                    onBlur={field.handleBlur}
                    onChange={(val) => field.handleChange(val)}
                    placeholder={t('placeholderLimit')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('limitHelpText')}
                  </p>
                </div>
              )}
            </form.Field>
          )}

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting ? t('saving') : account ? t('updateAccount') : t('createAccount')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

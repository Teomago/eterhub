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
import { createCategory, updateCategory } from '@/app/[locale]/app/categories/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { IconPicker } from '@/components/ui/icon-picker'
import type { Category } from '@/payload/payload-types'
import Link from 'next/link'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense', 'transfer']),
  icon: z.string().optional(),
  color: z.string().optional(),
})

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Miru')
  const form = useForm({
    defaultValues: {
      name: category?.name || '',
      type: (category?.type as 'income' | 'expense' | 'transfer') || 'expense',
      icon: category?.icon || '',
      color: category?.color || '#000000',
    },
    onSubmit: async ({ value }) => {
      let res
      if (category) {
        res = await updateCategory(category.id, value)
      } else {
        res = await createCategory(value)
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
        router.push('/app/categories')
        router.refresh()
      }
    },
  })

  return (
    <Card className={!category ? 'w-full max-w-lg mx-auto' : 'border-0 shadow-none'}>
      {!category && (
        <CardHeader>
          <CardTitle>{category ? 'Edit Category' : 'New Category'}</CardTitle>
          <CardDescription>
            {category ? 'Update your category details.' : 'Create a new category.'}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={category ? 'p-0' : ''}>
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
                const res = categorySchema.shape.name.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('categories.categoryName')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Groceries"
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
                <Label htmlFor={field.name}>{t('categories.type')}</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val) =>
                    field.handleChange(val as 'income' | 'expense' | 'transfer')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('categories.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">{t('categories.expense')}</SelectItem>
                    <SelectItem value="income">{t('categories.income')}</SelectItem>
                    <SelectItem value="transfer">{t('categories.transfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="icon">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('categories.icon')}</Label>
                  <IconPicker
                    value={field.state.value || ''}
                    onChange={(val) => field.handleChange(val)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="color">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t('categories.color')}</Label>
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

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting
              ? 'Saving...'
              : category
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BudgetForm } from './BudgetForm'
import type { Category } from '@/payload-types'

export function BudgetModal({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const t = useTranslations('Miru')

  const isAddingBudget = searchParams.get('addBudget') === 'true'

  useEffect(() => {
    if (isAddingBudget) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [isAddingBudget])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('addBudget')
      router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false })
    }
  }

  const handleSuccess = () => {
    handleOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="mb-4">
          <DialogTitle>{t('budget.createBudget')}</DialogTitle>
          <DialogDescription>{t('budget.setSpendingLimits')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <BudgetForm categories={categories} onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Account, Category } from '@/payload-types'
import { ScheduledTransactionForm } from './ScheduledTransactionForm'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export function ScheduledTransactionModal({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const t = useTranslations('Miru')

  const isAddingScheduled = searchParams.get('addScheduled') === 'true' || searchParams.get('addSub') === 'true'
 
   useEffect(() => {
     if (isAddingScheduled) {
       setOpen(true)
     } else {
       setOpen(false)
     }
   }, [isAddingScheduled])
 
   const handleOpenChange = (newOpen: boolean) => {
     setOpen(newOpen)
     if (!newOpen) {
       // Close modal out entirely and remove search params
       const newSearchParams = new URLSearchParams(searchParams)
       newSearchParams.delete('addSub')
       newSearchParams.delete('addScheduled')
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
        <VisuallyHidden>
          <DialogTitle>{t('scheduled.addSubscription')}</DialogTitle>
          <DialogDescription>{t('scheduled.formToAdd')}</DialogDescription>
        </VisuallyHidden>
        <div className="py-4">
          <ScheduledTransactionForm
            accounts={accounts}
            categories={categories}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

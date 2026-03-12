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
import { CategoryForm } from './CategoryForm'

export function CategoryModal() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const t = useTranslations('Miru')

  const isAddingCategory = searchParams.get('addCategory') === 'true'

  useEffect(() => {
    if (isAddingCategory) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [isAddingCategory])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('addCategory')
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
          <DialogTitle>{t('categories.addCategory')}</DialogTitle>
          <DialogDescription>{t('categories.createNewCategory')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CategoryForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

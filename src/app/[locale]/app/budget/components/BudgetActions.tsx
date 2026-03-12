'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/buttons/Button'
import { MoreVertical, Edit, Trash, Lock, Unlock, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BudgetForm } from './BudgetForm'
import { useDeleteBudget, useToggleBudgetLock } from '@/hooks/useBudgetMutations'
import type { Budget, Category } from '@/payload/payload-types'
import { useRouter } from 'next/navigation'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface BudgetActionsProps {
  budget: Budget
  categories: Category[]
}

export function BudgetActions({ budget, categories }: BudgetActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openLock, setOpenLock] = useState(false)
  const router = useRouter()
  const t = useTranslations('Miru')

  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget()
  const { mutate: toggleLock, isPending: isToggling } = useToggleBudgetLock()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting || isToggling}>
            <span className="sr-only">Open menu</span>
            {isDeleting || isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenLock(true)} disabled={isToggling}>
            {budget.locked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Lock
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('budget.editBudget')}</DialogTitle>
            <DialogDescription>{t('budget.makeChanges')}</DialogDescription>
          </DialogHeader>
          <BudgetForm
            categories={categories}
            budget={budget}
            onSuccess={() => {
              setOpenEdit(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openLock} onOpenChange={setOpenLock}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{budget.locked ? 'Unlock Budget?' : 'Lock Budget?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {budget.locked
                ? 'Unlocking this budget will allow you to edit it again.'
                : 'Locking this budget prevents accidental edits or spending updates (if enforced).'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toggleLock({ id: budget.id, locked: !budget.locked })}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : budget.locked ? (
                'Unlock'
              ) : (
                'Lock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('budget.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('budget.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBudget(budget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

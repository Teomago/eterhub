'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MoreHorizontal, Trash, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/buttons/Button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import type { Account, Category, Transaction } from '@/payload/payload-types'
import { deleteTransaction } from '@/app/[locale]/app/transactions/actions'
import { TransactionForm } from './TransactionForm' // We need to update TransactionForm to support edit

interface TransactionActionsProps {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
}

export function TransactionActions({ transaction, accounts, categories }: TransactionActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Miru')

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTransaction(transaction.id)
    setIsDeleting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Transaction deleted successfully')
      setOpenDelete(false)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      router.refresh()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('transactions.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction and revert its effect on your account
              balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('transactions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('transactions.editTransaction')}</DialogTitle>
            <DialogDescription>{t('transactions.makeChanges')}</DialogDescription>
          </DialogHeader>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            initialData={transaction}
            onSuccess={() => {
              setOpenEdit(false)
              toast.success('Transaction updated')
              queryClient.invalidateQueries({ queryKey: ['transactions'] })
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

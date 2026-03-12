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
import { MoreVertical, Edit, Trash, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AccountForm } from './AccountForm'
import { useDeleteAccount } from '@/hooks/useAccountMutations'
import type { Account } from '@/payload/payload-types'
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

interface AccountActionsProps {
  account: Account
}

export function AccountActions({ account }: AccountActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const router = useRouter()
  const t = useTranslations('Miru')

  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
            <span className="sr-only">Open menu</span>
            {isDeleting ? (
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
            <DialogTitle>{t('accounts.editAccount')}</DialogTitle>
            <DialogDescription>{t('accounts.updateDetails')}</DialogDescription>
          </DialogHeader>
          <AccountForm
            account={account}
            onSuccess={() => {
              setOpenEdit(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('accounts.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will orphan its transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('accounts.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccount(account.id)}
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

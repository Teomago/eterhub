'use client'

import React, { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { getTransactionsPaginated, deleteSelectedTransactions, nukeAllTransactions } from '../actions'
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Loader2, Trash2 } from 'lucide-react'
import { getCategoryIcon } from '@/constants/category-icons'
import { TransactionActions } from './TransactionActions'
import type { Category, Account, Transaction } from '@/payload/payload-types'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/buttons/Button'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  initialData: any
  searchParams: any
  accounts: Account[]
  categories: Category[]
}

export function TransactionsClientList({ initialData, searchParams, accounts, categories }: Props) {
  const { ref, inView } = useInView()
  const t = useTranslations('Miru.transactions')
  const tDashboard = useTranslations('Dashboard')
  const queryClient = useQueryClient()

  const [mounted, setMounted] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showNukeConfirm, setShowNukeConfirm] = React.useState(false)
  const [nukeInput, setNukeInput] = React.useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['transactions', searchParams],
    queryFn: async ({ pageParam = 1 }) => {
      // Fetch the next page using the Server Action
      return getTransactionsPaginated(searchParams, pageParam, 50)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
    staleTime: 0,
  })

  // When intersection observer triggers, fetch next page
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const flattenDocs = data?.pages.flatMap((page) => page.docs) || []

  if (status === 'error') {
    return <div className="text-center py-10 text-red-500">{t('errorLoading')}</div>
  }

  if (flattenDocs.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {t('noTransactionsFound')}
      </div>
    )
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    const res = await deleteSelectedTransactions(selectedIds)
    setIsDeleting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(t('bulkDeleteToastSuccess'))
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  }

  const handleNukeAll = async () => {
    if (nukeInput !== 'DELETE') return
    setIsDeleting(true)
    const res = await nukeAllTransactions()
    setIsDeleting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(t('nukeToastSuccess'))
      setShowNukeConfirm(false)
      setNukeInput('')
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  }

  return (
    <div className="space-y-4">
      {/* Nuke All Modal */}
      <Dialog open={showNukeConfirm} onOpenChange={setShowNukeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive font-bold">{t('nukeAllTitle')}</DialogTitle>
            <DialogDescription>{t('nukeConfirmText')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={nukeInput} 
              onChange={(e) => setNukeInput(e.target.value)} 
              placeholder={t('nukeConfirmPlaceholder')} 
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNukeConfirm(false)} disabled={isDeleting}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleNukeAll} disabled={isDeleting || nukeInput !== 'DELETE'}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isDeleting ? t('deleting') : t('nukeAllTitle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg border">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {t('bulkDeleteTitle')} ({selectedIds.length})
            </Button>
          )}
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => setShowNukeConfirm(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('nukeAllTitle')}
        </Button>
      </div>

      {flattenDocs.map((tx: Transaction) => {
        const account = typeof tx.account === 'object' ? tx.account : null
        const category = typeof tx.category === 'object' ? tx.category : null

        let Icon = category ? getCategoryIcon(category.icon) : ArrowRightLeft
        let color = category?.color || '#6b7280'
        let colorClass = 'text-gray-500'
        let sign = ''

        if (tx.type === 'income') {
          if (!category) Icon = ArrowDownLeft
          if (!category?.color) color = '#16a34a'
          colorClass = 'text-green-600'
          sign = '+'
        } else if (tx.type === 'expense') {
          if (!category) Icon = ArrowUpRight
          if (!category?.color) color = '#dc2626'
          colorClass = 'text-red-600'
          sign = '-'
        }

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Checkbox 
                checked={selectedIds.includes(tx.id)} 
                onCheckedChange={(checked: boolean | "indeterminate") => {
                  if (checked === true) setSelectedIds([...selectedIds, tx.id])
                  else setSelectedIds(selectedIds.filter(id => id !== tx.id))
                }}
              />
              <div
                className="p-2 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{tx.description || tDashboard('noDescription')}</div>
                <div className="text-sm text-muted-foreground">
                  {`${new Date(tx.date).toLocaleDateString('es-CO')} • ${category?.name || tDashboard('uncategorized')} • ${account?.name}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-bold ${colorClass}`}>
                {sign}
                {(tx.amount / 100).toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </div>
              <TransactionActions transaction={tx} accounts={accounts} categories={categories} />
            </div>
          </div>
        )
      })}

      {/* Loading Spinner at the bottom when fetching next page */}
      <div ref={ref} className="py-4 flex justify-center">
        {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
      </div>
    </div>
  )
}

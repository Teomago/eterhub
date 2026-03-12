'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/buttons/Button'
import { Search, X, Filter } from 'lucide-react'
import { Account, Category } from '@/payload-types'
import { useDebounce } from '@/hooks/use-debounce'

type TransactionFilterProps = {
  accounts: Account[]
  categories: Category[]
}

export function TransactionFilter({ accounts, categories }: TransactionFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Miru')

  // State for filters
  const [search, setSearch] = useState(searchParams.get('description') || '')
  const [dateRange, setDateRange] = useState(searchParams.get('dateRange') || 'all')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [account, setAccount] = useState(searchParams.get('account') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || '-date')

  const debouncedSearch = useDebounce(search, 500)

  // Sync state with URL when Search Params change (e.g. back button)
  useEffect(() => {
    setSearch(searchParams.get('description') || '')
    setDateRange(searchParams.get('dateRange') || 'all')
    setType(searchParams.get('type') || 'all')
    setCategory(searchParams.get('category') || 'all')
    setAccount(searchParams.get('account') || 'all')
    setSort(searchParams.get('sort') || '-date')
  }, [searchParams])

  // Effect to update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    if (debouncedSearch) {
      params.set('description', debouncedSearch)
    } else {
      params.delete('description')
    }

    if (dateRange && dateRange !== 'all') {
      params.set('dateRange', dateRange)
    } else {
      params.delete('dateRange')
    }

    if (type && type !== 'all') {
      params.set('type', type)
    } else {
      params.delete('type')
    }

    if (category && category !== 'all') {
      params.set('category', category)
    } else {
      params.delete('category')
    }

    if (account && account !== 'all') {
      params.set('account', account)
    } else {
      params.delete('account')
    }

    if (sort) {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }, [
    debouncedSearch,
    dateRange,
    type,
    category,
    account,
    sort,
    pathname,
    router,
    searchParams, // Include searchParams to strictly follow exhaustive-deps, though logic inside uses current state
  ])

  const clearFilters = () => {
    setSearch('')
    setDateRange('all')
    setType('all')
    setCategory('all')
    setAccount('all')
    setSort('-date')
    router.replace(pathname)
  }

  const hasActiveFilters =
    search !== '' ||
    dateRange !== 'all' ||
    type !== 'all' ||
    category !== 'all' ||
    account !== 'all' ||
    sort !== '-date'

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto h-8 px-2 text-xs"
          >
            <X className="mr-2 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('transactions.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Date Range */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue placeholder={t('transactions.dateRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('transactions.allTime')}</SelectItem>
            <SelectItem value="thisMonth">{t('transactions.thisMonth')}</SelectItem>
            <SelectItem value="lastMonth">{t('transactions.lastMonth')}</SelectItem>
            <SelectItem value="last3Months">{t('transactions.last3Months')}</SelectItem>
            <SelectItem value="thisYear">{t('transactions.thisYear')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Type */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder={t('transactions.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('transactions.allTypes')}</SelectItem>
            <SelectItem value="income">{t('transactions.income')}</SelectItem>
            <SelectItem value="expense">{t('transactions.expense')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t('transactions.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('transactions.allCategories')}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Account */}
        <Select value={account} onValueChange={setAccount}>
          <SelectTrigger>
            <SelectValue placeholder={t('transactions.account')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('transactions.allAccounts')}</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder={t('transactions.sort')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-date">{t('transactions.newestFirst')}</SelectItem>
            <SelectItem value="date">{t('transactions.oldestFirst')}</SelectItem>
            <SelectItem value="-amount">Amount (High-Low)</SelectItem>
            <SelectItem value="amount">Amount (Low-High)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

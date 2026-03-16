'use server'

import { assertUser } from '@/lib/auth/assertUser'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Member } from '@/payload/payload-types'
import * as Sentry from '@sentry/nextjs'
import { APIError } from '@/lib/utils/APIError'

const createTransactionSchema = z.object({
  amount: z.number(),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string(), // ISO string from date picker
  description: z.string().optional(),
  account: z.string().min(1, 'Account is required'), // ID
  toAccount: z.string().optional(), // ID
  category: z.string().optional(), // Category ID
})

export async function createTransaction(data: z.infer<typeof createTransactionSchema>) {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    return { error: 'Unauthorized' }
  }
  const { user, payload } = authContext

  try {
    const account = await payload.findByID({
      collection: 'accounts',
      id: data.account,
    })

    // Safe checks for owner
    const accountOwnerId =
      account && typeof account.owner === 'object' ? (account.owner as Member).id : account?.owner

    if (!account || accountOwnerId !== user.id) {
      throw new APIError('Unauthorized access to account', 403, true)
    }

    if (data.type === 'transfer' && data.toAccount) {
      const toAccount = await payload.findByID({
        collection: 'accounts',
        id: data.toAccount,
      })

      const toAccountOwnerId =
        toAccount && typeof toAccount.owner === 'object'
          ? (toAccount.owner as Member).id
          : toAccount?.owner

      if (!toAccount || toAccountOwnerId !== user.id) {
        throw new APIError('Unauthorized access to destination account', 403, true)
      }
    }

    const amountInCents = Math.round(data.amount * 100)

    await payload.create({
      collection: 'transactions',
      data: {
        amount: amountInCents,
        type: data.type,
        date: data.date,
        description: data.description,
        account: data.account,
        toAccount: data.type === 'transfer' ? data.toAccount : undefined,
        category: data.category,
        owner: user.id,
      },
    })
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
      extra: { inputData: data },
    })

    if (error instanceof APIError && error.isPublic) {
      return { error: error.message }
    }
    return { error: 'An unexpected application error occurred. Our team has been notified.' }
  }

  revalidatePath('/[locale]/app', 'layout')
  redirect('/app/transactions')
}

export async function deleteTransaction(id: string) {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    return { error: 'Unauthorized' }
  }
  const { user, payload } = authContext

  try {
    const existing = await payload.findByID({
      collection: 'transactions',
      id,
    })

    const ownerId =
      existing && existing.owner
        ? typeof existing.owner === 'object'
          ? existing.owner.id
          : existing.owner
        : null

    if (!existing || ownerId !== user.id) {
      throw new APIError('Transaction not found or unauthorized', 404, true)
    }

    await payload.delete({
      collection: 'transactions',
      id,
    })

    revalidatePath('/[locale]/app', 'layout')
    return { success: true }
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
      extra: { transactionId: id },
    })

    if (error instanceof APIError && error.isPublic) {
      return { error: error.message }
    }
    return { error: 'An unexpected application error occurred. Our team has been notified.' }
  }
}

export async function updateTransaction(id: string, data: z.infer<typeof createTransactionSchema>) {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    return { error: 'Unauthorized' }
  }
  const { user, payload } = authContext

  try {
    const existing = await payload.findByID({
      collection: 'transactions',
      id,
    })

    const ownerId =
      existing && existing.owner
        ? typeof existing.owner === 'object'
          ? existing.owner.id
          : existing.owner
        : null

    if (!existing || ownerId !== user.id) {
      throw new APIError('Transaction not found or unauthorized', 404, true)
    }

    // Verify ownership of the NEW account (Defense in Depth — prevents IDOR on account reassignment)
    const newAccount = await payload.findByID({
      collection: 'accounts',
      id: data.account,
    })
    const newAccountOwnerId =
      newAccount && typeof newAccount.owner === 'object'
        ? (newAccount.owner as Member).id
        : newAccount?.owner
    if (!newAccount || newAccountOwnerId !== user.id) {
      throw new APIError('Unauthorized access to account', 403, true)
    }

    if (data.type === 'transfer' && data.toAccount) {
      const toAccount = await payload.findByID({
        collection: 'accounts',
        id: data.toAccount,
      })
      const toAccountOwnerId =
        toAccount && typeof toAccount.owner === 'object'
          ? (toAccount.owner as Member).id
          : toAccount?.owner
      if (!toAccount || toAccountOwnerId !== user.id) {
        throw new APIError('Unauthorized access to destination account', 403, true)
      }
    }

    const newAmountInCents = Math.round(data.amount * 100)
    await payload.update({
      collection: 'transactions',
      id,
      data: {
        amount: newAmountInCents,
        type: data.type,
        date: data.date,
        description: data.description,
        account: data.account,
        toAccount: data.type === 'transfer' ? data.toAccount : undefined,
      },
    })

    revalidatePath('/[locale]/app', 'layout')
    return { success: true }
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
      extra: { transactionId: id, inputData: data },
    })

    if (error instanceof APIError && error.isPublic) {
      return { error: error.message }
    }
    return { error: 'An unexpected application error occurred. Our team has been notified.' }
  }
}

export async function exportFilteredTransactions(params: {
  description?: string
  dateRange?: string
  type?: string
  category?: string
  account?: string
  sort?: string
}) {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    return { success: false, error: 'Unauthorized' }
  }
  const { user, payload } = authContext

  try {
    const where: any = {
      and: [{ owner: { equals: user.id } }],
    }

    if (params.description) {
      where.and.push({ description: { contains: params.description } })
    }

    if (params.type && params.type !== 'all') {
      where.and.push({ type: { equals: params.type } })
    }

    if (params.category && params.category !== 'all') {
      where.and.push({ category: { equals: params.category } })
    }

    if (params.account && params.account !== 'all') {
      where.and.push({ account: { equals: params.account } })
    }

    if (params.dateRange && params.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date | undefined
      let endDate: Date | undefined

      switch (params.dateRange) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
          break
      }

      if (startDate && endDate) {
        where.and.push({
          date: {
            greater_than_equal: startDate.toISOString(),
            less_than_equal: endDate.toISOString(),
          },
        })
      }
    }

    const transactions = await payload.find({
      collection: 'transactions',
      where,
      sort: params.sort || '-date',
      limit: 10000,
      depth: 1,
    })

    const flatData = transactions.docs.map((tx) => {
      const accountObj = typeof tx.account === 'object' ? tx.account : null
      const categoryObj = typeof tx.category === 'object' ? tx.category : null

      return {
        Date: new Date(tx.date).toISOString().split('T')[0],
        Description: tx.description || '',
        Amount: (tx.amount / 100).toFixed(2),
        Type: tx.type,
        CategoryName: categoryObj?.name || 'Uncategorized',
        AccountName: accountObj?.name || 'Default Account',
      }
    })

    return { success: true, data: flatData }
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
      extra: { params },
    })

    // Check for APIError for symmetry, though standard export errors may also be unexpected
    if (error instanceof APIError && error.isPublic) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Critical error rendering export query.' }
  }
}

export async function getTransactionsPaginated(
  params: {
    description?: string
    dateRange?: string
    type?: string
    category?: string
    account?: string
    sort?: string
  },
  page: number = 1,
  limit: number = 50,
) {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    throw new Error('Unauthorized')
  }
  const { user, payload } = authContext

  try {
    const where: any = {
      and: [{ owner: { equals: user.id } }],
    }

    if (params.description) {
      where.and.push({ description: { contains: params.description } })
    }

    if (params.type && params.type !== 'all') {
      where.and.push({ type: { equals: params.type } })
    }

    if (params.category && params.category !== 'all') {
      where.and.push({ category: { equals: params.category } })
    }

    if (params.account && params.account !== 'all') {
      where.and.push({ account: { equals: params.account } })
    }

    if (params.dateRange && params.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date | undefined
      let endDate: Date | undefined

      switch (params.dateRange) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
          break
      }

      if (startDate && endDate) {
        where.and.push({
          date: {
            greater_than_equal: startDate.toISOString(),
            less_than_equal: endDate.toISOString(),
          },
        })
      }
    }

    const transactions = await payload.find({
      collection: 'transactions',
      where,
      sort: params.sort || '-date',
      limit,
      page,
      depth: 1,
    })

    return JSON.parse(JSON.stringify(transactions))
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
      extra: { params, page, limit },
    })

    throw error // Let the error boundary catch it since data-fetching throws rather than returns error strings
  }
}

export async function deleteSelectedTransactions(ids: string[]) {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    return { error: 'Unauthorized' }
  }
  const { user, payload } = authContext

  if (!ids || ids.length === 0) {
    return { error: 'No transactions selected' }
  }

  try {
    await payload.db.deleteMany({
      collection: 'transactions',
      where: {
        and: [
          { id: { in: ids } },
          { owner: { equals: user.id } }
        ]
      }
    })
    revalidatePath('/[locale]/app', 'layout')
    return { success: true }
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
      extra: { transactionIds: ids },
    })

    if (error instanceof APIError && error.isPublic) {
      return { error: error.message }
    }
    return { error: 'Failed to delete selected transactions.' }
  }
}

export async function nukeAllTransactions() {
  let authContext
  try {
    authContext = await assertUser()
  } catch (e) {
    return { error: 'Unauthorized' }
  }
  const { user, payload } = authContext

  try {
    await payload.db.deleteMany({
      collection: 'transactions',
      where: { owner: { equals: user.id } }
    })
    revalidatePath('/[locale]/app', 'layout')
    return { success: true }
  } catch (error: any) {
    Sentry.captureException(error, {
      user: { id: user?.id || 'anonymous' },
    })

    if (error instanceof APIError && error.isPublic) {
      return { error: error.message }
    }
    return { error: 'Failed to delete all transactions.' }
  }
}

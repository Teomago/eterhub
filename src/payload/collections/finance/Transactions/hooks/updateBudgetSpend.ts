import type { CollectionAfterChangeHook } from 'payload'
import { sql, eq } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'

// Helper to determine if we are adding or subtracting from the budget
function calculateDirectionalAmount(
  type: 'income' | 'expense' | 'transfer',
  amount: number,
): number {
  if (type === 'transfer') return 0
  return amount
}

function getId(relation: any): string | undefined {
  if (!relation) return undefined
  return typeof relation === 'object' ? relation.id : relation
}

async function applyDelta(payload: any, budgetId: string | undefined, amountToInject: number) {
  if (amountToInject === 0 || !budgetId) return

  try {
    const budgetsTable = payload.db.tables['budgets']

    if (budgetsTable) {
      await payload.db.drizzle
        .update(budgetsTable)
        .set({
          currentSpend: sql`${budgetsTable.currentSpend} + ${amountToInject}`,
        })
        .where(eq(budgetsTable.id, budgetId))
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { budgetId, amountToInject, hook: 'updateBudgetSpend' },
    })
    throw error // Rethrow — do NOT swallow
  }
}

async function findBudgetForTransaction(
  payload: any,
  doc: any,
): Promise<string | undefined> {
  const explicitBudgetId = getId(doc.budget)
  if (explicitBudgetId) return explicitBudgetId

  // Transfers and deleted transactions don't count towards budgets
  if (doc.type === 'transfer' || !doc.category || doc.status === 'deleted') return undefined

  const month = new Date(doc.date).toISOString().slice(0, 7) // YYYY-MM
  const ownerId = getId(doc.owner)

  try {
    const matchingBudgets = await payload.find({
      collection: 'budgets',
      where: {
        and: [
          { category: { equals: getId(doc.category) } },
          { owner: { equals: ownerId } },
          { month: { equals: month } },
          { status: { equals: 'active' } },
          { budgetType: { equals: doc.type } },
        ],
      },
      limit: 1,
      pagination: false,
      depth: 0,
    })

    return matchingBudgets.docs[0]?.id
  } catch (error) {
    console.error('[updateBudgetSpend] Failed to lookup budget:', error)
    return undefined
  }
}

export const updateBudgetSpend: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  const budgetId = await findBudgetForTransaction(payload, doc)
  const prevBudgetId = previousDoc ? await findBudgetForTransaction(payload, previousDoc) : undefined

  if (operation === 'create') {
    const deltaAmount = calculateDirectionalAmount(doc.type, doc.amount)
    await applyDelta(payload, budgetId, deltaAmount)
  } else if (operation === 'update') {
    if (
      doc.amount === previousDoc?.amount &&
      doc.type === previousDoc?.type &&
      budgetId === prevBudgetId &&
      doc.status === previousDoc?.status
    ) {
      return doc
    }

    // If status changed to deleted
    if (previousDoc?.status !== 'deleted' && doc.status === 'deleted') {
      const deltaAmount = -calculateDirectionalAmount(previousDoc.type, previousDoc.amount)
      await applyDelta(payload, prevBudgetId, deltaAmount)
      return doc
    }

    // If status changed from deleted
    if (previousDoc?.status === 'deleted' && doc.status !== 'deleted') {
      const restoreDelta = calculateDirectionalAmount(doc.type, doc.amount)
      await applyDelta(payload, budgetId, restoreDelta)
      return doc
    }

    // Handle normal updates (amount, type, or budget/category change)
    if (previousDoc?.status !== 'deleted') {
      const oldDelta = -calculateDirectionalAmount(
        previousDoc?.type || 'expense',
        previousDoc?.amount || 0,
      )
      await applyDelta(payload, prevBudgetId, oldDelta)
    }

    if (doc.status !== 'deleted') {
      const newDelta = calculateDirectionalAmount(doc.type, doc.amount)
      await applyDelta(payload, budgetId, newDelta)
    }
  }

  return doc
}

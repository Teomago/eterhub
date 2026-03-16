'use server'

import { assertUser } from '@/lib/auth/assertUser'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive(),
  name: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
  recurrenceType: z.enum(['monthly', 'fixed', 'indefinite']).default('monthly'),
  recurrenceDuration: z.number().min(2).max(24).optional(),
  budgetType: z.enum(['expense', 'income']).default('expense'),
})

export async function createBudget(data: z.infer<typeof createBudgetSchema>) {
  const { user, payload } = await assertUser()

  try {
    const amountInCents = Math.round(data.amount * 100)
    const recurrenceGroupId = crypto.randomUUID()
    const budgetsToCreate = []

    let monthsToCreate = 1
    if (data.recurrenceType === 'fixed' && data.recurrenceDuration) {
      monthsToCreate = data.recurrenceDuration
    } else if (data.recurrenceType === 'indefinite') {
      monthsToCreate = 12 // Create for next 12 months
    }

    const [startYear, startMonth] = data.month.split('-').map(Number)

    for (let i = 0; i < monthsToCreate; i++) {
      let currentYear = startYear
      let currentMonth = startMonth + i

      while (currentMonth > 12) {
        currentMonth -= 12
        currentYear++
      }

      const monthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`

      // Check existing
      const existing = await payload.find({
        collection: 'budgets',
        where: {
          and: [
            { category: { equals: data.category } },
            { month: { equals: monthStr } },
            { owner: { equals: user.id } },
          ],
        },
      })

      if (existing.totalDocs === 0) {
        budgetsToCreate.push({
          category: data.category,
          amount: amountInCents,
          name: data.name,
          month: monthStr,
          owner: user.id,
          recurrenceGroupId: monthsToCreate > 1 ? recurrenceGroupId : undefined,
          recurrenceType: data.recurrenceType,
          budgetType: data.budgetType,
        })
      }
    }

    if (budgetsToCreate.length === 0) {
      return { error: 'Budgets for these months already exist.' }
    }

    // Parallel creation
    await Promise.all(
      budgetsToCreate.map((b) =>
        payload.create({
          collection: 'budgets',
          data: b,
        }),
      ),
    )
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create budget' }
  }

  revalidatePath('/[locale]/app', 'layout')
  redirect('/app/budget')
}

export async function updateBudget(id: string, data: Partial<z.infer<typeof createBudgetSchema>>) {
  const { user, payload } = await assertUser()

  try {
    const updateData: any = {}
    if (data.amount) updateData.amount = Math.round(data.amount * 100)
    // Month/Category usually not changed in simple edit, but allowed logic:
    if (data.month) updateData.month = data.month
    if (data.category) updateData.category = data.category
    if (data.name !== undefined) updateData.name = data.name
    if (data.budgetType) updateData.budgetType = data.budgetType

    await payload.update({
      collection: 'budgets',
      id,
      data: updateData,
    })
  } catch (error) {
    console.error(error)
    return { error: 'Failed to update budget' }
  }

  revalidatePath('/[locale]/app', 'layout')
  redirect('/app/budget')
}

export async function deleteBudget(id: string) {
  const { user, payload } = await assertUser()

  try {
    const existing = await payload.findByID({
      collection: 'budgets',
      id,
    })

    if (!existing || !existing.owner) {
      return { error: 'Budget not found or unauthorized' }
    }

    const ownerId = typeof existing.owner === 'object' ? existing.owner.id : existing.owner

    if (ownerId !== user.id) {
      return { error: 'Budget not found or unauthorized' }
    }

    await payload.delete({
      collection: 'budgets',
      id,
    })
  } catch (error) {
    console.error(error)
    return { error: 'Failed to delete budget' }
  }

  revalidatePath('/[locale]/app', 'layout')
  redirect('/app/budget')
}

export async function toggleBudgetLock(id: string, locked: boolean) {
  const { user, payload } = await assertUser()

  try {
    await payload.update({
      collection: 'budgets',
      id,
      data: {
        locked,
      },
    })
  } catch (error) {
    console.error(error)
    return { error: 'Failed to update budget status' }
  }

  revalidatePath('/[locale]/app', 'layout')
  redirect('/app/budget')
}

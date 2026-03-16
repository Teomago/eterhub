import type { CollectionConfig } from 'payload'

import { access } from '@/payload/utils/access'
import { isActiveOwner } from '../access/isActiveOwner'

export const Budgets: CollectionConfig = {
  slug: 'budgets',
  labels: {
    singular: { en: 'Budget', es: 'Presupuesto' },
    plural: { en: 'Budgets', es: 'Presupuestos' },
  },
  admin: {
    useAsTitle: 'title',
    group: 'Finance',
    defaultColumns: ['title', 'month', 'amount'],
  },
  access: {
    create: ({ req: { user } }) => !!user,
    delete: access.owner('owner').adminLock(),
    read: isActiveOwner,
    update: access.owner('owner').adminLock(),
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.category && data.month) {
          try {
            const category = await req.payload.findByID({
              collection: 'categories',
              id: data.category,
            })
            if (category) {
              const namePart = data.name ? ` (${data.name})` : ''
              data.title = `${category.name}${namePart} - ${data.month}`
            }
          } catch (e) {
            // ignore
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      label: { en: 'Budget Name (Optional)', es: 'Nombre del Presupuesto (Opcional)' },
      admin: {
        description: { en: 'e.g. "Main Groceries" or "Holiday Fund"', es: 'ej. "Supermercado Principal" o "Fondo Vacaciones"' } as any,
      },
    },
    {
      name: 'month',
      type: 'text',
      required: true,
      label: { en: 'Month', es: 'Mes' },
      defaultValue: () => new Date().toISOString().slice(0, 7),
      admin: {
        description: { en: 'YYYY-MM format', es: 'Formato AAAA-MM' } as any,
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: { en: 'Category', es: 'Categoría' },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: { en: 'Budget Limit (Cents)', es: 'Límite del Presupuesto (Centavos)' },
    },
    {
      name: 'locked',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Locked (Prevent Spending)', es: 'Bloqueado (Prevenir Gastos)' },
    },
    {
      name: 'status',
      type: 'select',
      label: { en: 'Status', es: 'Estado' },
      options: [
        { label: { en: 'Active', es: 'Activo' }, value: 'active' },
        { label: { en: 'Deleted', es: 'Eliminado' }, value: 'deleted' },
      ],
      defaultValue: 'active',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'currentSpend',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Current Spend', es: 'Gasto Actual' },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'recurrenceGroupId',
      type: 'text',
      index: true,
      label: { en: 'Recurrence Group ID', es: 'ID de Grupo de Recurrencia' },
      admin: {
        readOnly: true,
        description: { en: 'ID to group recurring budgets together', es: 'ID para agrupar presupuestos recurrentes' } as any,
      },
    },
    {
      name: 'recurrenceType',
      type: 'select',
      label: { en: 'Recurrence Type', es: 'Tipo de Recurrencia' },
      options: [
        { label: { en: 'Monthly (One-time)', es: 'Mensual (Única vez)' }, value: 'monthly' },
        { label: { en: 'Fixed Duration', es: 'Duración Fija' }, value: 'fixed' },
        { label: { en: 'Indefinite', es: 'Indefinido' }, value: 'indefinite' },
      ],
      defaultValue: 'monthly',
    },
    {
      name: 'budgetType',
      type: 'select',
      required: true,
      label: { en: 'Budget Type', es: 'Tipo de Presupuesto' },
      options: [
        { label: { en: 'Expense Limit', es: 'Límite de Gasto' }, value: 'expense' },
        { label: { en: 'Income Goal', es: 'Meta de Ingreso' }, value: 'income' },
      ],
      defaultValue: 'expense',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            if (!value && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
      admin: {
        condition: () => false,
      },
    },
  ],
  custom: {
    figma: {
      enabled: false,
    },
  },
}

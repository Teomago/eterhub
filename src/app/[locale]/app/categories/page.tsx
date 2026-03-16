import React from 'react'
import { getPayload } from '@/lib/payload/getPayload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/buttons/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/display/Card'
import { CategoryActions } from './components/CategoryActions'
import { Plus, ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getCategoryIcon } from '@/constants/category-icons'

export default async function CategoriesPage() {
  const payload = await getPayload()
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) return redirect('/login')

  const accessibleCategories = await payload.find({
    collection: 'categories',
    where: {
      owner: {
        equals: user.id,
      },
    },
    pagination: false,
    sort: 'name',
  })

  const t = await getTranslations('Miru.categories')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/app/budget" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <Link href="?addCategory=true">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('addCategory')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accessibleCategories.docs.map((cat) => {
          const Icon = getCategoryIcon(cat.icon)
          return (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1 rounded-md bg-opacity-20 flex items-center justify-center"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}20` : '#f3f4f6',
                      color: cat.color || '#6b7280',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-medium">{cat.name}</CardTitle>
                </div>
                {cat.isDefault ? (
                  <span className="text-xs bg-gray-100 rounded px-1">Default</span>
                ) : (
                  <CategoryActions category={cat} />
                )}
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

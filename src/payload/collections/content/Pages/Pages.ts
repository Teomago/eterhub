import { registeredBlockSlugs } from '@/payload/blocks'
import { slug } from '@/payload/fields/slug'
import { queryBuilder } from '@/payload/fields/queryBuilder'
import { sortBuilder } from '@/payload/fields/sortBuilder'
import { getTranslation } from '@/payload/i18n/getTranslation'
import { access } from '@/payload/utils/access'
import type { CollectionConfig } from 'payload'
import { adminMenuGroups } from '@/payload/i18n/adminMenuGroups'
import { generatePreviewPath } from '@/lib/utils'
import { syncPathname } from './hooks/syncPathname'
import { validateHomePage } from './hooks/validateHomePage'
import { revalidatePageAfterChange, revalidatePageAfterDelete } from './hooks/revalidatePage'
import { getDynamicCollectionsOptions } from '@/payload/constants/dynamicCollections'
import { validateDynamicPageSafeChange } from '@/payload/validators/validateDynamicPageSafeChange'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: getTranslation('pages:singular'),
    plural: getTranslation('pages:plural'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pathname', 'updatedAt'],
    listSearchableFields: ['title', 'pathname'],
    group: adminMenuGroups.content,
    preview: (data, { locale }) => {
      const activeLocale = locale || 'en'
      const pathname = typeof data?.pathname === 'string' ? data.pathname : '/'
      const localizedPath = pathname.startsWith('/') 
        ? `/${activeLocale}${pathname}` 
        : `/${activeLocale}/${pathname}`
      return generatePreviewPath({ pathname: localizedPath })
    },
  },
  trash: true,
  versions: { drafts: true },
  access: {
    create: access.roles('editor'),
    read: access.roles('editor'),
    update: access.roles('editor'),
    delete: access(),
  },
  hooks: {
    afterChange: [revalidatePageAfterChange],
    afterDelete: [revalidatePageAfterDelete],
  },
  fields: [
    {
      name: 'title',
      label: getTranslation('general:title'),
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isHome',
      label: getTranslation('pages:isHome'),
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: getTranslation('pages:isHomeDescription'),
      },
      hooks: {
        beforeChange: [validateHomePage],
      },
    },
    slug(undefined, {
      index: false,
      unique: false,
      overrides: {
        admin: {
          condition: (data) => !data?.isHome,
        },
      },
    }),
    {
      name: 'pathname',
      label: getTranslation('general:pathname'),
      type: 'text',
      localized: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [syncPathname],
      },
    },
    {
      name: 'type',
      type: 'select',
      index: true,
      defaultValue: 'standard',
      validate: validateDynamicPageSafeChange('type'),
      admin: {
        position: 'sidebar',
        isClearable: false,
      },
      options: [
        { label: getTranslation('pages:typeStandard'), value: 'standard' },
        { label: getTranslation('pages:typeDynamic'), value: 'dynamic' },
      ],
    },
    {
      name: 'dynamicCollection',
      type: 'select',
      defaultValue: 'articles',
      validate: validateDynamicPageSafeChange('dynamicCollection'),
      admin: {
        position: 'sidebar',
        condition: (data) => data?.type === 'dynamic',
        isClearable: false,
      },
      options: getDynamicCollectionsOptions(),
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: getTranslation('general:content'),
          fields: [
            {
              name: 'blocks',
              type: 'blocks',
              localized: true,
              blocks: [],
              blockReferences: registeredBlockSlugs,
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.type === 'standard' || !siblingData?.type,
              },
            },
            {
              name: 'beforeList',
              label: getTranslation('pages:beforeList'),
              type: 'blocks',
              labels: {
                singular: getTranslation('pages:block'),
                plural: getTranslation('pages:blocks'),
              },
              localized: true,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'dynamic',
              },
              blocks: [],
              blockReferences: registeredBlockSlugs,
            },
            {
              name: 'afterList',
              label: getTranslation('pages:afterList'),
              type: 'blocks',
              labels: {
                singular: getTranslation('pages:block'),
                plural: getTranslation('pages:blocks'),
              },
              localized: true,
              blocks: [],
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'dynamic',
              },
              blockReferences: registeredBlockSlugs,
            },
          ],
        },
        {
          name: 'settings',
          label: getTranslation('general:settings'),
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'dynamic',
          },
          fields: [
            {
              name: 'query',
              type: 'group',
              admin: {
                description: 'Define which articles to display.',
              },
              fields: [
                queryBuilder({
                  name: 'where',
                  collectionSlug: 'articles',
                }),
                sortBuilder({
                  name: 'sort',
                  collectionSlug: 'articles',
                }),
              ],
            },
          ],
        },

      ],
    },
  ],
}

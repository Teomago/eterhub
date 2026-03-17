import { createBlock } from '@/payload/blocks/blockFactory'
import { adminBlockGroups } from '@/payload/i18n/adminBlockGroups'
import { defaultEditor } from '@/payload/lexical'
import { linkGroup } from '@/payload/fields/link/linkGroup'
import { getTranslation } from '@/payload/i18n/getTranslation'

export const HeroBlock = createBlock({
  slug: 'hero',
  interfaceName: 'HeroBlockType',
  labels: {
    singular: getTranslation('blocks:hero:label'),
    plural: getTranslation('blocks:hero:label'),
  },
  admin: {
    group: adminBlockGroups.content,
  },
  availableIn: ['root'],
  tabs: {
    fields: {
      general: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          label: getTranslation('blocks:hero:heading'),
        },
        {
          name: 'subheading',
          type: 'text',
          label: getTranslation('blocks:hero:subheading'),
        },
        {
          name: 'body',
          type: 'richText',
          label: getTranslation('blocks:hero:body'),
          editor: defaultEditor(),
        },
        linkGroup({
          appearances: ['default', 'secondary', 'outline', 'ghost'],
          overrides: {
            label: getTranslation('blocks:hero:links'),
            maxRows: 3,
          },
        }),
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          label: getTranslation('blocks:hero:media'),
        },
      ],
      design: (defaults) => [
        ...defaults,
        {
          name: 'layout',
          type: 'select',
          label: getTranslation('blocks:hero:layout'),
          defaultValue: 'contentLeft',
          admin: { isClearable: false },
          options: [
            { label: getTranslation('blocks:hero:contentLeft'), value: 'contentLeft' },
            { label: getTranslation('blocks:hero:contentRight'), value: 'contentRight' },
            { label: getTranslation('blocks:hero:contentCenter'), value: 'contentCenter' },
            { label: getTranslation('blocks:hero:overlay'), value: 'overlay' },
            { label: getTranslation('blocks:hero:fullOverlay'), value: 'fullOverlay' },
          ],
        },
        {
          name: 'heroHeight',
          type: 'select',
          label: getTranslation('blocks:hero:heroHeight'),
          defaultValue: 'default',
          admin: { isClearable: false },
          options: [
            { label: 'Default (70vh)', value: 'default' },
            { label: 'Medium (85vh)', value: 'medium' },
            { label: 'Full (100vh)', value: 'full' },
          ],
        },
      ],
    },
  },
})

import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      richText: {
        singular: 'Rich Text Block',
        plural: 'Rich Text Blocks',
        content: 'Content',
      },
    },
  },
  es: {
    blocks: {
      richText: {
        singular: 'Bloque de texto enriquecido',
        plural: 'Bloques de texto enriquecido',
        content: 'Contenido',
      },
    },
  },
})

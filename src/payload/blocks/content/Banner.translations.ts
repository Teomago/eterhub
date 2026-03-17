import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      banner: {
        label: 'Banner',
        content: 'Content',
        type: 'Type',
        typeInfo: 'Info',
        typeWarning: 'Warning',
        typeSuccess: 'Success',
        dismissible: 'Dismissible',
      },
    },
  },
  es: {
    blocks: {
      banner: {
        label: 'Banner',
        content: 'Contenido',
        type: 'Tipo',
        typeInfo: 'Información',
        typeWarning: 'Advertencia',
        typeSuccess: 'Éxito',
        dismissible: 'Se puede descartar',
      },
    },
  },
})

import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    fields: {
      padding: 'Padding',
      margin: 'Margin',
      spacingType: 'Spacing Type',
    },
  },
  es: {
    fields: {
      padding: 'Espaciado interno',
      margin: 'Espaciado externo',
      spacingType: 'Tipo de espaciado',
    },
  },
})

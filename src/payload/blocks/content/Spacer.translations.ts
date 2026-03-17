import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      spacer: {
        label: 'Spacer',
        height: 'Height',
        heightXs: 'Extra Small',
        heightSm: 'Small',
        heightMd: 'Medium',
        heightLg: 'Large',
        heightXl: 'Extra Large',
      },
    },
  },
  es: {
    blocks: {
      spacer: {
        label: 'Espaciador',
        height: 'Altura',
        heightXs: 'Muy pequeño',
        heightSm: 'Pequeño',
        heightMd: 'Medio',
        heightLg: 'Grande',
        heightXl: 'Muy grande',
      },
    },
  },
})

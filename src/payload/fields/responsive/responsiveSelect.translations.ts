import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    responsive: {
      base: 'Base',
      inherit: 'Inherit',
      responsiveValues: 'Responsive values',
    },
    fields: {
      fullWidth: 'Full Width',
    },
  },
  es: {
    responsive: {
      base: 'Base',
      inherit: 'Heredar',
      responsiveValues: 'Valores responsivos',
    },
    fields: {
      fullWidth: 'Ancho completo',
    },
  },
})

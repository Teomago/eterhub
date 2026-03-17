import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      icon: {
        singular: 'Icon',
        plural: 'Icons',
        mobile: 'Mobile',
        tablet: 'Tablet',
        desktop: 'Desktop',
      },
    },
    fields: { size: 'Size' },
  },
  es: {
    blocks: {
      icon: {
        singular: 'Icono',
        plural: 'Iconos',
        mobile: 'Móvil',
        tablet: 'Tablet',
        desktop: 'Escritorio',
      },
    },
    fields: { size: 'Tamaño' },
  },
})

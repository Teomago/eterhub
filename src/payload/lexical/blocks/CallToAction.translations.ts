import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      callToAction: {
        singular: 'Call to Action',
        plural: 'Call to Actions',
        marginTop: 'Margin Top',
        marginBottom: 'Margin Bottom',
        mobile: 'Mobile',
        tablet: 'Tablet',
        desktop: 'Desktop',
      },
    },
    fields: { align: 'Align' },
  },
  es: {
    blocks: {
      callToAction: {
        singular: 'Llamado a la acción',
        plural: 'Llamados a la acción',
        marginTop: 'Margen superior',
        marginBottom: 'Margen inferior',
        mobile: 'Móvil',
        tablet: 'Tablet',
        desktop: 'Escritorio',
      },
    },
    fields: { align: 'Alineación' },
  },
})

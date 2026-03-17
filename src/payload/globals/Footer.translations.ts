import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    footer: {
      label: 'Footer',
      navigation: 'Navigation',
      contact: 'Contact & Social',
      socialLinks: 'Social Links',
      platform: 'Platform',
      url: 'URL',
      legal: 'Legal',
      legalName: 'Legal Name',
      copyright: 'Copyright',
      copyrightDescription: 'e.g. © 2026 Company Name. All rights reserved.',
    },
  },
  es: {
    footer: {
      label: 'Pie de página',
      navigation: 'Navegación',
      contact: 'Contacto y redes sociales',
      socialLinks: 'Enlaces sociales',
      platform: 'Plataforma',
      url: 'URL',
      legal: 'Legal',
      legalName: 'Nombre legal de la empresa',
      copyright: 'Derechos de autor',
      copyrightDescription: 'Kz. © 2026 Empresa. Todos los derechos reservados.',
    },
  },
})

import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    settings: {
      globalLabel: 'General',
      typography: 'Typography',
      headingFont: 'Heading Font',
      headingFontDescription: 'Google Font used for headings (h1–h6)',
      bodyFont: 'Body Font',
      bodyFontDescription: 'Google Font used for body text',
    },
  },
  es: {
    settings: {
      globalLabel: 'Ajustes generales',
      typography: 'Tipografía',
      headingFont: 'Fuente de encabezado',
      headingFontDescription: 'Fuente de Google Fonts para encabezados (h1–h6)',
      bodyFont: 'Fuente de cuerpo',
      bodyFontDescription: 'Fuente de Google Fonts para el texto del cuerpo',
    },
  },
})

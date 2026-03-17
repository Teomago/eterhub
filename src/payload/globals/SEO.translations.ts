import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    seo: {
      title: 'SEO',
      siteName: 'Site Name',
      siteNameDescription: 'The name of your website',
      tagline: 'Site Tagline',
      taglineDescription: 'A short description of your website',
      defaultMeta: 'Default Meta',
      defaultMetaDescription: 'Default meta tags for pages without specific SEO settings',
    },
  },
  es: {
    seo: {
      title: 'SEO',
      siteName: 'Nombre del sitio',
      siteNameDescription: 'El nombre de tu sitio web',
      tagline: 'Eslogan',
      taglineDescription: 'Una breve descripción de tu sitio web',
      defaultMeta: 'Metadatos predeterminados',
      defaultMetaDescription: 'Metadatos predeterminados para páginas sin configuraciones SEO propias',
    },
  },
})

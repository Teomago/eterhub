import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    articles: {
      singular: 'Article',
      plural: 'Articles',
      tabGeneral: 'General',
      title: 'Title',
      content: 'Content',
      authors: 'Authors',
      tags: 'Tags',
      excerpt: 'Excerpt',
      featuredImage: 'Featured Image',
    },
    seo: {
      title: 'SEO',
    },
  },
  es: {
    articles: {
      singular: 'Artículo',
      plural: 'Artículos',
      tabGeneral: 'General',
      title: 'Título',
      content: 'Contenido',
      authors: 'Autores',
      tags: 'Etiquetas',
      excerpt: 'Extracto',
      featuredImage: 'Imagen destacada',
    },
    seo: {
      title: 'SEO',
    },
  },
})

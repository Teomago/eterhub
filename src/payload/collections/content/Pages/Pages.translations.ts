import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    pages: {
      singular: 'Page',
      plural: 'Pages',
      title: 'Title',
      pathname: 'Pathname',
      content: 'Content',
      blocks: 'Blocks',
      block: 'Block',
      settings: 'Settings',
      developer: 'Developer',
      beforeList: 'Before List',
      afterList: 'After List',
      typeStandard: 'Standard',
      typeDynamic: 'Dynamic',
      filterByTags: 'Filter by Tags',
      filterByTagsDescription: 'Only show articles with these tags. Leave empty to show all.',
    },
    seo: {
      title: 'SEO',
    },
  },
  es: {
    pages: {
      singular: 'Página',
      plural: 'Páginas',
      title: 'Título',
      pathname: 'Ruta',
      content: 'Contenido',
      blocks: 'Bloques',
      block: 'Bloque',
      settings: 'Ajustes',
      developer: 'Desarrollador',
      beforeList: 'Antes de la lista',
      afterList: 'Después de la lista',
      typeStandard: 'Estándar',
      typeDynamic: 'Dinámico',
      filterByTags: 'Filtrar por etiquetas',
      filterByTagsDescription: 'Mostrar solo los artículos con estas etiquetas. Dejar en blanco para mostrar todos.',
    },
    seo: {
      title: 'SEO',
    },
  },
})

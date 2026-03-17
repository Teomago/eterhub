import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    articleListing: {
      singular: 'Article Listing',
      plural: 'Article Listings',
      tags: 'Filter by Tags',
      tagsDescription: 'Only show articles with these tags. Leave empty to show all.',
      limit: 'Limit',
      columns: 'Columns',
      sort: 'Sort',
      sortNewest: 'Newest First',
      sortOldest: 'Oldest First',
      sortTitleAZ: 'Title A→Z',
      sortTitleZA: 'Title Z→A',
      showPagination: 'Show Pagination',
    },
  },
  es: {
    articleListing: {
      singular: 'Lista de artículos',
      plural: 'Listas de artículos',
      tags: 'Filtrar por etiquetas',
      tagsDescription: 'Mostrar solo los artículos con estas etiquetas. Dejar en blanco para mostrar todos.',
      limit: 'Límite',
      columns: 'Columnas',
      sort: 'Ordenar por',
      sortNewest: 'Más recientes primero',
      sortOldest: 'Más antiguos primero',
      sortTitleAZ: 'Título A→Z',
      sortTitleZA: 'Título Z→A',
      showPagination: 'Mostrar paginación',
    },
  },
})

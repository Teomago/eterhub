import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      gallery: {
        label: 'Gallery',
        heading: 'Heading',
        subheading: 'Subheading',
        images: 'Images',
        caption: 'Caption',
        layout: 'Layout',
        grid: 'Grid',
        masonry: 'Masonry',
        columns: 'Columns',
        lightbox: 'Enable Lightbox',
      },
    },
  },
  es: {
    blocks: {
      gallery: {
        label: 'Galería',
        heading: 'Encabezado',
        subheading: 'Subencabezado',
        images: 'Imágenes',
        caption: 'Leyenda',
        layout: 'Diseño',
        grid: 'Cuadrícula',
        masonry: 'Albañilería',
        columns: 'Columnas',
        lightbox: 'Habilitar Lightbox',
      },
    },
  },
})

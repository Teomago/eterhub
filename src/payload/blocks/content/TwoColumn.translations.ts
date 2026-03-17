import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      twoColumn: {
        label: 'Two Column',
        heading: 'Heading',
        content: 'Content',
        media: 'Media',
        mediaPosition: 'Media Position',
        left: 'Left',
        right: 'Right',
        verticalAlignment: 'Vertical Alignment',
        top: 'Top',
        center: 'Center',
        bottom: 'Bottom',
      },
    },
  },
  es: {
    blocks: {
      twoColumn: {
        label: 'Dos columnas',
        heading: 'Encabezado',
        content: 'Contenido',
        media: 'Medios',
        mediaPosition: 'Posición de medios',
        left: 'Izquierda',
        right: 'Derecha',
        verticalAlignment: 'Alineación vertical',
        top: 'Arriba',
        center: 'Centro',
        bottom: 'Abajo',
      },
    },
  },
})

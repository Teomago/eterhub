import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      hero: {
        label: 'Hero',
        heading: 'Heading',
        subheading: 'Subheading',
        body: 'Body',
        links: 'Call to Action',
        media: 'Media',
        layout: 'Layout',
        contentLeft: 'Content Left',
        contentRight: 'Content Right',
        contentCenter: 'Content Center',
        overlay: 'Overlay',
        fullOverlay: 'Full Overlay',
        heroHeight: 'Hero Height',
      },
    },
  },
  es: {
    blocks: {
      hero: {
        label: 'Hero',
        heading: 'Título',
        subheading: 'Subtítulo',
        body: 'Cuerpo',
        links: 'Llamada a la acción',
        media: 'Multimedia',
        layout: 'Diseño',
        contentLeft: 'Contenido a la izquierda',
        contentRight: 'Contenido a la derecha',
        contentCenter: 'Contenido centrado',
        overlay: 'Superpuesto',
        fullOverlay: 'Superpuesto (Ancho total)',
        heroHeight: 'Altura del Hero',
      },
    },
  },
})

import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      logoCloud: {
        label: 'Logo Cloud',
        heading: 'Heading',
        subheading: 'Subheading',
        logos: 'Logos',
        logoName: 'Name',
        logoImage: 'Logo Image',
        logoUrl: 'Link URL',
        layout: 'Layout',
        grid: 'Grid',
        marquee: 'Marquee',
        columns: 'Columns',
      },
    },
  },
  es: {
    blocks: {
      logoCloud: {
        label: 'Nube de logos',
        heading: 'Encabezado',
        subheading: 'Subencabezado',
        logos: 'Logos',
        logoName: 'Nombre',
        logoImage: 'Imagen del logo',
        logoUrl: 'URL del enlace',
        layout: 'Diseño',
        grid: 'Cuadrícula',
        marquee: 'Marquesina',
        columns: 'Columnas',
      },
    },
  },
})

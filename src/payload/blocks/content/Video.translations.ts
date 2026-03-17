import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      video: {
        label: 'Video',
        url: 'Video URL',
        urlDescription: 'YouTube or Vimeo URL',
        poster: 'Poster Image',
        aspectRatio: 'Aspect Ratio',
        ratio16x9: '16:9',
        ratio4x3: '4:3',
        ratio1x1: '1:1',
        heading: 'Heading',
      },
    },
  },
  es: {
    blocks: {
      video: {
        label: 'Video',
        url: 'URL del video',
        urlDescription: 'URL de YouTube o Vimeo',
        poster: 'Imagen de portada',
        aspectRatio: 'Relación de aspecto',
        ratio16x9: '16:9',
        ratio4x3: '4:3',
        ratio1x1: '1:1',
        heading: 'Encabezado',
      },
    },
  },
})

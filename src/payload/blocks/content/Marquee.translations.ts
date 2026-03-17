import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      marquee: {
        label: 'Marquee',
        items: 'Items',
        itemType: 'Type',
        typeText: 'Text',
        typeImage: 'Image',
        text: 'Text',
        image: 'Image',
        speed: 'Speed',
        slow: 'Slow',
        normal: 'Normal',
        fast: 'Fast',
        direction: 'Direction',
        ltr: 'Left to Right',
        rtl: 'Right to Left',
        pauseOnHover: 'Pause on Hover',
      },
    },
  },
  es: {
    blocks: {
      marquee: {
        label: 'Marquesina',
        items: 'Elementos',
        itemType: 'Tipo',
        typeText: 'Texto',
        typeImage: 'Imagen',
        text: 'Texto',
        image: 'Imagen',
        speed: 'Velocidad',
        slow: 'Lento',
        normal: 'Normal',
        fast: 'Rápido',
        direction: 'Dirección',
        ltr: 'De izquierda a derecha',
        rtl: 'De derecha a izquierda',
        pauseOnHover: 'Pausar al pasar el ratón',
      },
    },
  },
})

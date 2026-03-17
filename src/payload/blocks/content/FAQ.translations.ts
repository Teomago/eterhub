import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      faq: {
        label: 'FAQ',
        heading: 'Heading',
        subheading: 'Subheading',
        items: 'Questions',
        question: 'Question',
        answer: 'Answer',
        allowMultiple: 'Allow Multiple Open',
      },
    },
  },
  es: {
    blocks: {
      faq: {
        label: 'Preguntas frecuentes',
        heading: 'Encabezado',
        subheading: 'Subencabezado',
        items: 'Preguntas',
        question: 'Pregunta',
        answer: 'Respuesta',
        allowMultiple: 'Permitir abrir varias a la vez',
      },
    },
  },
})

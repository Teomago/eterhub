import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    accordion: {
      items: 'Items',
      accordionType: 'Accordion Type',
      single: 'Single',
      multiple: 'Multiple',
      width: 'Width',
      widthDescription: 'Maximum width constraint for the accordion',
      fullWidth: 'Full Width',
      left: 'Left',
      center: 'Center',
      right: 'Right',
    },
  },
  es: {
    accordion: {
      items: 'Entradas',
      accordionType: 'Tipo de acordeón',
      single: 'Simple',
      multiple: 'Múltiple',
      width: 'Ancho',
      widthDescription: 'Restricción de ancho máximo para el acordeón',
      fullWidth: 'Ancho completo',
      left: 'Izquierda',
      center: 'Centro',
      right: 'Derecha',
    },
  },
})

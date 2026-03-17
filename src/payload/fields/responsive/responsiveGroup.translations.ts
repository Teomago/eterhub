import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    responsive: {
      type: 'Type',
      preset: 'Preset',
      custom: 'Custom',
      presetSizes: 'Preset Sizes',
      presetSizesDescription: 'Select predefined size values per breakpoint',
      customSizes: 'Custom Sizes',
      customSizesDescription: 'Enter custom pixel values per breakpoint',
      responsiveSizing: 'Responsive Sizing',
    },
  },
  es: {
    responsive: {
      type: 'Tipo',
      preset: 'Preestablecido',
      custom: 'Personalizado',
      presetSizes: 'Tamaños preestablecidos',
      presetSizesDescription: 'Seleccionar valores de tamaño predefinidos por punto de interrupción',
      customSizes: 'Tamaños personalizados',
      customSizesDescription: 'Ingresar valores de píxeles personalizados por punto de interrupción',
      responsiveSizing: 'Dimensionamiento responsivo',
    },
  },
})

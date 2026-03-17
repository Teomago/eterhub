import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    validation: {
      invalidURL: 'Please enter a valid URL.',
      invalidLongitude: 'Longitude must be between -180 and 180.',
      invalidLatitude: 'Latitude must be between -90 and 90.',
      invalidTwentyFourHourFormat: 'Please use 24-hour format (HH:mm).',
    },
  },
  es: {
    validation: {
      invalidURL: 'Por favor ingrese una URL válida.',
      invalidLongitude: 'La longitud debe estar entre -180 y 180.',
      invalidLatitude: 'La latitud debe estar entre -90 y 90.',
      invalidTwentyFourHourFormat: 'Por favor use el formato de 24 horas (HH:mm).',
    },
  },
})

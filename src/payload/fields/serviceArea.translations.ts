import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    serviceArea: {
      label: 'Service Area',
      type: 'Service Area Type',
      radius: 'Service Radius',
      distance: 'Distance',
      unit: 'Unit',
      postalCodes: 'Postal/ZIP Codes',
      postalCodesDescription: 'Press enter after each code.',
      cities: 'Cities',
      cityName: 'City Name',
      stateProvince: 'State/Province',
      stateProvinceDescription: 'Optional - helps with disambiguation',
      countryCode: 'Country Code',
      countryCodeDescription: 'ISO 3166-1 alpha-2',
      regions: 'Regions/States',
      regionName: 'Region/State Name',
      countries: 'Countries',
      customDescription: 'Custom Service Area Description',
      customDescriptionHelp:
        'Describe your service area (e.g., "Greater London Area", "Tri-State Area")',
    },
  },
  es: {
    serviceArea: {
      label: 'Área de servicio',
      type: 'Tipo de área de servicio',
      radius: 'Radio de servicio',
      distance: 'Distancia',
      unit: 'Unidad',
      postalCodes: 'Códigos postales',
      postalCodesDescription: 'Presione enter después de cada código.',
      cities: 'Ciudades',
      cityName: 'Nombre de la ciudad',
      stateProvince: 'Estado/Provincia',
      stateProvinceDescription: 'Opcional - ayuda con la desambiguación',
      countryCode: 'Código de país',
      countryCodeDescription: 'ISO 3166-1 alfa-2',
      regions: 'Regiones/Estados',
      regionName: 'Nombre de la región/estado',
      countries: 'Países',
      customDescription: 'Descripción personalizada del área de servicio',
      customDescriptionHelp: 'Describa su área de servicio (ej., "Área Metropolitana", "Zona Norte")',
    },
  },
})

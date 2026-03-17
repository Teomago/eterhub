import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    header: {
      label: 'Header',
      navLinks: 'Navigation Links',
      navLinksDescription: 'Links displayed on the left side of the header',
      logo: 'Logo',
      logoType: 'Logo Type',
      logoNone: 'None',
      logoImage: 'Image',
      logoText: 'Text',
      cta: 'Call to Action',
      ctaEnabled: 'Show CTA Button',
    },
  },
  es: {
    header: {
      label: 'Encabezado principal',
      navLinks: 'Enlaces de navegación',
      navLinksDescription: 'Enlaces en el lado izquierdo del encabezado',
      logo: 'Logo',
      logoType: 'Tipo de logo',
      logoNone: 'Ninguno',
      logoImage: 'Imagen',
      logoText: 'Texto',
      cta: 'Llamado a la acción',
      ctaEnabled: 'Mostrar botón CTA',
    },
  },
})

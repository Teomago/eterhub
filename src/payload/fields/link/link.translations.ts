import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    fields: {
      link: 'Link',
      label: 'Label',
      default: 'Default',
      secondary: 'Secondary',
      outline: 'Outline',
      ghost: 'Ghost',
      destructive: 'Destructive',
      type: 'Type',
      internalLink: 'Internal Link',
      customUrl: 'Custom URL',
      openInNewTab: 'Open in new tab',
      documentToLinkTo: 'Document to link to',
      appearance: 'Appearance',
      appearanceDescription: 'Choose how the link should be rendered',
    },
  },
  es: {
    fields: {
      link: 'Enlace',
      label: 'Etiqueta',
      default: 'Predeterminado',
      secondary: 'Secundario',
      outline: 'Contorno',
      ghost: 'Transparente',
      destructive: 'Destructivo',
      type: 'Tipo',
      internalLink: 'Enlace interno',
      customUrl: 'URL personalizada',
      openInNewTab: 'Abrir en nueva pestaña',
      documentToLinkTo: 'Documento a enlazar',
      appearance: 'Apariencia',
      appearanceDescription: 'Cómo se mostrará el enlace',
    },
  },
})

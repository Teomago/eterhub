import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    fields: {
      spacing: 'Spacing',
      idDescription:
        'Unique ID field, applied to the HTML component wrapping this block. Useful for links to be able to navigate to this particular block on a page.',
      withPrefix: 'With Prefix',
      withSuffix: 'With Suffix',
    },
  },
  es: {
    fields: {
      spacing: 'Espaciado',
      idDescription:
        'Campo de ID único, aplicado al componente HTML que envuelve este bloque. Útil para que los enlaces puedan navegar a este bloque particular en una página.',
      withPrefix: 'Con prefijo',
      withSuffix: 'Con sufijo',
    },
  },
})

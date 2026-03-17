import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    blocks: {
      ctaSection: {
        label: 'CTA Section',
        heading: 'Heading',
        body: 'Body',
        links: 'Call to Action',
        background: 'Background',
        bgDefault: 'Default',
        bgMuted: 'Muted',
        bgPrimary: 'Primary',
        alignment: 'Alignment',
        left: 'Left',
        center: 'Center',
      },
    },
  },
  es: {
    blocks: {
      ctaSection: {
        label: 'Sección CTA',
        heading: 'Encabezado',
        body: 'Cuerpo',
        links: 'Llamado a la acción',
        background: 'Fondo',
        bgDefault: 'Predeterminado',
        bgMuted: 'Atenuado',
        bgPrimary: 'Primario',
        alignment: 'Alineación',
        left: 'Izquierda',
        center: 'Centro',
      },
    },
  },
})

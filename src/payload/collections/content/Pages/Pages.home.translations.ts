import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    pages: {
      isHome: 'Home Page',
      isHomeDescription:
        'Set this page as the home page (/). Only one page can be the home page at a time.',
    },
  },
  es: {
    pages: {
      isHome: 'Página de inicio',
      isHomeDescription:
        'Establecer esta página como la página de inicio (/). Solo una página puede ser la página de inicio a la vez.',
    },
  },
})

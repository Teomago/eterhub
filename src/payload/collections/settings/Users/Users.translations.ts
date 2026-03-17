import { defineTranslations } from '@/payload/i18n/config'

export const translations = defineTranslations({
  en: {
    users: {
      singular: 'User',
      plural: 'Users',
      firstName: 'First Name',
      lastName: 'Last Name',
      name: 'Name',
      roles: 'Roles',
      admin: 'Admin',
      editor: 'Editor',
      user: 'User',
    },
  },
  es: {
    users: {
      singular: 'Usuario',
      plural: 'Usuarios',
      firstName: 'Nombre',
      lastName: 'Apellido',
      name: 'Nombre completo',
      roles: 'Roles',
      admin: 'Administrador',
      editor: 'Editor',
      user: 'Usuario',
    },
  },
})

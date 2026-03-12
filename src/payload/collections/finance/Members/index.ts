import type { CollectionConfig } from 'payload'

import { access } from '@/payload/utils/access'

export const Members: CollectionConfig = {
  slug: 'members',
  access: {
    create: access.public(),
    delete: access.owner('id'),
    read: access.owner('id'),
    update: access.owner('id'),
  },
  admin: {
    defaultColumns: ['firstName', 'email'],
    useAsTitle: 'email',
    group: 'Finance',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000,
    forgotPassword: {
      expiration: 3600000, // 1 hour
      generateEmailHTML: (args) => {
        const token = args?.token || ''
        const user = args?.user || { email: '', preferredLocale: 'en' }
        const locale = user.preferredLocale || 'en'
        const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const resetURL = `${serverURL}/${locale}/reset-password?token=${token}`

        const strings = {
          en: {
            title: 'Reset Your Password',
            greeting: `Hello, ${user.email}!`,
            body: 'You requested to reset your password. Click the button below to set a new one:',
            button: 'Reset Password',
            expiry: 'This link will expire in 1 hour.',
            ignore: 'If you did not request this, please ignore this email.',
            footer: 'Heionhub — Your personal finance assistant',
          },
          es: {
            title: 'Restablecer tu Contraseña',
            greeting: `Hola, ${user.email}!`,
            body: 'Solicitaste restablecer tu contraseña. Haz clic en el botón para establecer una nueva:',
            button: 'Restablecer Contraseña',
            expiry: 'Este enlace expirará en 1 hora.',
            ignore: 'Si no solicitaste esto, ignora este correo.',
            footer: 'Heionhub — Tu asistente de finanzas personales',
          },
        }

        const t = strings[locale as keyof typeof strings] || strings.en

        return `
          <!doctype html>
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1a1a1a;">${t.title}</h1>
              <p>${t.greeting}</p>
              <p>${t.body}</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${resetURL}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ${t.button}
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">${t.expiry}</p>
              <p style="color: #666; font-size: 14px;">${t.ignore}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 12px;">${t.footer}</p>
            </body>
          </html>
        `
      },
      generateEmailSubject: (args) => {
        const locale = args?.user?.preferredLocale || 'en'
        return locale === 'es'
          ? 'Heionhub — Restablecer tu contraseña'
          : 'Heionhub — Reset your password'
      },
    },
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'secondName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'secondLastName',
      type: 'text',
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'COP', value: 'COP' },
      ],
      required: true,
    },
    {
      name: 'hasCompletedTour',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the user has completed the intro tour on the dashboard.',
      },
    },
    {
      name: 'hasCompletedImportTour',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the user has completed the import tutorial on the import page.',
      },
    },
    {
      name: 'preferredLocale',
      type: 'select',
      defaultValue: 'en',
      required: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
      ],
      admin: {
        description: "The user's preferred language for emails and system notifications.",
      },
    },
  ],
  labels: {
    plural: 'Members',
    singular: 'Member',
  },
}

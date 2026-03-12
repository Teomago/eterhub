import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { collections } from './collections'
import { globals } from './globals'
import { translations } from './i18n'
import { plugins } from './plugins'
import { livePreview } from './config/livePreview'
import { blocks } from './blocks'
import { lexicalBlocks } from './lexical/blocks'
import { inlineBlocks } from './lexical/inlineBlocks'
import { rootEditor } from './lexical'

import brevoAdapter from '@/utilities/brevoAdapter'

import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  email: brevoAdapter(),
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— Heionhub',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview,
  },
  i18n: {
    supportedLanguages: { en, es },
    translations: {
      ...translations,
      es: {
        ...translations.es,
        cmdkPlugin: {
          loading: 'Cargando...',
          navigate: 'para navegar',
          noResults: 'No se encontraron resultados',
          open: 'para abrir',
          search: 'Buscar en colecciones y variables globales...',
          searchIn: 'Buscar en {{label}}',
          searchInCollection: 'buscar en la colección',
          searchShort: 'Buscar',
        },
      },
    },
  },
  folders: {
    browseByFolder: false,
  },
  blocks: [...blocks, ...inlineBlocks, ...lexicalBlocks],
  globals,
  collections,
  editor: rootEditor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: false,
  }),
  sharp,
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
})

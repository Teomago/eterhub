import type { DefineTranslationsParam } from './types'

/** Locales supported by the app and by colocated *.translations.ts files. Add a locale here to require it in every translation file (type error until provided). */
export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** Locale whose keys define the required shape for all other locales. */
export const DEFAULT_LOCALE: SupportedLocale = 'en'

/** Defines colocated translations. Default locale sets the shape; other locales must match exactly (same keys at every depth). Validates at runtime and throws on mismatch. */
export const defineTranslations = <T extends Record<string, unknown>>(
  t: DefineTranslationsParam<T>,
): DefineTranslationsParam<T> => {
  const shapeErrors = validateTranslationsShape(t as Record<string, Record<string, unknown>>)
  if (shapeErrors) {
    throw new Error(
      `Translation shape validation failed:\n${shapeErrors.map((e) => `  - ${e}`).join('\n')}`,
    )
  }
  return t
}

/** Collects all leaf keys from a nested object as dot-separated paths. */
export const getAllKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
  const keys: string[] = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...getAllKeys(val as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Compares default and locale objects recursively; records missing key, extra key, or object/leaf mismatch. */
const collectShapeErrorsAt = (
  defaultObj: Record<string, unknown>,
  localeObj: Record<string, unknown>,
  locale: string,
  prefix: string,
  errors: string[],
): void => {
  for (const key in defaultObj) {
    const path = prefix ? `${prefix}.${key}` : key
    const defaultVal = defaultObj[key]
    const localeVal = localeObj[key]

    if (!(key in localeObj)) {
      errors.push(`Locale "${locale}" missing key: ${path}`)
      continue
    }

    const defaultIsObj = isPlainObject(defaultVal)
    const localeIsObj = isPlainObject(localeVal)

    if (defaultIsObj !== localeIsObj) {
      errors.push(
        `Locale "${locale}" key "${path}": expected ${defaultIsObj ? 'object' : 'string/value'}, got ${localeIsObj ? 'object' : 'string/value'}`,
      )
      continue
    }

    if (defaultIsObj && localeIsObj) {
      collectShapeErrorsAt(
        defaultVal as Record<string, unknown>,
        localeVal as Record<string, unknown>,
        locale,
        path,
        errors,
      )
    }
  }

  for (const key in localeObj) {
    const path = prefix ? `${prefix}.${key}` : key
    if (!(key in defaultObj)) {
      errors.push(`Locale "${locale}" has extra key: ${path}`)
    }
  }
}

/** Returns an array of error messages if any locale's shape differs from the default; null if valid. */
export const validateTranslationsShape = (
  translations: Record<string, Record<string, unknown>>,
): string[] | null => {
  const defaultRoot = (translations[DEFAULT_LOCALE] ?? {}) as Record<string, unknown>
  const errors: string[] = []
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const localeRoot = (translations[locale] ?? {}) as Record<string, unknown>
    collectShapeErrorsAt(defaultRoot, localeRoot, locale, '', errors)
  }
  return errors.length ? errors : null
}

/** Paths for generate:translations script. */
export const TRANSLATION_PATHS = {
  sourceDir: 'src/payload',
  outputDir: 'src/payload/i18n/languages',
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
} as const

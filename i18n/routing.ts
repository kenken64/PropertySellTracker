export const locales = ["en", "zh-CN", "ms"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

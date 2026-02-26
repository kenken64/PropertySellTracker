"use client"

import { useLocale } from "next-intl"

import { Locale } from "@/i18n/routing"

const languageOptions: { value: Locale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "zh-CN", label: "🇨🇳 简体中文" },
  { value: "ms", label: "🇲🇾 Bahasa Melayu" },
]

export function LanguageSwitcher() {
  const locale = useLocale() as Locale

  const onChange = (nextLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return (
    <select
      aria-label="Language"
      className="h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      value={locale}
      onChange={(event) => onChange(event.target.value as Locale)}
    >
      {languageOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

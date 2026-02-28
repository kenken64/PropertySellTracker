"use client"

import { FormEvent, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Eye, EyeOff } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { telegramSettingsSchema } from "@/lib/validations"

export default function SettingsPage() {
  const [telegramBotToken, setTelegramBotToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showToken, setShowToken] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "">("")
  const t = useTranslations("Settings")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/telegram")
      if (!response.ok) return

      const data = await response.json()
      setTelegramBotToken(data.telegram_bot_token || "")
      setTelegramChatId(data.telegram_chat_id || "")
      setAlertsEnabled(data.alerts_enabled !== false)
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = telegramSettingsSchema.safeParse({
      telegram_bot_token: telegramBotToken,
      telegram_chat_id: telegramChatId,
      alerts_enabled: alertsEnabled,
    })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }
    setErrors({})
    setStatusMessage("")
    setStatusType("")
    setSaving(true)
    try {
      const response = await fetch("/api/settings/telegram", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      setStatusMessage(t("saved"))
      setStatusType("success")
    } catch (error) {
      console.error("Failed to save settings:", error)
      setStatusMessage(t("saveFailed"))
      setStatusType("error")
    } finally {
      setSaving(false)
    }
  }

  const sendTestMessage = async () => {
    setStatusMessage("")
    setStatusType("")
    setTesting(true)
    try {
      const response = await fetch("/api/settings/telegram/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegram_bot_token: telegramBotToken,
          telegram_chat_id: telegramChatId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send test")
      }

      setStatusMessage(t("testSent"))
      setStatusType("success")
    } catch (error) {
      console.error("Failed to send test message:", error)
      setStatusMessage(t("testFailed"))
      setStatusType("error")
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">{t("loading")}</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("telegramAlerts")}</CardTitle>
          <CardDescription>{t("telegramAlertsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={saveSettings} noValidate>
            <div className="space-y-2">
              <Label htmlFor="telegram_bot_token">{t("telegramBotToken")}</Label>
              <div className="relative">
                <Input
                  id="telegram_bot_token"
                  type={showToken ? "text" : "password"}
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder={t("telegramBotTokenPlaceholder")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.telegram_bot_token ? <p className="mt-1 text-sm text-red-500">{errors.telegram_bot_token[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_chat_id">{t("telegramChatId")}</Label>
              <Input
                id="telegram_chat_id"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder={t("telegramChatIdPlaceholder")}
              />
              {errors.telegram_chat_id ? <p className="mt-1 text-sm text-red-500">{errors.telegram_chat_id[0]}</p> : null}
            </div>

            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-semibold">{t("howToGetCredentials")}</p>
              <div className="space-y-2">
                <p className="font-medium">{t("botTokenTitle")}</p>
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                  <li>{t("botTokenStep1")}</li>
                  <li>{t("botTokenStep2")}</li>
                  <li>{t("botTokenStep3")}</li>
                </ol>
              </div>
              <div className="space-y-2">
                <p className="font-medium">{t("chatIdTitle")}</p>
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                  <li>{t("chatIdStep1")}</li>
                  <li>{t("chatIdStep2")}</li>
                  <li>{t("chatIdStep3")}</li>
                  <li>{t("chatIdStep4")}</li>
                </ol>
                <p className="font-mono text-xs text-muted-foreground">{t("chatIdApiExample")}</p>
                <p className="text-xs text-muted-foreground">{t("chatIdPrivateHint")}</p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between rounded-xl border border-border/70 p-3 text-left">
              <div className="flex-1 space-y-0.5">
                <span className="block text-sm font-medium">{t("enableAlerts")}</span>
                <span className="block text-xs text-muted-foreground">{t("enableAlertsDesc")}</span>
              </div>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={sendTestMessage} disabled={testing} className="w-full sm:w-auto">
                {testing ? t("sendingTest") : t("sendTest")}
              </Button>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? t("saving") : t("saveSettings")}
              </Button>
            </div>

            {statusMessage ? (
              <p className={`text-sm ${statusType === "success" ? "text-emerald-600" : "text-red-500"}`}>{statusMessage}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

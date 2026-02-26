"use client"

import { FormEvent, useEffect, useState } from "react"
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

      alert("Telegram settings saved.")
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save Telegram settings.")
    } finally {
      setSaving(false)
    }
  }

  const sendTestMessage = async () => {
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

      alert("Test message sent.")
    } catch (error) {
      console.error("Failed to send test message:", error)
      alert("Failed to send test message. Check your bot token and chat ID.")
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Loading settings...</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Configure Telegram alerts for SSD reminders and target profit notifications.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Telegram Alerts</CardTitle>
          <CardDescription>Use your Telegram bot token and chat ID to receive automatic notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={saveSettings} noValidate>
            <div className="space-y-2">
              <Label htmlFor="telegram_bot_token">Telegram Bot Token</Label>
              <Input
                id="telegram_bot_token"
                type="password"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="1234567890:AA..."
              />
              {errors.telegram_bot_token ? <p className="mt-1 text-sm text-red-500">{errors.telegram_bot_token[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_chat_id">Telegram Chat ID</Label>
              <Input
                id="telegram_chat_id"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="e.g. 987654321"
              />
              {errors.telegram_chat_id ? <p className="mt-1 text-sm text-red-500">{errors.telegram_chat_id[0]}</p> : null}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">Enable Alerts</p>
                <p className="text-xs text-muted-foreground">Allow SSD and target-profit Telegram notifications.</p>
              </div>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={sendTestMessage} disabled={testing} className="w-full sm:w-auto">
                {testing ? "Sending Test..." : "Send Test"}
              </Button>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

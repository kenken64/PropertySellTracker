import { NextRequest, NextResponse } from "next/server"
import sql, { initDB } from "@/lib/database"
import { auth } from "@/lib/auth"
import { telegramSettingsSchema } from "@/lib/validations"

function getUserIdFromSession(session: { user?: { id?: string } } | null) {
  const userId = Number(session?.user?.id)
  return Number.isInteger(userId) ? userId : null
}

export async function GET() {
  try {
    const session = await auth()
    const userId = getUserIdFromSession(session)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initDB()

    const settings = await sql`
      SELECT telegram_bot_token, telegram_chat_id, alerts_enabled
      FROM user_settings
      WHERE user_id = ${userId}
      LIMIT 1
    `

    if (settings.length === 0) {
      return NextResponse.json({
        telegram_bot_token: "",
        telegram_chat_id: "",
        alerts_enabled: true,
      })
    }

    return NextResponse.json(settings[0])
  } catch (error) {
    console.error("Error fetching Telegram settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    const userId = getUserIdFromSession(session)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initDB()
    const data = await request.json()
    const parsed = telegramSettingsSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const validated = parsed.data
    const botToken = validated.telegram_bot_token.trim()
    const chatId = validated.telegram_chat_id.trim()
    const alertsEnabled = validated.alerts_enabled

    const result = await sql`
      INSERT INTO user_settings (user_id, telegram_bot_token, telegram_chat_id, alerts_enabled)
      VALUES (${userId}, ${botToken}, ${chatId}, ${alertsEnabled})
      ON CONFLICT (user_id)
      DO UPDATE SET
        telegram_bot_token = EXCLUDED.telegram_bot_token,
        telegram_chat_id = EXCLUDED.telegram_chat_id,
        alerts_enabled = EXCLUDED.alerts_enabled,
        updated_at = CURRENT_TIMESTAMP
      RETURNING telegram_bot_token, telegram_chat_id, alerts_enabled
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating Telegram settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

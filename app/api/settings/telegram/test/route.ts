import { NextRequest, NextResponse } from "next/server"
import sql, { initDB } from "@/lib/database"
import { auth } from "@/lib/auth"
import { sendTelegramMessage } from "@/lib/telegram"
import {
  calculateNetProfit,
  calculateROI,
  formatCurrency,
  formatPercent,
  getSellRecommendation,
  type RefinanceRecord,
} from "@/lib/utils"

function getUserIdFromSession(session: { user?: { id?: string } } | null) {
  const userId = Number(session?.user?.id)
  return Number.isInteger(userId) ? userId : null
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = getUserIdFromSession(session)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initDB()
    const data = await request.json().catch(() => ({}))

    let botToken = String(data.telegram_bot_token || "").trim()
    let chatId = String(data.telegram_chat_id || "").trim()

    if (!botToken || !chatId) {
      const rows = await sql`
        SELECT telegram_bot_token, telegram_chat_id
        FROM user_settings
        WHERE user_id = ${userId}
        LIMIT 1
      `

      botToken = botToken || String(rows[0]?.telegram_bot_token || "")
      chatId = chatId || String(rows[0]?.telegram_chat_id || "")
    }

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: "Telegram bot token and chat ID are required" },
        { status: 400 }
      )
    }

    const properties = await sql`
      SELECT *
      FROM properties
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `

    if (properties.length === 0) {
      await sendTelegramMessage(
        chatId,
        "Test message from PropertySellTracker. Telegram alerts are connected.",
        botToken
      )
      return NextResponse.json({ success: true })
    }

    const property = properties[0]
    const refinances = await sql`
      SELECT *
      FROM refinances
      WHERE property_id = ${property.id}
      ORDER BY refinance_date ASC
    `

    const netProfit = calculateNetProfit(property, refinances as RefinanceRecord[])
    const roi = calculateROI(property, refinances as RefinanceRecord[])
    const recommendation = getSellRecommendation(property, refinances as RefinanceRecord[])
    const currentValue = property.current_value || property.purchase_price

    const message =
      `🧪 Test alert from PropertySellTracker\n` +
      `Property: ${property.name}\n` +
      `Current value: ${formatCurrency(currentValue)}\n` +
      `Net P&L: ${formatCurrency(netProfit)} (${formatPercent(roi)})\n` +
      `Sell/Hold: ${recommendation.message}`

    await sendTelegramMessage(
      chatId,
      message,
      botToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending Telegram test message:", error)
    return NextResponse.json({ error: "Failed to send test message" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import sql, { initDB } from "@/lib/database"
import { auth } from "@/lib/auth"
import { calculateNetProfit, calculateTotalCost, formatCurrency } from "@/lib/utils"
import { sendTelegramMessage } from "@/lib/telegram"

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
    const payload = await request.json().catch(() => ({}))
    const incomingText = String(payload?.message?.text || "").trim()
    const incomingChatId = payload?.message?.chat?.id ? String(payload.message.chat.id) : ""

    const settingsRows = await sql`
      SELECT telegram_bot_token, telegram_chat_id
      FROM user_settings
      WHERE user_id = ${userId}
      LIMIT 1
    `

    const botToken = String(settingsRows[0]?.telegram_bot_token || "")
    const chatId = String(settingsRows[0]?.telegram_chat_id || incomingChatId || "")

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: "Telegram bot token/chat ID missing in user settings" },
        { status: 400 }
      )
    }

    const command = incomingText.split(" ")[0]

    if (command === "/start") {
      await sendTelegramMessage(
        chatId,
        "Welcome to PropertySellTracker alerts. Use /status for portfolio summary and /alerts for active alerts.",
        botToken
      )
      return NextResponse.json({ ok: true })
    }

    if (command === "/status") {
      const properties = await sql`
        SELECT *
        FROM properties
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `

      const totalInvestment = properties.reduce((sum, property) => sum + calculateTotalCost(property), 0)
      const totalCurrentValue = properties.reduce(
        (sum, property) => sum + (property.current_value || property.purchase_price),
        0
      )
      const totalProfit = properties.reduce((sum, property) => sum + calculateNetProfit(property), 0)

      const message = [
        "Portfolio Status",
        `Properties: ${properties.length}`,
        `Total Investment: ${formatCurrency(totalInvestment)}`,
        `Current Value: ${formatCurrency(totalCurrentValue)}`,
        `Net P&L: ${formatCurrency(totalProfit)}`,
      ].join("\n")

      await sendTelegramMessage(chatId, message, botToken)
      return NextResponse.json({ ok: true })
    }

    if (command === "/alerts") {
      const activeAlerts = await sql`
        SELECT name, target_profit_percentage
        FROM properties
        WHERE user_id = ${userId}
          AND target_profit_percentage > 0
          AND target_profit_alert_sent = false
        ORDER BY target_profit_percentage DESC
      `

      const message =
        activeAlerts.length === 0
          ? "No active target profit alerts."
          : [
              "Active Alerts",
              ...activeAlerts.map(
                (property) => `- ${property.name}: target ${Number(property.target_profit_percentage).toFixed(2)}%`
              ),
            ].join("\n")

      await sendTelegramMessage(chatId, message, botToken)
      return NextResponse.json({ ok: true })
    }

    await sendTelegramMessage(
      chatId,
      "Unknown command. Available commands: /start, /status, /alerts",
      botToken
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing Telegram webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

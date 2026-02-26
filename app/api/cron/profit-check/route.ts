import { NextResponse } from "next/server"
import sql, { initDB } from "@/lib/database"
import { auth } from "@/lib/auth"
import { calculateNetProfit, calculateTotalCost, formatCurrency } from "@/lib/utils"
import { sendTelegramMessage } from "@/lib/telegram"

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

    const properties = await sql`
      SELECT
        p.*,
        us.telegram_bot_token,
        us.telegram_chat_id,
        us.alerts_enabled
      FROM properties p
      INNER JOIN user_settings us ON us.user_id = p.user_id
      WHERE p.target_profit_percentage > 0
        AND p.target_profit_alert_sent = false
        AND us.alerts_enabled = true
        AND us.telegram_bot_token IS NOT NULL
        AND us.telegram_bot_token <> ''
        AND us.telegram_chat_id IS NOT NULL
        AND us.telegram_chat_id <> ''
    `

    let alertedCount = 0
    const errors: string[] = []

    for (const property of properties) {
      const totalCost = calculateTotalCost(property)
      const netProfit = calculateNetProfit(property)
      const profitPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0
      const targetProfit = Number(property.target_profit_percentage || 0)

      if (profitPercentage < targetProfit) {
        continue
      }

      const currentValue = property.current_value || property.purchase_price
      const message = `🎯 Target reached! ${property.name} has hit ${profitPercentage.toFixed(2)}% profit (target: ${targetProfit.toFixed(2)}%). Current value: ${formatCurrency(currentValue)}`

      try {
        await sendTelegramMessage(
          String(property.telegram_chat_id),
          message,
          String(property.telegram_bot_token)
        )

        await sql`
          UPDATE properties
          SET target_profit_alert_sent = true
          WHERE id = ${property.id}
        `

        alertedCount += 1
      } catch (error) {
        errors.push(`property_id=${property.id}: ${String(error)}`)
      }
    }

    return NextResponse.json({
      checked: properties.length,
      alertsTriggered: alertedCount,
      errors,
    })
  } catch (error) {
    console.error("Error running profit check cron:", error)
    return NextResponse.json({ error: "Failed to run profit check" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import sql, { initDB } from "@/lib/database"
import { auth } from "@/lib/auth"
import { getDaysToSSDFree, getSSDFreeDate } from "@/lib/utils"
import { sendTelegramMessage } from "@/lib/telegram"

function getUserIdFromSession(session: { user?: { id?: string } } | null) {
  const userId = Number(session?.user?.id)
  return Number.isInteger(userId) ? userId : null
}

const ALERT_DAYS = new Set([30, 7, 1])

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
        p.id,
        p.name,
        p.purchase_date,
        p.user_id,
        us.telegram_bot_token,
        us.telegram_chat_id,
        us.alerts_enabled
      FROM properties p
      INNER JOIN user_settings us ON us.user_id = p.user_id
      WHERE p.purchase_date::date + INTERVAL '3 years' >= CURRENT_DATE
        AND us.alerts_enabled = true
        AND us.telegram_bot_token IS NOT NULL
        AND us.telegram_bot_token <> ''
        AND us.telegram_chat_id IS NOT NULL
        AND us.telegram_chat_id <> ''
    `

    let sentCount = 0
    const errors: string[] = []

    for (const property of properties) {
      const daysToFree = getDaysToSSDFree(property.purchase_date)
      let message = ""

      if (ALERT_DAYS.has(daysToFree)) {
        const ssdFreeDate = getSSDFreeDate(property.purchase_date).toLocaleDateString("en-SG")
        message = `🎉 Your property ${property.name} will be SSD-free in ${daysToFree} days! (SSD-free date: ${ssdFreeDate})`
      } else if (daysToFree === 0) {
        message = `🎊 Congratulations! ${property.name} is now SSD-FREE! You can sell without paying Seller Stamp Duty.`
      }

      if (!message) {
        continue
      }

      try {
        await sendTelegramMessage(
          String(property.telegram_chat_id),
          message,
          String(property.telegram_bot_token)
        )
        sentCount += 1
      } catch (error) {
        errors.push(`property_id=${property.id}: ${String(error)}`)
      }
    }

    return NextResponse.json({
      checked: properties.length,
      notificationsSent: sentCount,
      errors,
    })
  } catch (error) {
    console.error("Error running SSD check cron:", error)
    return NextResponse.json({ error: "Failed to run SSD check" }, { status: 500 })
  }
}

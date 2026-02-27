import { NextRequest, NextResponse } from "next/server"
import sql, { initDB } from "@/lib/database"
import { auth } from "@/lib/auth"
import {
  calculateNetProfit,
  calculateROI,
  calculateTotalCost,
  formatCurrency,
  formatPercent,
  getSellRecommendation,
  getSSDCountdown,
  type RefinanceRecord,
} from "@/lib/utils"
import { idParamSchema } from "@/lib/validations"

const MODEL = process.env.AI_MODEL ?? "gpt-4o-mini"

function buildPrompt({
  property,
  refinances,
  totalCost,
  netProfit,
  roi,
  currentValue,
  targetProfit,
  recommendation,
  marketContext,
}: {
  property: any
  refinances: RefinanceRecord[]
  totalCost: number
  netProfit: number
  roi: number
  currentValue: number
  targetProfit: number
  recommendation: { message: string }
  marketContext: string
}) {
  const profitPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0
  const ssdInfo = getSSDCountdown(property.purchase_date)
  const refinanceCount = refinances.length
  const targetReached = profitPercentage >= targetProfit

  return `
You are a Singapore property investment assistant.

Property overview:
- Name: ${property.name}
- Type: ${property.type}
- Purchase price: ${formatCurrency(property.purchase_price)} (purchased ${property.purchase_date})
- Current value: ${formatCurrency(currentValue)}
- Total cost: ${formatCurrency(totalCost)}
- Net profit: ${formatCurrency(netProfit)} (${formatPercent(profitPercentage)})
- ROI: ${formatPercent(roi)}
- Monthly rental: ${formatCurrency(property.monthly_rental || 0)}
- Target profit %: ${targetProfit} (${targetReached ? "already reached" : "still below target"})
- Refinances recorded: ${refinanceCount}
- SSD: ${ssdInfo.daysToNextTier} days until next tier (${ssdInfo.currentRate}% rate)
- Alert status: ${property.target_profit_alert_sent ? "already sent" : "not sent"}
- Recommendation baseline: ${recommendation.message}

Market context: ${marketContext}

Question: Based on these numbers and the provided context, should the owner SELL now, HOLD and wait, or REFINANCE? Provide one paragraph explaining the rationale, mention the biggest risk, and finish with one concrete next action (e.g., "Discuss sell price with agent", "Refi to rate X", "Hold until SSD-free").
  `.trim()
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initDB()
    const { id } = await params
    const idParsed = idParamSchema.safeParse({ id })
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: idParsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const propertyId = Number(idParsed.data.id)

    const properties = await sql`
      SELECT * FROM properties
      WHERE id = ${propertyId} AND user_id = ${userId}
    `

    if (properties.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    const property = properties[0]
    const refinances = (await sql`
      SELECT * FROM refinances
      WHERE property_id = ${property.id}
      ORDER BY refinance_date ASC
    `) as RefinanceRecord[]

    const totalCost = calculateTotalCost(property, refinances as RefinanceRecord[])
    const netProfit = calculateNetProfit(property, refinances as RefinanceRecord[])
    const roi = calculateROI(property, refinances as RefinanceRecord[])
    const currentValue = property.current_value || property.purchase_price
    const targetProfit = Number(property.target_profit_percentage || 0)
    const recommendation = getSellRecommendation(property, refinances as RefinanceRecord[])
    const queryMarketContext = request.nextUrl.searchParams.get("marketContext")
    const marketContext =
      queryMarketContext?.trim() ||
      process.env.MARKET_CONTEXT?.trim() ||
      "Singapore residential market: MAS rates around current levels, rental demand steady, SSD tiers apply until year 3."

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI model not configured (set OPENAI_API_KEY)" },
        { status: 501 }
      )
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a concise Singapore property investment assistant." },
          { role: "user", content: buildPrompt({ property, refinances, totalCost, netProfit, roi, currentValue, targetProfit, recommendation, marketContext }) },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: "AI service failed", details: text }, { status: 502 })
    }

    const payload = await response.json()
    const advice = payload?.choices?.[0]?.message?.content?.trim() ?? ""

    return NextResponse.json({ advice, raw: payload })
  } catch (error) {
    console.error("Error fetching AI guidance:", error)
    return NextResponse.json({ error: "Failed to fetch AI guidance" }, { status: 500 })
  }
}

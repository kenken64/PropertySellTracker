import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { fetchHdbResaleData } from "@/lib/hdb-data"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const town = searchParams.get("town") || undefined
    const flatType = searchParams.get("flat_type") || undefined
    const streetName = searchParams.get("street_name") || undefined
    const limit = Number(searchParams.get("limit") || "50")

    const data = await fetchHdbResaleData({
      town,
      flat_type: flatType,
      street_name: streetName,
      limit,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching HDB resale data:", error)
    return NextResponse.json({ error: "Failed to fetch HDB resale data" }, { status: 500 })
  }
}

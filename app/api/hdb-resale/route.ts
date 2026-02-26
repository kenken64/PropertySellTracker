import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { fetchHdbResaleData } from "@/lib/hdb-data"
import { hdbSearchSchema } from "@/lib/validations"

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
    const rawLimit = searchParams.get("limit")
    const rawOffset = searchParams.get("offset")
    const parsed = hdbSearchSchema.safeParse({
      town,
      flat_type: flatType,
      limit: rawLimit ? Number(rawLimit) : undefined,
      offset: rawOffset ? Number(rawOffset) : undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const validated = parsed.data

    const data = await fetchHdbResaleData({
      town: validated.town,
      flat_type: validated.flat_type,
      street_name: streetName,
      limit: validated.limit,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching HDB resale data:", error)
    return NextResponse.json({ error: "Failed to fetch HDB resale data" }, { status: 500 })
  }
}

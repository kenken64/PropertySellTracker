import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchByPostalCode, searchAddress } from "@/lib/onemap"
import { z } from "zod"

const searchSchema = z.object({
  q: z.string().min(1).max(200),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const q = request.nextUrl.searchParams.get("q") || ""
    const parsed = searchSchema.safeParse({ q })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const query = parsed.data.q.trim()

    // If it looks like a postal code (6 digits), search by postal code
    const isPostalCode = /^\d{6}$/.test(query)
    const results = isPostalCode
      ? await searchByPostalCode(query)
      : await searchAddress(query)

    return NextResponse.json({ results, source: "onemap" })
  } catch (error) {
    console.error("Address search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

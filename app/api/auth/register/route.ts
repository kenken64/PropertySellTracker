import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import sql, { initDB } from "@/lib/database"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const validated = parsed.data
    const name = validated.name.trim()
    const email = validated.email.trim().toLowerCase()
    const password = validated.password

    await initDB()

    const passwordHash = await bcrypt.hash(password, 10)

    await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
    `

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 })
    }

    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

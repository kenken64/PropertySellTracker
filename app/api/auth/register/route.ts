import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import sql, { initDB } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = body?.name?.toString().trim()
    const email = body?.email?.toString().trim().toLowerCase()
    const password = body?.password?.toString()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

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

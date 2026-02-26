import { NextRequest, NextResponse } from 'next/server'
import sql, { initDB } from '@/lib/database'
import { auth } from '@/lib/auth'
import { idParamSchema, refinanceSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDB()
    const { id } = await params
    const idParsed = idParamSchema.safeParse({ id })
    if (!idParsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: idParsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Verify property ownership
    const properties = await sql`
      SELECT id FROM properties
      WHERE id = ${idParsed.data.id} AND user_id = ${userId}
    `
    if (properties.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const data = await request.json()
    const parsed = refinanceSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const validated = parsed.data

    const result = await sql`
      INSERT INTO refinances (property_id, refinance_date, loan_amount, interest_rate, tenure, description)
      VALUES (${idParsed.data.id}, ${validated.refinance_date}, ${validated.loan_amount}, ${validated.interest_rate}, ${validated.tenure}, ${validated.description})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating refinance:', error)
    return NextResponse.json({ error: 'Failed to create refinance' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDB()
    const { id } = await params
    const idParsed = idParamSchema.safeParse({ id })
    if (!idParsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: idParsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const refinanceId = request.nextUrl.searchParams.get('refinanceId')
    if (!refinanceId || !/^\d+$/.test(refinanceId)) {
      return NextResponse.json({ error: 'Invalid refinance ID' }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM refinances
      WHERE id = ${refinanceId}
        AND property_id = ${idParsed.data.id}
        AND property_id IN (SELECT id FROM properties WHERE user_id = ${userId})
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Refinance not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting refinance:', error)
    return NextResponse.json({ error: 'Failed to delete refinance' }, { status: 500 })
  }
}

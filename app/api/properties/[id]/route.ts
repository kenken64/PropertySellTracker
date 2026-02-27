import { NextRequest, NextResponse } from 'next/server'
import sql, { initDB } from '@/lib/database'
import { auth } from '@/lib/auth'
import { idParamSchema, updatePropertySchema } from '@/lib/validations'

export async function GET(
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
    const propertyId = Number(idParsed.data.id)

    const properties = await sql`
      SELECT * FROM properties
      WHERE id = ${propertyId} AND user_id = ${userId}
    `
    
    if (properties.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const transactions = await sql`
      SELECT * FROM transactions
      WHERE property_id = ${propertyId}
      ORDER BY date DESC
    `

    const refinances = await sql`
      SELECT * FROM refinances
      WHERE property_id = ${propertyId}
      ORDER BY refinance_date ASC
    `

    return NextResponse.json({ ...properties[0], transactions, refinances })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const propertyId = Number(idParsed.data.id)

    const data = await request.json()
    const parsed = updatePropertySchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const validated = parsed.data
    
    const result = await sql`
      UPDATE properties 
      SET name = ${validated.name}, address = ${validated.address}, unit_no = ${validated.unit_no}, type = ${validated.type},
          purchase_price = ${validated.purchase_price}, purchase_date = ${validated.purchase_date},
          stamp_duty = ${validated.stamp_duty}, renovation_cost = ${validated.renovation_cost}, 
          agent_fees = ${validated.agent_fees}, current_value = ${validated.current_value},
          cpf_amount = ${validated.cpf_amount}, mortgage_amount = ${validated.mortgage_amount}, 
          mortgage_interest_rate = ${validated.mortgage_interest_rate}, mortgage_tenure = ${validated.mortgage_tenure},
          monthly_rental = ${validated.monthly_rental},
          target_profit_percentage = ${validated.target_profit_percentage},
          target_profit_alert_sent = CASE
            WHEN ${validated.target_profit_percentage} <> target_profit_percentage THEN false
            ELSE target_profit_alert_sent
          END
      WHERE id = ${propertyId} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
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
    const propertyId = Number(idParsed.data.id)

    const result = await sql`
      DELETE FROM properties
      WHERE id = ${propertyId} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

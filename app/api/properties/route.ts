import { NextRequest, NextResponse } from 'next/server'
import sql, { initDB } from '@/lib/database'
import { auth } from '@/lib/auth'
import { calculateBSD } from '@/lib/utils'
import { createPropertySchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDB()
    const properties = await sql`
      SELECT * FROM properties 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDB()
    const data = await request.json()
    const parsed = createPropertySchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const validated = parsed.data
    
    // Calculate stamp duty if not provided
    const stampDuty = validated.stamp_duty || calculateBSD(validated.purchase_price)
    
    const result = await sql`
      INSERT INTO properties (
        name, address, type, purchase_price, purchase_date,
        stamp_duty, renovation_cost, agent_fees, current_value,
        cpf_amount, mortgage_amount, mortgage_interest_rate, mortgage_tenure, monthly_rental,
        target_profit_percentage, target_profit_alert_sent, user_id
      ) VALUES (
        ${validated.name}, ${validated.address}, ${validated.type}, ${validated.purchase_price}, ${validated.purchase_date},
        ${stampDuty}, ${validated.renovation_cost}, ${validated.agent_fees}, ${validated.current_value || validated.purchase_price},
        ${validated.cpf_amount}, ${validated.mortgage_amount}, ${validated.mortgage_interest_rate}, ${validated.mortgage_tenure}, ${validated.monthly_rental},
        ${validated.target_profit_percentage}, false, ${userId}
      ) RETURNING *
    `

    const newProperty = result[0]

    // Insert purchase transaction
    await sql`
      INSERT INTO transactions (property_id, type, amount, description, date)
      VALUES (${newProperty.id}, 'purchase', ${validated.purchase_price}, 'Initial property purchase', ${validated.purchase_date})
    `

    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}

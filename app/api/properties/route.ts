import { NextRequest, NextResponse } from 'next/server'
import sql, { initDB } from '@/lib/database'
import { auth } from '@/lib/auth'
import { calculateBSD } from '@/lib/utils'

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
    
    // Calculate stamp duty if not provided
    const stampDuty = data.stamp_duty || calculateBSD(data.purchase_price)
    
    const result = await sql`
      INSERT INTO properties (
        name, address, type, purchase_price, purchase_date,
        stamp_duty, renovation_cost, agent_fees, current_value,
        cpf_amount, mortgage_amount, mortgage_interest_rate, mortgage_tenure, user_id
      ) VALUES (
        ${data.name}, ${data.address}, ${data.type}, ${data.purchase_price}, ${data.purchase_date},
        ${stampDuty}, ${data.renovation_cost || 0}, ${data.agent_fees || 0}, ${data.current_value || data.purchase_price},
        ${data.cpf_amount || 0}, ${data.mortgage_amount || 0}, ${data.mortgage_interest_rate || 0}, ${data.mortgage_tenure || 0}, ${userId}
      ) RETURNING *
    `

    const newProperty = result[0]

    // Insert purchase transaction
    await sql`
      INSERT INTO transactions (property_id, type, amount, description, date)
      VALUES (${newProperty.id}, 'purchase', ${data.purchase_price}, 'Initial property purchase', ${data.purchase_date})
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

import { NextRequest, NextResponse } from 'next/server'
import sql, { initDB } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB()
    const { id } = await params
    const properties = await sql`SELECT * FROM properties WHERE id = ${id}`
    
    if (properties.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE property_id = ${id}
      ORDER BY date DESC
    `

    return NextResponse.json({ ...properties[0], transactions })
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
    await initDB()
    const { id } = await params
    const data = await request.json()
    
    const result = await sql`
      UPDATE properties 
      SET name = ${data.name}, address = ${data.address}, type = ${data.type}, 
          purchase_price = ${data.purchase_price}, purchase_date = ${data.purchase_date},
          stamp_duty = ${data.stamp_duty}, renovation_cost = ${data.renovation_cost}, 
          agent_fees = ${data.agent_fees}, current_value = ${data.current_value},
          cpf_amount = ${data.cpf_amount}, mortgage_amount = ${data.mortgage_amount}, 
          mortgage_interest_rate = ${data.mortgage_interest_rate}, mortgage_tenure = ${data.mortgage_tenure}
      WHERE id = ${id}
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
    await initDB()
    const { id } = await params
    const result = await sql`DELETE FROM properties WHERE id = ${id} RETURNING id`

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

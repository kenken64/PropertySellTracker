import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(params.id)
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get transactions for this property
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE property_id = ? 
      ORDER BY date DESC
    `).all(params.id)

    return NextResponse.json({ ...property, transactions })
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
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const stmt = db.prepare(`
      UPDATE properties 
      SET name = ?, address = ?, type = ?, purchase_price = ?, purchase_date = ?,
          stamp_duty = ?, renovation_cost = ?, agent_fees = ?, current_value = ?,
          cpf_amount = ?, mortgage_amount = ?, mortgage_interest_rate = ?, mortgage_tenure = ?
      WHERE id = ?
    `)
    
    const result = stmt.run(
      data.name,
      data.address,
      data.type,
      data.purchase_price,
      data.purchase_date,
      data.stamp_duty,
      data.renovation_cost,
      data.agent_fees,
      data.current_value,
      data.cpf_amount,
      data.mortgage_amount,
      data.mortgage_interest_rate,
      data.mortgage_tenure,
      params.id
    )

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const updatedProperty = db.prepare('SELECT * FROM properties WHERE id = ?').get(params.id)
    return NextResponse.json(updatedProperty)
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
  { params }: { params: { id: string } }
) {
  try {
    const stmt = db.prepare('DELETE FROM properties WHERE id = ?')
    const result = stmt.run(params.id)

    if (result.changes === 0) {
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
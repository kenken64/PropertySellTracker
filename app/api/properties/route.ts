import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/database'
import { calculateBSD } from '@/lib/utils'

export async function GET() {
  try {
    const properties = db.prepare(`
      SELECT * FROM properties 
      ORDER BY created_at DESC
    `).all()

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
    const data = await request.json()
    
    // Calculate stamp duty if not provided
    const stampDuty = data.stamp_duty || calculateBSD(data.purchase_price)
    
    const stmt = db.prepare(`
      INSERT INTO properties (
        name, address, type, purchase_price, purchase_date,
        stamp_duty, renovation_cost, agent_fees, current_value,
        cpf_amount, mortgage_amount, mortgage_interest_rate, mortgage_tenure
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      data.name,
      data.address,
      data.type,
      data.purchase_price,
      data.purchase_date,
      stampDuty,
      data.renovation_cost || 0,
      data.agent_fees || 0,
      data.current_value || data.purchase_price,
      data.cpf_amount || 0,
      data.mortgage_amount || 0,
      data.mortgage_interest_rate || 0,
      data.mortgage_tenure || 0
    )

    // Insert purchase transaction
    const transactionStmt = db.prepare(`
      INSERT INTO transactions (property_id, type, amount, description, date)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    transactionStmt.run(
      result.lastInsertRowid,
      'purchase',
      data.purchase_price,
      'Initial property purchase',
      data.purchase_date
    )

    const newProperty = db.prepare('SELECT * FROM properties WHERE id = ?').get(result.lastInsertRowid)
    
    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
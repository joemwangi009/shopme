import { NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

export async function GET() {
  try {
    const result = await db.query(`
      SELECT id, name, description, image, "createdAt", "updatedAt"
      FROM "Category"
      ORDER BY name ASC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

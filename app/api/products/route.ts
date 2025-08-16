import { NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    let query = `
      SELECT p.*, c.name as category_name
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      WHERE 1=1
    `
    const params: (string | number)[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND p."categoryId" = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Get total count for pagination
    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total')
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total as string || '0')

    // Get products with pagination
    query += ` ORDER BY p."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await db.query(query, params)

    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price as string),
      images: row.images,
      categoryId: row.categoryId,
      stock: parseInt(row.stock as string),
      category: {
        id: row.categoryId,
        name: row.category_name,
      },
      createdAt: row['createdAt'],
      updatedAt: row['updatedAt'],
    }))

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

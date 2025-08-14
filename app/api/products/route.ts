import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

const ITEMS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sort = searchParams.get('sort')

    // Build WHERE conditions
    const conditions: string[] = []
    const params: (string | number)[] = []
    let paramCount = 0

    // Price filters
    conditions.push(`p.price >= $${++paramCount}`)
    params.push(minPrice)
    
    conditions.push(`p.price <= $${++paramCount}`)
    params.push(maxPrice)

    // Category filter
    if (category) {
      conditions.push(`p."categoryId" = $${++paramCount}`)
      params.push(category)
    }

    // Search filter
    if (search) {
      conditions.push(`(
        p.name ILIKE $${++paramCount} OR 
        p.description ILIKE $${++paramCount}
      )`)
      params.push(`%${search}%`)
      params.push(`%${search}%`)
      paramCount += 2
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Build ORDER BY clause
    let orderByClause = 'ORDER BY p."createdAt" DESC'
    switch (sort) {
      case 'price_asc':
        orderByClause = 'ORDER BY p.price ASC'
        break
      case 'price_desc':
        orderByClause = 'ORDER BY p.price DESC'
        break
      case 'name_asc':
        orderByClause = 'ORDER BY p.name ASC'
        break
      case 'name_desc':
        orderByClause = 'ORDER BY p.name DESC'
        break
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM "Product" p
      ${whereClause}
    `
    const countResult = await db.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // Get products with pagination
    const offset = (page - 1) * ITEMS_PER_PAGE
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p."categoryId",
        p.stock,
        p."createdAt",
        p."updatedAt",
        c.id as "category_id",
        c.name as "category_name",
        c.description as "category_description",
        c.image as "category_image"
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `
    
    params.push(ITEMS_PER_PAGE)
    params.push(offset)

    const productsResult = await db.query(productsQuery, params)

    // Format the results to match Prisma's structure
    const products = productsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      images: row.images,
      categoryId: row.categoryId,
      stock: row.stock,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      category: {
        id: row.category_id,
        name: row.category_name,
        description: row.category_description,
        image: row.category_image
      }
    }))

    return NextResponse.json({
      products,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
    })
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

interface CountResult {
  total: unknown;
}

interface DBProductRow {
  id: unknown;
  name: unknown;
  description: unknown;
  price: unknown;
  images: unknown;
  categoryId: unknown;
  stock: unknown;
  createdAt: unknown;
  updatedAt: unknown;
  category_id: unknown;
  category_name: unknown;
  category_description: unknown;
  category_image: unknown;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    description: string;
    image: string;
  };
}

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
      conditions.push(`(p.name ILIKE $${++paramCount} OR p.description ILIKE $${++paramCount})`)
      params.push(`%${search}%`, `%${search}%`)
      paramCount++ // Account for the extra parameter
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Build ORDER BY clause
    let orderByClause = 'ORDER BY p."createdAt" DESC' // Default sort
    switch (sort) {
      case 'price-asc':
        orderByClause = 'ORDER BY p.price ASC'
        break
      case 'price-desc':
        orderByClause = 'ORDER BY p.price DESC'
        break
      case 'name-asc':
        orderByClause = 'ORDER BY p.name ASC'
        break
      case 'name-desc':
        orderByClause = 'ORDER BY p.name DESC'
        break
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM "Product" p
      ${whereClause}
    `
    const countResult = await db.query<CountResult>(countQuery, params)
    const total = parseInt(countResult.rows[0].total as string)

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
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    
    const productsResult = await db.query<DBProductRow>(productsQuery, [...params, ITEMS_PER_PAGE, offset])
    
    const products: Product[] = productsResult.rows.map((row): Product => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      price: parseFloat(row.price as string),
      images: row.images as string[],
      categoryId: row.categoryId as string,
      stock: Number(row.stock),
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
      category: {
        id: row.category_id as string,
        name: row.category_name as string,
        description: row.category_description as string,
        image: row.category_image as string,
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

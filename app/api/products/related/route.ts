import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const currentProductId = searchParams.get('currentProductId')

    if (!categoryId || !currentProductId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const result = await db.query(`
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
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN r.id IS NOT NULL 
              THEN JSON_BUILD_OBJECT(
                'id', r.id,
                'rating', r.rating,
                'comment', r.comment,
                'userId', r."userId",
                'createdAt', r."createdAt"
              )
              ELSE NULL
            END
          ) FILTER (WHERE r.id IS NOT NULL), 
          '[]'::json
        ) as reviews
      FROM "Product" p
      LEFT JOIN "Review" r ON p.id = r."productId"
      WHERE p."categoryId" = $1 
        AND p.id != $2
      GROUP BY p.id, p.name, p.description, p.price, p.images, p."categoryId", p.stock, p."createdAt", p."updatedAt"
      LIMIT 6
    `, [categoryId, currentProductId])

    const relatedProducts = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      images: row.images,
      categoryId: row.categoryId,
      stock: row.stock,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      reviews: Array.isArray(row.reviews) ? row.reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        createdAt: new Date(review.createdAt)
      })) : []
    }))

    return NextResponse.json(relatedProducts)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

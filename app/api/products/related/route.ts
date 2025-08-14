import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
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
  reviews: unknown;
}

interface RelatedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  reviews: {
    id: string;
    rating: number;
    comment: string;
    userId: string;
    createdAt: Date;
  }[];
}

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

    const result = await db.query<DBProductRow>(`
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

    const relatedProducts: RelatedProduct[] = result.rows.map((row): RelatedProduct => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      price: parseFloat(row.price as string),
      images: row.images as string[],
      categoryId: row.categoryId as string,
      stock: Number(row.stock),
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
      reviews: Array.isArray(row.reviews) ? (row.reviews as ReviewData[]).map((review: ReviewData) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        createdAt: new Date(review.createdAt),
      })) : [],
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

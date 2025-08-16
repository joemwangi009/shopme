import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'
import { ProductReviews } from '@/components/products/product-reviews'
import { ProductRelated } from '@/components/products/product-related'
import { db } from '@/lib/db-pool'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  categoryId: string
  stock: number
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
  }
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    user: {
      name: string | null
      image: string | null
    }
  }[]
}

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const result = await db.query<{
      id: unknown
      name: unknown
      description: unknown
      price: unknown
      images: unknown
      category_id: unknown
      stock: unknown
      created_at: unknown
      updated_at: unknown
      category_name: unknown
    }>(`
      SELECT p.*, c.name as category_name
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      WHERE p.id = $1
    `, [productId])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]

    // Get reviews for this product
    const reviewsResult = await db.query<{
      id: unknown
      rating: unknown
      comment: unknown
      created_at: unknown
      user_name: unknown
      user_image: unknown
    }>(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, u.image as user_image
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r.product_id = $1
    `, [productId])

    const reviews = reviewsResult.rows.map(review => ({
      id: review.id as string,
      rating: parseInt(review.rating as string),
      comment: review.comment as string | null,
      createdAt: new Date(review.created_at as string),
      user: {
        name: review.user_name as string | null,
        image: review.user_image as string | null,
      },
    }))

    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      price: parseFloat(row.price as string),
      images: row.images as string[],
      categoryId: row.category_id as string,
      stock: parseInt(row.stock as string),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      category: {
        id: row.category_id as string,
        name: row.category_name as string,
      },
      reviews,
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
        <ProductGallery images={product.images} />
        <ProductInfo product={product} />
      </div>

      <div className='space-y-12'>
        <ProductReviews productId={product.id} reviews={product.reviews} />
        <ProductRelated categoryId={product.categoryId} currentProductId={product.id} />
      </div>
    </div>
  )
}

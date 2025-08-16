import { LatestProducts } from '@/components/home/latest-products'
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
}

async function getLatestProducts(): Promise<Product[]> {
  try {
    const result = await db.query<{
      id: unknown
      name: unknown
      description: unknown
      price: unknown
      images: unknown
      categoryId: unknown
      stock: unknown
      created_at: unknown
      updated_at: unknown
    }>(`
      SELECT id, name, description, price, images, "categoryId", stock, created_at, updated_at
      FROM "Product" 
      ORDER BY created_at DESC 
      LIMIT 8
    `)

    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      price: typeof row.price === 'number' ? row.price : parseFloat(row.price as string),
      images: row.images as string[],
      categoryId: row.categoryId as string,
      stock: parseInt(row.stock as string),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }))
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return []
  }
}

export default async function HomePage() {
  const products = await getLatestProducts()

  return (
    <div className='space-y-8'>
      {/* Hero Section */}
      <section className='relative h-[500px] overflow-hidden rounded-lg'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600' />
        <div className='relative z-10 flex h-full items-center justify-center text-center text-white'>
          <div className='space-y-4'>
            <h1 className='text-5xl font-bold'>Welcome to ShopMe</h1>
            <p className='text-xl'>Discover amazing products at great prices</p>
            <button className='rounded-lg bg-white px-6 py-3 text-blue-600 font-semibold hover:bg-gray-100 transition-colors'>
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section>
        <h2 className='text-3xl font-bold mb-6'>Latest Products</h2>
        <LatestProducts products={products} />
      </section>
    </div>
  )
}

'use client'

import { ProductCard } from '@/components/ui/product-card'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  categoryId: string
  stock: number
  category: {
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

interface LatestProductsProps {
  products: Product[]
}

export function LatestProducts({ products }: LatestProductsProps) {
  return (
    <section className='container mx-auto px-4 sm:px-6 lg:px-8'>
      <h2 className='text-2xl font-bold mb-6'>Latest Products</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

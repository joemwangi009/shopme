import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }>
}

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
    description: string
    image: string
  }
}

async function getProducts(searchParams: {
  search?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
}): Promise<{ products: Product[]; totalPages: number; currentPage: number }> {
  try {
    const url = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products`)
    
    // Add search parameters to URL
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value)
      }
    })

    const response = await fetch(url.toString(), {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Failed to fetch products')
      return { products: [], totalPages: 0, currentPage: 1 }
    }
    
    const data = await response.json()
    return {
      products: data.products || [],
      totalPages: data.totalPages || 0,
      currentPage: parseInt(searchParams.page || '1')
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], totalPages: 0, currentPage: 1 }
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const { products, totalPages, currentPage } = await getProducts(params)
  
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>
          {params.search ? `Search results for "${params.search}"` : 'All Products'}
        </h1>
        <p className='text-gray-600'>
          Discover our amazing collection of products
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar */}
        <div className='lg:w-64'>
          <ProductSidebar />
        </div>

        {/* Product Grid */}
        <div className='flex-1'>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              products={products}
              loading={false}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                // This will be handled by the ProductSidebar component
                // or we can implement client-side navigation here
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='space-y-4'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      ))}
    </div>
  )
} 
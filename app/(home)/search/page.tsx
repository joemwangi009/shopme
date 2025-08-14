import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchPageProps {
  searchParams: {
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>
          {searchParams.search ? `Search results for "${searchParams.search}"` : 'All Products'}
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
              search={searchParams.search}
              category={searchParams.category}
              minPrice={searchParams.minPrice}
              maxPrice={searchParams.maxPrice}
              sort={searchParams.sort}
              page={searchParams.page}
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
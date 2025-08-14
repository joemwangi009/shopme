'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const url = new URL(`${window.location.origin}/api/products`)
        
        // Add search parameters to URL
        const params = {
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
          minPrice: searchParams.get('minPrice') || undefined,
          maxPrice: searchParams.get('maxPrice') || undefined,
          sort: searchParams.get('sort') || undefined,
          page: searchParams.get('page') || '1'
        }

        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.append(key, value)
          }
        })

        const response = await fetch(url.toString())
        
        if (!response.ok) {
          console.error('Failed to fetch products')
          setProducts([])
          setTotalPages(0)
          setCurrentPage(1)
          return
        }
        
        const data = await response.json()
        setProducts(data.products || [])
        setTotalPages(data.totalPages || 0)
        setCurrentPage(parseInt(params.page || '1'))
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setTotalPages(0)
        setCurrentPage(1)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  const search = searchParams.get('search')
  
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>
          {search ? `Search results for "${search}"` : 'All Products'}
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
              loading={loading}
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
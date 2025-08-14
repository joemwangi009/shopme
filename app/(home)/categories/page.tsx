import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  description: string
  image: string
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Failed to fetch categories')
      return []
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Categories</h1>
        <p className='text-gray-600'>
          Browse our product categories to find exactly what you're looking for
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {categories.map((category) => (
          <Link key={category.id} href={`/search?category=${category.id}`}>
            <Card className='group hover:shadow-lg transition-shadow duration-200'>
              <CardContent className='p-6'>
                <div className='aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100'>
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-200'
                  />
                </div>
                <h3 className='font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors'>
                  {category.name}
                </h3>
                <p className='text-gray-600 text-sm line-clamp-2'>
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className='text-center py-16'>
          <h3 className='text-lg font-semibold mb-2'>No categories found</h3>
          <p className='text-gray-600'>Categories are being set up. Please check back later.</p>
        </div>
      )}
    </div>
  )
} 
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    // Build Prisma query
    const where: any = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' } // Default sort
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where })
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      products,
      totalPages,
      currentPage: page,
      totalCount,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

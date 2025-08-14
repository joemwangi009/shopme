import { NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'

interface DBCategory {
  id: unknown;
  name: unknown;
  description: unknown;
  image: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const result = await db.query<DBCategory>(`
      SELECT id, name, description, image, "createdAt", "updatedAt"
      FROM "Category"
      ORDER BY name ASC
    `)

    const categories: Category[] = result.rows.map((row): Category => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      image: row.image as string,
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

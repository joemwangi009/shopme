import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 Setting up database...')

    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma Client generated')

    // Step 2: Push database schema (creates all tables)
    console.log('🗄️  Creating database tables...')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    console.log('✅ Database tables created')

    // Step 3: Seed database with sample data
    console.log('🌱 Seeding database with sample data...')
    execSync('npx prisma db seed', { stdio: 'inherit' })
    console.log('✅ Database seeded')

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      details: {
        tables: 'All tables created',
        data: 'Sample data seeded',
        users: 'Admin and regular user accounts created',
        products: '6 sample products added',
        categories: '3 categories created'
      }
    })

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return NextResponse.json(
      { 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database setup endpoint',
    usage: 'POST to this endpoint to setup database',
    note: 'This will create all tables and seed sample data'
  })
} 
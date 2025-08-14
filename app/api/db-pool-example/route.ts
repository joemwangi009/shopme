import { NextRequest, NextResponse } from 'next/server';
import { db, DatabaseHelpers } from '@/lib/db-pool';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'users';

    switch (action) {
      case 'users':
        const users = await DatabaseHelpers.getUsers(10);
        return NextResponse.json({
          success: true,
          data: users,
          message: `Found ${users.length} users`
        });

      case 'products':
        const categoryId = searchParams.get('categoryId');
        const products = await DatabaseHelpers.getProducts(categoryId || undefined, 10);
        return NextResponse.json({
          success: true,
          data: products,
          message: `Found ${products.length} products`
        });

      case 'orders':
        const orderSummary = await DatabaseHelpers.getOrderSummary();
        return NextResponse.json({
          success: true,
          data: orderSummary,
          message: 'Order summary retrieved'
        });

      case 'custom':
        // Example of custom SQL query
        const customQuery = `
          SELECT 
            c.name as category_name,
            COUNT(p.id) as product_count,
            AVG(p.price) as avg_price
          FROM "Category" c
          LEFT JOIN "Product" p ON c.id = p."categoryId"
          GROUP BY c.id, c.name
          ORDER BY product_count DESC
        `;
        const result = await db.query(customQuery);
        return NextResponse.json({
          success: true,
          data: result.rows,
          message: 'Custom query executed'
        });

      case 'pool-status':
        const poolStatus = db.getPoolStatus();
        return NextResponse.json({
          success: true,
          data: poolStatus,
          message: 'Pool status retrieved'
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Available actions: users, products, orders, custom, pool-status'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Database pool API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-user':
        const { name, email, role = 'USER' } = data;
        if (!name || !email) {
          return NextResponse.json({
            success: false,
            message: 'Name and email are required'
          }, { status: 400 });
        }

        const userId = 'user_' + Date.now();
        await db.query(
          'INSERT INTO "User" (id, name, email, role) VALUES ($1, $2, $3, $4)',
          [userId, name, email, role]
        );

        return NextResponse.json({
          success: true,
          data: { id: userId, name, email, role },
          message: 'User created successfully'
        });

      case 'create-category':
        const { name: categoryName, description } = data;
        if (!categoryName) {
          return NextResponse.json({
            success: false,
            message: 'Category name is required'
          }, { status: 400 });
        }

        const categoryId = 'cat_' + Date.now();
        await db.query(
          'INSERT INTO "Category" (id, name, description) VALUES ($1, $2, $3)',
          [categoryId, categoryName, description || null]
        );

        return NextResponse.json({
          success: true,
          data: { id: categoryId, name: categoryName, description },
          message: 'Category created successfully'
        });

      case 'transaction-example':
        // Example of using transactions
        const result = await db.transaction(async (client) => {
          // Create a user
          const userId = 'user_' + Date.now();
          await client.query(
            'INSERT INTO "User" (id, name, email, role) VALUES ($1, $2, $3, $4)',
            [userId, 'Transaction User', `trans${Date.now()}@example.com`, 'USER']
          );

          // Create a category
          const categoryId = 'cat_' + Date.now();
          await client.query(
            'INSERT INTO "Category" (id, name, description) VALUES ($1, $2, $3)',
            [categoryId, 'Transaction Category', 'Created in transaction']
          );

          // Create a product
          const productId = 'prod_' + Date.now();
          await client.query(
            'INSERT INTO "Product" (id, name, description, price, "categoryId", stock) VALUES ($1, $2, $3, $4, $5, $6)',
            [productId, 'Transaction Product', 'Created in transaction', 99.99, categoryId, 5]
          );

          return { userId, categoryId, productId };
        });

        return NextResponse.json({
          success: true,
          data: result,
          message: 'Transaction completed successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Available actions: create-user, create-category, transaction-example'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Database pool POST API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
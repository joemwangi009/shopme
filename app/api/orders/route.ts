import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db-pool'

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
}

interface ShippingInfo {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface OrderBody {
  items: CartItem[]
  shippingInfo: ShippingInfo
  total: number
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized: User ID is required', {
        status: 401,
      })
    }

    const body = await req.json()
    const { items, shippingInfo, total } = body as OrderBody

    if (!items?.length) {
      return new NextResponse('Bad Request: Cart items are required', {
        status: 400,
      })
    }

    if (!shippingInfo) {
      return new NextResponse('Bad Request: Shipping information is required', {
        status: 400,
      })
    }

    // Verify all products exist and are in stock
    const productIds = items.map((item) => item.productId)
    const placeholders = productIds.map((_, index) => `$${index + 1}`).join(', ')
    
    const productsResult = await db.query(
      `SELECT id, stock FROM "Product" WHERE id IN (${placeholders})`,
      productIds
    )

    const products = productsResult.rows

    // Check if all products exist
    if (products.length !== items.length) {
      const foundProductIds = products.map((p) => p.id)
      const missingProductIds = productIds.filter(
        (id) => !foundProductIds.includes(id)
      )
      return new NextResponse(
        `Products not found: ${missingProductIds.join(', ')}`,
        {
          status: 400,
        }
      )
    }

    // Check stock levels
    const insufficientStock = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product && product.stock < item.quantity
    })

    if (insufficientStock.length > 0) {
      return new NextResponse(
        `Insufficient stock for products: ${insufficientStock
          .map((item) => item.productId)
          .join(', ')}`,
        { status: 400 }
      )
    }

    // Start a transaction to ensure all operations succeed or fail together
    const order = await db.transaction(async (client) => {
      // Create shipping address first
      const addressId = 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      await client.query(
        `INSERT INTO "Address" (id, "userId", street, city, state, "postalCode", country, "isDefault")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          addressId,
          session.user.id,
          shippingInfo.address,
          shippingInfo.city,
          shippingInfo.state,
          shippingInfo.zipCode,
          shippingInfo.country,
          false
        ]
      )

      // Create order
      const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      await client.query(
        `INSERT INTO "Order" (id, "userId", "addressId", total, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, session.user.id, addressId, total, 'PENDING']
      )

      // Create order items
      for (const item of items) {
        const orderItemId = 'oi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        await client.query(
          `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderItemId, orderId, item.productId, item.quantity, item.price]
        )
      }

      // Update product stock levels
      for (const item of items) {
        await client.query(
          `UPDATE "Product" 
           SET stock = stock - $1, "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [item.quantity, item.productId]
        )
      }

      // Clear the user's cart if it exists
      try {
        await client.query(
          `DELETE FROM "CartItem" WHERE "cartId" IN (
             SELECT id FROM "Cart" WHERE "userId" = $1
           )`,
          [session.user.id]
        )
        await client.query(
          `DELETE FROM "Cart" WHERE "userId" = $1`,
          [session.user.id]
        )
      } catch (error) {
        // Ignore error if cart doesn't exist
      }

      // Get the created order with its details
      const orderResult = await client.query(
        `SELECT 
           o.id,
           o."userId",
           o."addressId", 
           o.total,
           o.status,
           o."createdAt",
           o."updatedAt"
         FROM "Order" o 
         WHERE o.id = $1`,
        [orderId]
      )

      // Get order items
      const itemsResult = await client.query(
        `SELECT id, "orderId", "productId", quantity, price
         FROM "OrderItem" 
         WHERE "orderId" = $1`,
        [orderId]
      )

      // Get shipping address
      const addressResult = await client.query(
        `SELECT id, street, city, state, "postalCode", country
         FROM "Address" 
         WHERE id = $1`,
        [addressId]
      )

      return {
        ...orderResult.rows[0],
        items: itemsResult.rows,
        shippingAddress: addressResult.rows[0]
      }
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('[ORDERS_POST]', error)
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}

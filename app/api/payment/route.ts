import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db-pool'
import Stripe from 'stripe'

// Check if Stripe is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not configured - payment functionality will be disabled')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      )
    }

    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the order with its items and shipping address
    const orderResult = await db.query(`
      SELECT 
        o.id,
        o."userId",
        o.total,
        o."stripePaymentId",
        o.status,
        a.street,
        a.city,
        a.state,
        a."postalCode",
        a.country
      FROM "Order" o
      JOIN "Address" a ON o."addressId" = a.id
      WHERE o.id = $1 AND o."userId" = $2
    `, [orderId, session.user.id])

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // If order is already paid, return error
    if (order.stripePaymentId) {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      )
    }

    // Get order items with product details
    const itemsResult = await db.query(`
      SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        p.id as product_id,
        p.name as product_name,
        p.images as product_images
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = $1
    `, [orderId])

    // Calculate final amount including tax and shipping
    const subtotal = parseFloat(order.total)
    const shipping = 10 // Fixed shipping cost
    const tax = subtotal * 0.1 // 10% tax
    const total = Math.round((subtotal + shipping + tax) * 100) // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with payment intent ID
    await db.query(`
      UPDATE "Order" 
      SET "stripePaymentId" = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [paymentIntent.id, order.id])

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('[PAYMENT_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

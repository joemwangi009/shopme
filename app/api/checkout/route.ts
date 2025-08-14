import { NextResponse } from 'next/server'
import { db } from '@/lib/db-pool'
import Stripe from 'stripe'
import { auth } from '@/auth'

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CheckoutBody {
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

interface Order {
  id: string;
  total: number;
}

// Check if Stripe is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not configured - checkout functionality will be disabled')
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

    const body: CheckoutBody = await req.json()
    const { items, shippingAddress } = body

    if (!items?.length || !shippingAddress) {
      return NextResponse.json(
        { error: 'Bad request' },
        { status: 400 }
      )
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    )

    // Create order using transaction
    const order: Order = await db.transaction(async (client) => {
      // Create order
      const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      await client.query(
        `INSERT INTO "Order" (id, "userId", "addressId", total, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, session.user.id, shippingAddress.id, total, 'PENDING']
      )

      // Create order items
      for (const item of items) {
        const orderItemId = 'oi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        await client.query(
          `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderItemId, orderId, item.id, item.quantity, item.price]
        )
      }

      return { id: orderId, total }
    })

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(
        (order.total + order.total * 0.1 + 10) * 100 // Total + 10% tax + $10 shipping
      ),
      currency: 'usd',
      metadata: {
        orderId: order.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    console.error('[CHECKOUT_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

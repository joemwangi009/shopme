/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'
import { auth } from '@/auth'

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

    const body = await req.json()
    const { items, shippingAddress } = body

    if (!items?.length || !shippingAddress) {
      return NextResponse.json(
        { error: 'Bad request' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        total: items.reduce(
          (total: number, item: any) => total + item.price * item.quantity,
          0
        ),
        addressId: shippingAddress.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

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

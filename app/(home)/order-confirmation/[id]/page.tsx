import { db } from '@/lib/db-pool'
import { notFound } from 'next/navigation'

interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
  items: OrderItem[]
  shippingAddress: Address
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: Product
}

interface Product {
  id: string
  name: string
  images: string[]
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

async function getOrder(orderId: string): Promise<Order | null> {
  try {
    // Get order details
    const orderResult = await db.query<{
      id: unknown
      total: unknown
      status: unknown
      createdAt: unknown
      addressId: unknown
    }>(`
      SELECT id, total, status, "createdAt", "addressId"
      FROM "Order"
      WHERE id = $1
    `, [orderId])

    if (orderResult.rows.length === 0) {
      return null
    }

    const orderRow = orderResult.rows[0]

    // Get order items with product details
    const itemsResult = await db.query<{
      id: unknown
      quantity: unknown
      price: unknown
      product_id: unknown
      product_name: unknown
      product_images: unknown
    }>(`
      SELECT oi.id, oi.quantity, oi.price, p.id as product_id, p.name as product_name, p.images as product_images
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = $1
    `, [orderId])

    // Get shipping address
    const addressResult = await db.query<{
      id: unknown
      street: unknown
      city: unknown
      state: unknown
      postalCode: unknown
      country: unknown
    }>(`
      SELECT id, street, city, state, "postalCode", country
      FROM "Address"
      WHERE id = $1
    `, [orderId])

    if (addressResult.rows.length === 0) {
      return null
    }

    const addressRow = addressResult.rows[0]

    const order: Order = {
      id: orderRow.id as string,
      total: parseFloat(orderRow.total as string),
      status: orderRow.status as string,
      createdAt: new Date(orderRow.createdAt as string),
      items: itemsResult.rows.map(item => ({
        id: item.id as string,
        quantity: parseInt(item.quantity as string),
        price: parseFloat(item.price as string),
        product: {
          id: item.product_id as string,
          name: item.product_name as string,
          images: item.product_images as string[],
        },
      })),
      shippingAddress: {
        id: addressRow.id as string,
        street: addressRow.street as string,
        city: addressRow.city as string,
        state: addressRow.state as string,
        postalCode: addressRow.postalCode as string,
        country: addressRow.country as string,
      },
    }

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-green-600'>Order Confirmed!</h1>
          <p className='text-muted-foreground'>
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        <div className='bg-white rounded-lg border p-6 space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Order #{order.id.slice(0, 8)}</h2>
            <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize'>
              {order.status.toLowerCase()}
            </span>
          </div>

          <div className='space-y-4'>
            <h3 className='font-semibold'>Order Items:</h3>
            {order.items.map((item) => (
              <div key={item.id} className='flex justify-between items-center py-2 border-b'>
                <div>
                  <p className='font-medium'>{item.product.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className='font-medium'>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className='pt-4 border-t'>
            <div className='flex justify-between items-center'>
              <span className='text-lg font-semibold'>Total:</span>
              <span className='text-2xl font-bold'>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border p-6'>
          <h3 className='font-semibold mb-4'>Shipping Address:</h3>
          <div className='space-y-2'>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className='text-center'>
          <p className='text-muted-foreground'>
            Order placed on {order.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

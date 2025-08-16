import { PaymentForm } from '@/components/checkout/payment-form'
import { db } from '@/lib/db-pool'
import { notFound } from 'next/navigation'

interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
}

async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const result = await db.query<{
      id: unknown
      total: unknown
      status: unknown
      createdAt: unknown
    }>(`
      SELECT id, total, status, "createdAt"
      FROM "Order"
      WHERE id = $1
    `, [orderId])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id as string,
      total: parseFloat(row.total as string),
      status: row.status as string,
      createdAt: new Date(row.createdAt as string),
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold'>Complete Your Payment</h1>
          <p className='text-muted-foreground'>
            Order #{order.id.slice(0, 8)} - Total: ${order.total.toFixed(2)}
          </p>
        </div>

        <PaymentForm orderId={order.id} />
      </div>
    </div>
  )
}

import { AddressList } from '@/components/dashboard/address-list'
import { AddressForm } from '@/components/dashboard/address-form'
import { db } from '@/lib/db-pool'

interface Address {
  id: string
  userId: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

async function getAddresses(): Promise<Address[]> {
  try {
    const result = await db.query<{
      id: unknown
      user_id: unknown
      street: unknown
      city: unknown
      state: unknown
      postal_code: unknown
      country: unknown
      is_default: unknown
      created_at: unknown
      updated_at: unknown
    }>(`
      SELECT id, user_id, street, city, state, postal_code, country, is_default, created_at, updated_at
      FROM "Address"
      ORDER BY is_default DESC, created_at DESC
    `)

    return result.rows.map(row => ({
      id: row.id as string,
      userId: row.user_id as string,
      street: row.street as string,
      city: row.city as string,
      state: row.state as string,
      postalCode: row.postal_code as string,
      country: row.country as string,
      isDefault: row.is_default as boolean,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }))
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return []
  }
}

export default async function AddressesPage() {
  const addresses = await getAddresses()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Addresses</h2>
        <p className='text-muted-foreground'>
          Manage your shipping addresses for faster checkout.
        </p>
      </div>

      <AddressForm />

      <AddressList addresses={addresses} />
    </div>
  )
}

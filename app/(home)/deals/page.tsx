export default function DealsPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Special Deals & Offers</h1>
        <p className='text-gray-600'>
          Discover amazing deals and limited-time offers on your favorite products
        </p>
      </div>

      <div className='text-center py-16'>
        <h2 className='text-xl font-semibold mb-4'>🎉 Coming Soon!</h2>
        <p className='text-gray-600 mb-6'>
          We&apos;re working on bringing you the best deals and offers. Check back soon for amazing discounts!
        </p>
        <p className='text-sm text-gray-500'>
          In the meantime, browse our <a href='/search' className='text-blue-600 hover:underline'>products</a> or 
          sign up for our newsletter to be notified of special offers.
        </p>
      </div>
    </div>
  )
} 
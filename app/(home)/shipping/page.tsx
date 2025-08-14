export default function ShippingPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>Shipping Information</h1>
      
      <div className='prose prose-gray max-w-none space-y-8'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>Shipping Options</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 not-prose'>
            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='font-semibold text-lg mb-2'>Standard Shipping</h3>
              <p className='text-gray-600 mb-2'>5-7 business days</p>
              <p className='font-semibold'>FREE on orders over $50</p>
              <p className='text-sm text-gray-500'>$5.99 for orders under $50</p>
            </div>
            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='font-semibold text-lg mb-2'>Express Shipping</h3>
              <p className='text-gray-600 mb-2'>2-3 business days</p>
              <p className='font-semibold'>$9.99</p>
            </div>
            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='font-semibold text-lg mb-2'>Next Day Delivery</h3>
              <p className='text-gray-600 mb-2'>1 business day</p>
              <p className='font-semibold'>$19.99</p>
              <p className='text-sm text-gray-500'>Order by 2 PM EST</p>
            </div>
            <div className='bg-gray-50 p-6 rounded-lg'>
              <h3 className='font-semibold text-lg mb-2'>Same Day Delivery</h3>
              <p className='text-gray-600 mb-2'>Select metropolitan areas</p>
              <p className='font-semibold'>$24.99</p>
              <p className='text-sm text-gray-500'>Order by 12 PM EST</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Shipping Policies</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>All orders are processed within 1-2 business days</li>
            <li>Shipping times are estimates and may vary during peak seasons</li>
            <li>We ship Monday through Friday (excluding holidays)</li>
            <li>PO Box addresses require standard shipping only</li>
            <li>International shipping available to select countries</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Order Tracking</h2>
          <p className='mb-4'>
            Once your order ships, you'll receive a tracking number via email. You can also track your 
            order by logging into your account and viewing your order history.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Questions?</h2>
          <p>
            If you have any questions about shipping, please contact our customer service team at 
            <a href='mailto:support@shopme.com' className='text-blue-600 hover:underline ml-1'>
              support@shopme.com
            </a> or call 1-800-SHOPME.
          </p>
        </section>
      </div>
    </div>
  )
} 
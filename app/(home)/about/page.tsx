export default function AboutPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>About ShopMe</h1>
      
      <div className='prose prose-gray max-w-none'>
        <p className='text-lg text-gray-600 mb-6'>
          Welcome to ShopMe, your premier destination for quality products and exceptional shopping experiences.
        </p>
        
        <h2 className='text-2xl font-semibold mb-4'>Our Story</h2>
        <p className='mb-6'>
          Founded with a vision to make online shopping simple, secure, and enjoyable, ShopMe has grown to become 
          a trusted platform for customers worldwide. We believe in providing high-quality products at competitive 
          prices while maintaining the highest standards of customer service.
        </p>
        
        <h2 className='text-2xl font-semibold mb-4'>Our Mission</h2>
        <p className='mb-6'>
          To deliver an exceptional shopping experience by offering a carefully curated selection of products, 
          ensuring fast and reliable delivery, and providing outstanding customer support at every step of your journey.
        </p>
        
        <h2 className='text-2xl font-semibold mb-4'>Why Choose ShopMe?</h2>
        <ul className='list-disc pl-6 mb-6 space-y-2'>
          <li>Wide selection of high-quality products</li>
          <li>Competitive pricing and regular deals</li>
          <li>Fast and reliable shipping</li>
          <li>Secure payment processing</li>
          <li>24/7 customer support</li>
          <li>Easy returns and exchanges</li>
        </ul>
        
        <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
        <p className='mb-4'>
          Have questions or need assistance? We&apos;re here to help!
        </p>
        <div className='bg-gray-50 p-6 rounded-lg'>
          <p><strong>Email:</strong> support@shopme.com</p>
          <p><strong>Phone:</strong> 1-800-SHOPME (1-800-746-7633)</p>
          <p><strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
        </div>
      </div>
    </div>
  )
} 
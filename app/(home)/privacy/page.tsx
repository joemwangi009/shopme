export default function PrivacyPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>Privacy Policy</h1>
      
      <div className='prose prose-gray max-w-none space-y-6'>
        <p className='text-sm text-gray-500 mb-8'>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Information We Collect</h2>
          <p className='mb-4'>
            We collect information you provide directly to us, such as when you create an account, 
            make a purchase, or contact us for support.
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Personal information (name, email, phone number)</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>How We Use Your Information</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Process and fulfill your orders</li>
            <li>Provide customer support</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and services</li>
            <li>Send promotional emails (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Information Sharing</h2>
          <p className='mb-4'>
            We do not sell, trade, or rent your personal information to third parties. We may share 
            your information only in the following circumstances:
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>With service providers who help us operate our business</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Data Security</h2>
          <p className='mb-4'>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Your Rights</h2>
          <p className='mb-4'>You have the right to:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and information</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href='mailto:privacy@shopme.com' className='text-blue-600 hover:underline'>
              privacy@shopme.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
} 
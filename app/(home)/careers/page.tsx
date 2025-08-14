export default function CareersPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>Careers at ShopMe</h1>
      
      <div className='prose prose-gray max-w-none'>
        <p className='text-lg text-gray-600 mb-8'>
          Join our team and help us build the future of e-commerce. We're always looking for talented, 
          passionate people to grow with us.
        </p>

        <div className='text-center py-16 bg-gray-50 rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>🚀 No Open Positions Currently</h2>
          <p className='text-gray-600 mb-6'>
            We don't have any open positions at the moment, but we're always growing! 
            Check back soon or send us your resume.
          </p>
          <div className='space-y-2'>
            <p className='text-sm text-gray-500'>
              Send your resume to: <a href='mailto:careers@shopme.com' className='text-blue-600 hover:underline'>careers@shopme.com</a>
            </p>
            <p className='text-sm text-gray-500'>
              Follow us on social media for job updates
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
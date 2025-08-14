export default function ReturnsPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>Returns & Exchanges</h1>
      
      <div className='prose prose-gray max-w-none space-y-8'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>Our Return Policy</h2>
          <p className='mb-4'>
            We want you to be completely satisfied with your purchase. If you're not happy with your order, 
            you can return most items within 30 days of delivery for a full refund.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Return Requirements</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Items must be returned within 30 days of delivery</li>
            <li>Items must be in original condition with tags attached</li>
            <li>Items must be in original packaging</li>
            <li>Return authorization required (contact customer service)</li>
            <li>Customer is responsible for return shipping costs</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>How to Return an Item</h2>
          <ol className='list-decimal pl-6 space-y-2'>
            <li>Contact customer service at support@shopme.com or 1-800-SHOPME</li>
            <li>Provide your order number and reason for return</li>
            <li>Receive return authorization and shipping instructions</li>
            <li>Package item securely with original packaging</li>
            <li>Ship using provided return label or your preferred carrier</li>
            <li>Refund will be processed within 5-7 business days after we receive your return</li>
          </ol>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Exchanges</h2>
          <p className='mb-4'>
            We currently don't offer direct exchanges. To exchange an item, please return the original 
            item for a refund and place a new order for the item you want.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Non-Returnable Items</h2>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Personal care items</li>
            <li>Items marked as final sale</li>
            <li>Gift cards</li>
            <li>Digital products</li>
            <li>Items damaged by misuse</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>Refund Processing</h2>
          <p className='mb-4'>
            Refunds will be issued to the original payment method within 5-7 business days after we 
            receive and process your return. You'll receive an email confirmation when your refund 
            has been processed.
          </p>
        </section>
      </div>
    </div>
  )
} 
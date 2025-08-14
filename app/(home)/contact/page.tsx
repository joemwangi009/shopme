import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Contact Us</h1>
        <p className='text-gray-600'>
          Get in touch with our team. We&apos;re here to help with any questions or concerns.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label htmlFor='firstName' className='text-sm font-medium'>
                  First Name
                </label>
                <Input id='firstName' placeholder='John' />
              </div>
              <div className='space-y-2'>
                <label htmlFor='lastName' className='text-sm font-medium'>
                  Last Name
                </label>
                <Input id='lastName' placeholder='Doe' />
              </div>
            </div>
            
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium'>
                Email
              </label>
              <Input id='email' type='email' placeholder='john@example.com' />
            </div>
            
            <div className='space-y-2'>
              <label htmlFor='subject' className='text-sm font-medium'>
                Subject
              </label>
              <Input id='subject' placeholder='How can we help?' />
            </div>
            
            <div className='space-y-2'>
              <label htmlFor='message' className='text-sm font-medium'>
                Message
              </label>
              <Textarea 
                id='message' 
                placeholder='Tell us more about your inquiry...' 
                rows={6}
              />
            </div>
            
            <Button className='w-full'>Send Message</Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Get in touch</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <Mail className='h-5 w-5 mt-1 text-blue-600' />
                <div>
                  <p className='font-medium'>Email</p>
                  <p className='text-gray-600'>support@shopme.com</p>
                </div>
              </div>
              
              <div className='flex items-start space-x-3'>
                <Phone className='h-5 w-5 mt-1 text-blue-600' />
                <div>
                  <p className='font-medium'>Phone</p>
                  <p className='text-gray-600'>1-800-SHOPME (1-800-746-7633)</p>
                </div>
              </div>
              
              <div className='flex items-start space-x-3'>
                <MapPin className='h-5 w-5 mt-1 text-blue-600' />
                <div>
                  <p className='font-medium'>Address</p>
                  <p className='text-gray-600'>
                    123 Commerce Street<br />
                    Business District<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
              
              <div className='flex items-start space-x-3'>
                <Clock className='h-5 w-5 mt-1 text-blue-600' />
                <div>
                  <p className='font-medium'>Business Hours</p>
                  <p className='text-gray-600'>
                    Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                    Saturday: 10:00 AM - 4:00 PM EST<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='font-medium mb-1'>How can I track my order?</p>
                  <p className='text-sm text-gray-600'>
                    You can track your order by logging into your account and viewing your order history.
                  </p>
                </div>
                <div>
                  <p className='font-medium mb-1'>What is your return policy?</p>
                  <p className='text-sm text-gray-600'>
                    We offer a 30-day return policy for most items. Please check our returns page for details.
                  </p>
                </div>
                <div>
                  <p className='font-medium mb-1'>Do you ship internationally?</p>
                  <p className='text-sm text-gray-600'>
                    Currently, we ship within the United States. International shipping coming soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
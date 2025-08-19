import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Link } from '@heroui/link';
import { FiPhone, FiMail, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import { FaInstagram, FaFacebook } from 'react-icons/fa';

import { siteConfig } from '@/config/site';
import { PageHeader, ContactInfoCard } from '@/components/ui';

export default function ContactPage() {
  const contactItems = [
    {
      icon: <FiPhone className='w-5 h-5 text-green-600' />,
      title: 'Phone',
      lines: ['+1 (800) LODGEFLOW', '+1 (800) 563-4335'],
      subtitle: 'Daily: 8:00 AM - 10:00 PM'
    },
    {
      icon: <FiMail className='w-5 h-5 text-green-600' />,
      title: 'Email',
      lines: ['hello@lodgeflow.com', 'reservations@lodgeflow.com'],
      subtitle: 'We respond within 2 hours'
    },
    {
      icon: <FiMapPin className='w-5 h-5 text-green-600' />,
      title: 'Location',
      lines: ['LodgeFlow Resort', '1000 Wilderness Drive', 'Pine Valley, MT 59718']
    }
  ];

  return (
    <div className='space-y-8 py-8'>
      {/* Header */}
      <PageHeader 
        title="Contact"
        titleAccent="Us"
        subtitle="We're here to help you plan the perfect escape to LodgeFlow. Get in touch with our team for any questions or assistance."
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Contact Information */}
        <div className='space-y-8'>
          <ContactInfoCard 
            title="Get in Touch"
            items={contactItems}
          >
            <div className='pt-4 border-t'>
              <h4 className='font-semibold mb-3'>Follow Us</h4>
              <div className='flex gap-4'>
                <Button
                  as={Link}
                  href={siteConfig.links.instagram}
                  isExternal
                  size='sm'
                  variant='flat'
                  startContent={<FaInstagram className='w-4 h-4' />}>
                  Instagram
                </Button>
                <Button
                  as={Link}
                  href={siteConfig.links.facebook}
                  isExternal
                  size='sm'
                  variant='flat'
                  startContent={<FaFacebook className='w-4 h-4' />}>
                  Facebook
                </Button>
              </div>
            </div>
          </ContactInfoCard>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardBody>
              <h3 className="text-xl font-bold">Send us a Message</h3>
              <p className="text-default-600 mt-2 mb-6">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <form className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    label='First Name'
                    placeholder='Enter your first name'
                    isRequired
                  />
                  <Input
                    label='Last Name'
                    placeholder='Enter your last name'
                    isRequired
                  />
                </div>

                <Input
                  label='Email'
                  type='email'
                  placeholder='Enter your email'
                  isRequired
                />

                <Input
                  label='Phone'
                  type='tel'
                  placeholder='Enter your phone number'
                />

                <Input
                  label='Subject'
                  placeholder='What is this regarding?'
                  isRequired
                />

                <Textarea
                  label='Message'
                  placeholder='Tell us how we can help you...'
                  minRows={4}
                  isRequired
                />

                <Button
                  type='submit'
                  color='primary'
                  size='lg'
                  className='w-full'>
                  Send Message
                </Button>

                <p className='text-xs text-default-500 text-center'>
                  We'll respond to your message within 2 hours during business
                  hours.
                </p>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Emergency Contact */}
      <section className='bg-orange-50 dark:bg-orange-950 rounded-2xl p-8 text-center'>
        <h3 className="text-xl font-bold">Emergency Contact</h3>
        <p className="text-default-600 mt-2 mb-6">
          For guests currently staying with us who need immediate assistance
        </p>
        <Button
          as={Link}
          href='tel:+1-800-911-FLOW'
          color='warning'
          size='lg'
          startContent={<FiAlertTriangle className='w-5 h-5' />}>
          Emergency: +1 (800) 911-FLOW
        </Button>
      </section>
    </div>
  );
}

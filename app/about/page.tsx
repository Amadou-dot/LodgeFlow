import { Button } from '@heroui/button';
import { Link } from '@heroui/link';

import { siteConfig } from '@/config/site';
import {
  PageHeader,
  SectionHeader,
  StatsGrid,
  ValuesGrid,
  TeamGrid,
  CallToActionSection,
} from '@/components/ui';

export default function AboutPage() {
  const stats = [
    { label: 'Years of Excellence', value: '15+' },
    { label: 'Happy Guests', value: '10,000+' },
    { label: 'Pristine Acres', value: '500+' },
    { label: 'Luxury Cabins', value: '12' },
  ];

  const values = [
    {
      title: 'Sustainability',
      description:
        "We're committed to preserving the natural beauty that surrounds us through eco-friendly practices and conservation efforts.",
      icon: '🌱',
    },
    {
      title: 'Luxury & Comfort',
      description:
        'Every detail is carefully curated to provide you with the ultimate comfort while maintaining harmony with nature.',
      icon: '✨',
    },
    {
      title: 'Authentic Experiences',
      description:
        'From guided nature walks to stargazing sessions, we offer genuine connections with the wilderness.',
      icon: '🏔️',
    },
    {
      title: 'Personalized Service',
      description:
        'Our dedicated team ensures every guest receives personalized attention and creates memories that last a lifetime.',
      icon: '🤝',
    },
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CEO',
      bio: 'A passionate advocate for sustainable tourism, Sarah leads LodgeFlow with a vision to harmonize luxury and nature.',
      image: '/images/team/sarah.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'Co-Founder & COO',
      bio: "With a background in environmental science, Michael oversees the resort's operations, ensuring eco-friendly practices are upheld.",
      image: '/images/team/michael.jpg',
    },
    {
      name: 'Emily Johnson',
      role: 'Guest Experience Manager',
      bio: 'Emily is dedicated to creating unforgettable experiences for our guests, from personalized itineraries to on-site activities.',
      image: '/images/team/emily.jpg',
    },
    {
      name: 'David Lee',
      role: 'Head Chef',
      bio: "David crafts seasonal menus that highlight local ingredients, providing a true taste of the region's culinary heritage.",
      image: '/images/team/david.jpg',
    },
    {
      name: 'Sophia Patel',
      role: 'Marketing Director',
      bio: 'Sophia brings a wealth of experience in luxury branding and marketing, ensuring LodgeFlow reaches those who seek its unique offerings.',
      image: '/images/team/sophia.jpg',
    },
    {
      name: 'James Smith',
      role: 'Operations Manager',
      bio: "James ensures the smooth running of the resort's daily operations, focusing on guest satisfaction and staff coordination.",
      image: '/images/team/james.jpg',
    },
  ];

  return (
    <div className='space-y-16 py-8'>
      {/* Hero Section */}
      <PageHeader
        subtitle="Nestled in the heart of pristine wilderness, LodgeFlow has been a sanctuary for those seeking to reconnect with nature's tranquility since 2009."
        title='About'
        titleAccent='LodgeFlow'
      />

      {/* Story Section */}
      <section className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        <div>
          <SectionHeader centered={false} className='mb-6' title='Our Story' />
          <div className='space-y-4 text-default-600'>
            <p>
              What began as a dream to create a perfect escape from the modern
              world has evolved into a premier destination that honors both
              luxury and nature's raw beauty.
            </p>
            <p>
              Founded by environmental enthusiasts Sarah and Michael Chen,
              LodgeFlow was born from their vision of sustainable luxury
              tourism. After years of traveling the world, they discovered this
              untouched valley and knew they had found something special.
            </p>
            <p>
              Today, our resort spans over 500 acres of protected wilderness,
              featuring 12 thoughtfully designed cabins that blend seamlessly
              into the natural landscape. Each structure was built using
              sustainable materials and powered by renewable energy.
            </p>
          </div>
          <Button
            as={Link}
            className='mt-6'
            color='primary'
            href='/cabins'
            size='lg'
          >
            Explore Our Cabins
          </Button>
        </div>
        <div className='relative'>
          <div className='w-full h-96 bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 rounded-2xl flex items-center justify-center'>
            <span className='text-green-700 dark:text-green-300 text-lg font-medium'>
              LodgeFlow Story
            </span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-green-50 dark:bg-green-950 rounded-2xl p-8'>
        <StatsGrid stats={stats} />
      </section>

      {/* Values Section */}
      <section>
        <SectionHeader
          className='mb-12'
          subtitle='The principles that guide everything we do at LodgeFlow'
          title='Our Values'
        />
        <ValuesGrid values={values} />
      </section>

      {/* Team Section */}
      <section>
        <SectionHeader
          className='mb-12'
          subtitle='The passionate people who make your LodgeFlow experience unforgettable'
          title='Meet Our Team'
        />
        <TeamGrid maxDisplay={6} members={team} />
      </section>

      {/* Call to Action */}
      <CallToActionSection
        subtitle='Join thousands of guests who have discovered their perfect escape in nature'
        title='Ready to Experience LodgeFlow?'
        buttons={[
          {
            label: 'Book Your Stay',
            href: '/cabins',
            color: 'primary',
          },
          {
            label: 'Contact Us',
            href: siteConfig.links.email,
            variant: 'bordered',
          },
        ]}
      />
    </div>
  );
}

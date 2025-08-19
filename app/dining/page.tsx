import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Link } from '@heroui/link';

import { subtitle, title } from '@/components/primitives';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import Image from 'next/image';

export default function DiningPage() {
  const menuCategories = [
    {
      name: 'Farm-to-Table Breakfast',
      time: '6:30 AM - 10:00 AM',
      description:
        'Start your day with fresh, locally sourced ingredients prepared to perfection.',
      dishes: [
        {
          name: 'Wild Berry Pancakes',
          price: 18,
          description: 'Fluffy pancakes with foraged berries and maple syrup',
        },
        {
          name: 'Mountain Scramble',
          price: 22,
          description: 'Farm-fresh eggs with wild mushrooms and herbs',
        },
        {
          name: 'Smoked Trout Benedict',
          price: 26,
          description: 'House-smoked trout on artisan bread with hollandaise',
        },
      ],
    },
    {
      name: 'Artisan Lunch',
      time: '12:00 PM - 3:00 PM',
      description:
        'Light, fresh meals perfect for fueling your outdoor adventures.',
      dishes: [
        {
          name: 'Forest Forager Salad',
          price: 24,
          description: 'Seasonal greens with foraged mushrooms and nuts',
        },
        {
          name: 'Grilled Rainbow Trout',
          price: 28,
          description: 'Locally caught trout with seasonal vegetables',
        },
        {
          name: 'Wild Game Burger',
          price: 26,
          description: 'Sustainable venison with caramelized onions',
        },
      ],
    },
    {
      name: 'Gourmet Dinner',
      time: '6:00 PM - 9:00 PM',
      description:
        'Elevated dining experiences showcasing the best of regional cuisine.',
      dishes: [
        {
          name: 'Elk Tenderloin',
          price: 48,
          description: 'Tender elk with juniper reduction and root vegetables',
        },
        {
          name: 'Cedar Plank Salmon',
          price: 42,
          description: 'Wild-caught salmon with indigenous seasonings',
        },
        {
          name: 'Seasonal Tasting Menu',
          price: 85,
          description:
            "Chef's selection of 5 courses featuring local ingredients",
        },
      ],
    },
  ];

  const specialExperiences = [
    {
      name: "Chef's Table Experience",
      price: 125,
      duration: '3 hours',
      description:
        'Intimate dining with our executive chef, featuring a custom menu and wine pairings.',
      includes: [
        '7-course tasting menu',
        'Wine pairings',
        'Kitchen tour',
        'Recipe cards',
      ],
      maxGuests: 8,
    },
    {
      name: 'Wilderness Picnic',
      price: 75,
      duration: '4 hours',
      description:
        'Gourmet picnic basket delivered to your favorite scenic spot on the property.',
      includes: [
        'Gourmet basket',
        'Blanket & setup',
        'Location guide',
        'Clean-up service',
      ],
      maxGuests: 6,
    },
    {
      name: 'Campfire Cooking Class',
      price: 95,
      duration: '3 hours',
      description:
        'Learn traditional outdoor cooking techniques with our wilderness chef.',
      includes: [
        'Hands-on instruction',
        'All ingredients',
        'Recipe book',
        'Full meal',
      ],
      maxGuests: 12,
    },
  ];

  const beverages = [
    {
      category: 'Local Craft Beer',
      items: ['LodgeFlow IPA', 'Mountain Mist Lager', 'Seasonal Ales'],
    },
    {
      category: 'Regional Wines',
      items: ['Valley Pinot Noir', 'Mountain Chardonnay', 'Wildflower Rosé'],
    },
    {
      category: 'Artisan Spirits',
      items: ['Locally Distilled Whiskey', 'Herbal Gin', 'Berry Liqueurs'],
    },
    {
      category: 'Non-Alcoholic',
      items: ['Fresh Pressed Juices', 'Herbal Teas', 'Mountain Spring Water'],
    },
  ];

  return (
    <div className='space-y-12 py-8'>
      {/* Header Section */}
      <section className='text-center'>
        <h1 className={title({ size: 'lg' })}>
          Culinary{' '}
          <span className={title({ color: 'green', size: 'lg' })}>
            Excellence
          </span>
        </h1>
        <p className={subtitle({ class: 'mt-4 max-w-3xl mx-auto' })}>
          Experience farm-to-table dining at its finest. Our culinary team
          transforms locally sourced, seasonal ingredients into unforgettable
          meals that celebrate the flavors of our region.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className='bg-green-50 dark:bg-green-950 rounded-2xl p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
          <div>
            <h2 className={title({ size: 'md' })}>Our Culinary Philosophy</h2>
            <div className='space-y-4 mt-6 text-default-600'>
              <p>
                At LodgeFlow, we believe great food connects us to the land
                and each other. Our executive chef works with local farmers,
                foragers, and artisans to create menus that change with the
                seasons.
              </p>
              <p>
                Every ingredient tells a story - from the wild mushrooms
                gathered in our own forests to the organic vegetables grown in
                nearby farms. We're committed to sustainable practices that
                honor both our guests and our environment.
              </p>
            </div>
            <div className='flex flex-wrap gap-2 mt-6'>
              <Chip color='success' variant='flat'>
                Locally Sourced
              </Chip>
              <Chip color='success' variant='flat'>
                Organic
              </Chip>
              <Chip color='success' variant='flat'>
                Sustainable
              </Chip>
              <Chip color='success' variant='flat'>
                Seasonal Menu
              </Chip>
            </div>
          </div>
          <div className='relative h-64 lg:h-80'>
            <Image
              src='https://images.unsplash.com/photo-1684954215462-cad9f3693b41?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              alt='Dining Philosophy'
              fill
              style={{ objectFit: 'cover' }}
              className='rounded-2xl'
            />
          </div>
        </div>
      </section>

      {/* Daily Menus */}
      <section>
        <div className='text-center mb-8'>
          <h2 className={title({ size: 'md' })}>Daily Dining</h2>
          <p className={subtitle({ class: 'mt-4' })}>
            Seasonal menus that showcase the best of local ingredients
          </p>
        </div>

        <div className='space-y-8'>
          {menuCategories.map((category, index) => (
            <Card key={index} className='py-6'>
              <CardHeader className='pb-0 pt-2 px-6'>
                <div className='flex justify-between items-center w-full'>
                  <div>
                    <h3 className='text-xl font-bold'>{category.name}</h3>
                    <Chip
                      color='primary'
                      variant='flat'
                      size='sm'
                      className='mt-2'>
                      {category.time}
                    </Chip>
                  </div>
                </div>
                <p className='text-default-600 mt-3'>{category.description}</p>
              </CardHeader>
              <CardBody className='px-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {category.dishes.map((dish, dishIndex) => (
                    <div
                      key={dishIndex}
                      className='border border-default-200 rounded-lg p-4'>
                      <div className='flex justify-between items-start mb-2'>
                        <h4 className='font-semibold'>{dish.name}</h4>
                        <span className='text-green-600 font-bold'>
                          ${dish.price}
                        </span>
                      </div>
                      <p className='text-sm text-default-500'>
                        {dish.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Special Dining Experiences */}
      <section>
        <div className='text-center mb-8'>
          <h2 className={title({ size: 'md' })}>Special Dining Experiences</h2>
          <p className={subtitle({ class: 'mt-4' })}>
            Unique culinary adventures beyond our regular dining service
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {specialExperiences.map((experience, index) => (
            <Card key={index} className='py-4'>
              <CardHeader className='pb-0 pt-2 px-4 flex-col items-start'>
                <h4 className='font-bold text-large'>{experience.name}</h4>
                <div className='flex items-center gap-2 text-small text-default-500 mt-1'>
                  <span>⏱️ {experience.duration}</span>
                  <span>•</span>
                  <span>👥 Max {experience.maxGuests}</span>
                </div>
                <div className='mt-2'>
                  <span className='text-2xl font-bold text-green-600'>
                    ${experience.price}
                  </span>
                  <span className='text-sm text-default-500'>/person</span>
                </div>
              </CardHeader>
              <CardBody className='overflow-visible py-2'>
                <div className='relative mb-4'>
                  <div className='w-full h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-lg flex items-center justify-center'>
                    <span className='text-amber-700 dark:text-amber-300 text-sm font-medium text-center px-4'>
                      {experience.name}
                    </span>
                  </div>
                </div>

                <p className='text-default-500 mb-3 text-sm'>
                  {experience.description}
                </p>

                <div className='mb-4'>
                  <h5 className='text-sm font-semibold mb-2'>Includes:</h5>
                  <div className='space-y-1'>
                    {experience.includes.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className='flex items-center gap-2 text-sm'>
                        <span className='text-green-500'>✓</span>
                        <span className='text-default-600'>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button color='primary' size='sm' className='w-full'>
                  Reserve Experience
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Beverages Section */}
      <section className='bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-2xl p-8'>
        <div className='text-center mb-8'>
          <h2 className={title({ size: 'md' })}>Curated Beverages</h2>
          <p className={subtitle({ class: 'mt-4' })}>
            Local wines, craft beers, artisan spirits, and non-alcoholic options
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {beverages.map((category, index) => (
            <div
              key={index}
              className='bg-white dark:bg-default-100 rounded-lg p-4'>
              <h4 className='font-bold text-center mb-3'>
                {category.category}
              </h4>
              <ul className='space-y-2'>
                {category.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className='text-sm text-default-600 text-center'>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Reservations CTA */}
      <section className='text-center'>
        <h3 className={title({ size: 'sm' })}>Ready to Dine With Us?</h3>
        <p className={subtitle({ class: 'mt-2 mb-6' })}>
          Reservations are recommended, especially for dinner and special
          experiences
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            as={Link}
            href='tel:+1-800-LODGEFLOW'
            color='primary'
            size='lg'
            startContent={<FaPhone className='w-4 h-4' />}>
            Make Reservation
          </Button>
          <Button
            as={Link}
            href='mailto:dining@lodgeflow.com'
            variant='bordered'
            size='lg'
            startContent={<FaEnvelope className='w-4 h-4' />}>
            Special Requests
          </Button>
        </div>
      </section>
    </div>
  );
}

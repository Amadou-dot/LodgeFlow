import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { FiPhone } from "react-icons/fi";
import { FaEnvelope } from "react-icons/fa";

import { 
  PageHeader, 
  SectionHeader, 
  PricingGrid, 
  CallToActionSection 
} from "@/components/ui";

export default function ExperiencesPage() {
  const experiences = [
    {
      name: "Guided Nature Walks",
      price: 45,
      duration: "2-3 hours",
      difficulty: "Easy",
      category: "Nature",
      description: "Discover the local flora and fauna with our expert naturalist guides. Learn about the ecosystem and spot wildlife in their natural habitat.",
      includes: ["Expert guide", "Binoculars", "Field notebook", "Light refreshments"],
      available: ["Daily", "Morning & Afternoon"],
      ctaText: "Book Walk",
      ctaHref: "/contact"
    },
    {
      name: "Lake Kayaking Adventure",
      price: 85,
      duration: "Half day",
      difficulty: "Moderate",
      category: "Water Sports",
      description: "Paddle through crystal-clear waters surrounded by pristine wilderness. Perfect for beginners and experienced kayakers alike.",
      includes: ["Kayak & equipment", "Safety briefing", "Waterproof bag", "Snacks"],
      available: ["Daily", "Weather dependent"],
      ctaText: "Book Adventure",
      ctaHref: "/contact",
      isPopular: true
    },
    {
      name: "Mountain Hiking Expedition",
      price: 120,
      duration: "Full day",
      difficulty: "Challenging",
      category: "Adventure",
      description: "Challenge yourself with a guided hike to our highest peak. Breathtaking views and a true wilderness experience await.",
      includes: ["Professional guide", "Trail lunch", "Hiking poles", "First aid support"],
      available: ["Weekends", "Good weather only"],
      ctaText: "Book Expedition",
      ctaHref: "/contact"
    },
    {
      name: "Stargazing Sessions",
      price: 35,
      duration: "2 hours",
      difficulty: "Easy",
      category: "Astronomy",
      description: "Experience the magic of dark skies with our astronomy expert. Learn about constellations and observe celestial wonders.",
      includes: ["Telescope access", "Star charts", "Hot chocolate", "Blankets"],
      available: ["Clear nights", "Year-round"],
      ctaText: "Book Session",
      ctaHref: "/contact"
    },
    {
      name: "Fishing Expeditions",
      price: 95,
      duration: "4-6 hours",
      difficulty: "Easy",
      category: "Fishing",
      description: "Try your hand at catch-and-release fishing in our pristine mountain streams and lake. Equipment and instruction provided.",
      includes: ["Fishing gear", "Permits", "Guide", "Catch cleaning"],
      available: ["Daily", "Season dependent"],
      ctaText: "Book Fishing",
      ctaHref: "/contact"
    },
    {
      name: "Photography Workshops",
      price: 75,
      duration: "Half day",
      difficulty: "Easy",
      category: "Creative",
      description: "Capture the beauty of nature with guidance from a professional photographer. Learn techniques for landscape and wildlife photography.",
      includes: ["Professional instruction", "Location guidance", "Basic equipment", "Digital tips"],
      available: ["Weekends", "Golden hour sessions"],
      ctaText: "Book Workshop",
      ctaHref: "/contact"
    },
    {
      name: "Wellness & Meditation",
      price: 55,
      duration: "2 hours",
      difficulty: "Easy",
      category: "Wellness",
      description: "Find inner peace in nature's embrace. Guided meditation sessions in serene outdoor settings to rejuvenate your mind and spirit.",
      includes: ["Meditation guide", "Yoga mats", "Breathing exercises", "Herbal tea"],
      available: ["Daily", "Morning & Evening"],
      ctaText: "Book Session",
      ctaHref: "/contact"
    },
    {
      name: "Foraging & Wild Cooking",
      price: 110,
      duration: "4 hours",
      difficulty: "Moderate",
      category: "Culinary",
      description: "Learn to identify edible plants and fungi, then prepare a meal using foraged ingredients with our expert chef.",
      includes: ["Foraging guide", "Cooking instruction", "All ingredients", "Full meal"],
      available: ["Weekends", "Seasonal"],
      ctaText: "Book Experience",
      ctaHref: "/contact"
    }
  ];

  const categories = [
    { name: "All Experiences", count: experiences.length },
    { name: "Nature", count: experiences.filter(e => e.category === "Nature").length },
    { name: "Adventure", count: experiences.filter(e => e.category === "Adventure").length },
    { name: "Water Sports", count: experiences.filter(e => e.category === "Water Sports").length },
    { name: "Wellness", count: experiences.filter(e => e.category === "Wellness").length },
    { name: "Creative", count: experiences.filter(e => e.category === "Creative").length },
  ];

  return (
    <div className="space-y-12 py-8">
      {/* Header Section */}
      <PageHeader 
        title="Wild"
        titleAccent="Experiences"
        subtitle="Immerse yourself in nature with our carefully curated adventures and activities. From peaceful meditation sessions to thrilling mountain expeditions, discover the perfect way to connect with the wilderness."
      />

      {/* Categories Overview */}
      <section className="bg-green-50 dark:bg-green-950 rounded-2xl p-8">
        <SectionHeader 
          title="Experience Categories"
          subtitle="Choose from our diverse range of outdoor activities"
          className="mb-8"
        />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{category.count}</div>
              <div className="text-sm text-default-600">{category.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiences Grid */}
      <section>
        <SectionHeader 
          title="Available Experiences"
          subtitle="Book your next adventure and create unforgettable memories"
          className="mb-12"
        />
        
        <PricingGrid 
          items={experiences}
          columns={3}
        />
      </section>

      {/* Booking Information */}
      <section className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-8">
        <SectionHeader 
          title="Booking Information"
          className="mb-8"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">🎯 Easy Booking</h4>
            <p className="text-sm text-default-600">Reserve your spot with just a few clicks. All experiences can be booked online or by phone.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">📅 Flexible Scheduling</h4>
            <p className="text-sm text-default-600">Most experiences are available daily with flexible timing to fit your itinerary.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">👨‍🏫 Expert Guides</h4>
            <p className="text-sm text-default-600">All activities are led by certified professionals with extensive local knowledge.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">🎒 Equipment Included</h4>
            <p className="text-sm text-default-600">We provide all necessary equipment and safety gear for your adventures.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">🌤️ Weather Policy</h4>
            <p className="text-sm text-default-600">Full refund or rescheduling available for weather-related cancellations.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">👥 Group Discounts</h4>
            <p className="text-sm text-default-600">Special rates available for groups of 4 or more. Contact us for pricing.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CallToActionSection 
        title="Ready for Your Next Adventure?"
        subtitle="Contact our adventure specialists to plan the perfect wilderness experience tailored to your interests and skill level."
        buttons={[
          {
            label: "Contact Us",
            href: "/contact",
            color: "primary",
            startContent: <FaEnvelope className="w-4 h-4" />
          },
          {
            label: "Call Now",
            href: "tel:+1-800-LODGEFLOW",
            variant: "bordered",
            startContent: <FiPhone className="w-4 h-4" />
          }
        ]}
      />
    </div>
  );
}

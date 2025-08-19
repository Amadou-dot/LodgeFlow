import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { FiPhone, FiMail } from "react-icons/fi";

import { siteConfig } from "@/config/site";
import { connectDB, Cabin } from "@/models";
import { 
  HeroSection, 
  SectionHeader, 
  FeatureGrid, 
  CallToActionSection 
} from "@/components/ui";

async function getFeaturedCabins() {
  try {
    await connectDB();
    const cabins = await Cabin.find({}).limit(3).sort({ price: 1 });
    return cabins;
  } catch (error) {
    console.error('Error fetching featured cabins:', error);
    return [];
  }
}

export default async function Home() {
  const featuredCabins = await getFeaturedCabins();

  const features = [
    {
      title: "Luxury Cabins",
      description: "Premium accommodations nestled in pristine wilderness",
      imagePlaceholder: "Luxury Cabins Image"
    },
    {
      title: "Fine Dining",
      description: "Gourmet cuisine crafted with local, organic ingredients",
      imagePlaceholder: "Fine Dining Image"
    },
    {
      title: "Nature Activities",
      description: "Hiking, fishing, wildlife watching, and more adventures",
      imagePlaceholder: "Nature Activities Image"
    }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <HeroSection 
        title="Welcome to"
        titleAccent="The Wild Oasis"
        subtitle="Escape to paradise. Experience luxury in the heart of untouched nature, where comfort meets wilderness in perfect harmony."
        buttons={[
          {
            label: "Explore Cabins",
            href: "/cabins",
            color: "primary"
          },
          {
            label: "Learn More",
            href: "/about",
            variant: "bordered"
          }
        ]}
      />

      {/* Features Section */}
      <section className="container mx-auto px-6">
        <SectionHeader 
          title="Experience Nature's Luxury"
          subtitle="Discover what makes The Wild Oasis the perfect retreat"
          className="mb-12"
        />
        <FeatureGrid features={features} />
      </section>

      {/* Featured Cabins Section */}
      <section className="container mx-auto px-6">
        <SectionHeader 
          title="Featured Cabins"
          subtitle="Discover our most popular accommodations"
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCabins.map((cabin: any) => {
            const effectivePrice = cabin.price - (cabin.discount || 0);
            const hasDiscount = cabin.discount > 0;
            
            return (
              <Card key={cabin._id} className="py-4 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                  <div className="flex justify-between items-start w-full mb-2">
                    <h4 className="font-bold text-large">{cabin.name}</h4>
                    {hasDiscount && (
                      <Chip color="danger" variant="flat" size="sm">
                        Save ${cabin.discount}
                      </Chip>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-small text-default-500">
                    <span>👥 Up to {cabin.capacity} guests</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {hasDiscount && (
                        <span className="line-through text-default-400">${cabin.price}</span>
                      )}
                      <span className="font-semibold text-green-600">
                        ${effectivePrice}/night
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                  <div className="relative mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-300 text-sm">
                        {cabin.name} Image
                      </span>
                    </div>
                  </div>
                  <p className="text-default-500 text-small mb-4">{cabin.description}</p>
                  <Button
                    as={Link}
                    href={`/cabins/${cabin._id}`}
                    color="primary"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <CallToActionSection 
        title="Ready for Your Escape?"
        subtitle="Book your perfect getaway at The Wild Oasis today and create memories that will last a lifetime."
        buttons={[
          {
            label: "Browse All Cabins",
            href: "/cabins",
            color: "primary"
          },
          {
            label: "View Experiences",
            href: "/experiences",
            variant: "bordered"
          }
        ]}
      />

      {/* Contact Section */}
      <section className="bg-green-50 dark:bg-green-950 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold">Need Help Planning?</h3>
        <p className="text-default-600 mt-2 mb-6">
          Our team is here to help you create the perfect wilderness getaway
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            href="tel:+1-800-WILD-OASIS"
            color="primary"
            startContent={<FiPhone className="w-4 h-4" />}
          >
            Call Us
          </Button>
          <Button
            as={Link}
            href={siteConfig.links.email}
            variant="bordered"
            startContent={<FiMail className="w-4 h-4" />}
          >
            Email Us
          </Button>
        </div>
      </section>
    </div>
  );
}

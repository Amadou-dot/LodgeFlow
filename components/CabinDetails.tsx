'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import {
  Wifi,
  Utensils,
  Car,
  Tv,
  Wind,
  Coffee,
  Waves,
  Flame,
  Dog,
  Dumbbell,
  Mountain,
  Trees,
  Refrigerator,
  WashingMachine,
  Bath,
  Bed,
  Users,
  MapPin,
} from 'lucide-react';

interface Cabin {
  _id: string;
  name: string;
  price: number;
  capacity: number;
  image: string;
  discount: number;
  description: string;
  amenities: string[];
}

interface CabinDetailsProps {
  cabin: Cabin;
}

// Map amenities to icons
const amenityIconMap: Record<string, any> = {
  WiFi: Wifi,
  'Wi-Fi': Wifi,
  Kitchen: Utensils,
  Parking: Car,
  TV: Tv,
  Television: Tv,
  'Air Conditioning': Wind,
  AC: Wind,
  'Coffee Maker': Coffee,
  'Hot Tub': Waves,
  Fireplace: Flame,
  'Pet Friendly': Dog,
  Pets: Dog,
  Gym: Dumbbell,
  Fitness: Dumbbell,
  'Mountain View': Mountain,
  View: Mountain,
  'Forest View': Trees,
  Nature: Trees,
  Refrigerator: Refrigerator,
  Fridge: Refrigerator,
  Washer: WashingMachine,
  'Washing Machine': WashingMachine,
  Bathroom: Bath,
  'Private Bathroom': Bath,
  Bedroom: Bed,
  'Extra Beds': Bed,
  Workspace: Users,
  'Work Area': Users,
  Location: MapPin,
  Hiking: Mountain,
};

function getAmenityIcon(amenity: string) {
  // Try exact match first
  if (amenityIconMap[amenity]) {
    return amenityIconMap[amenity];
  }
  
  // Try case-insensitive partial match
  const normalizedAmenity = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(amenityIconMap)) {
    if (normalizedAmenity.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedAmenity)) {
      return icon;
    }
  }
  
  return null;
}

export default function CabinDetails({ cabin }: CabinDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Description Section */}
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold">About this cabin</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-default-700 text-base leading-relaxed">
            {cabin.description}
          </p>
        </CardBody>
      </Card>

      {/* Amenities Section */}
      {cabin.amenities && cabin.amenities.length > 0 && (
        <Card className="w-full">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col w-full">
              <h2 className="text-2xl font-bold">Amenities</h2>
              <p className="text-small text-default-500">
                Everything you need for a comfortable stay
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cabin.amenities.map((amenity, index) => {
                const Icon = getAmenityIcon(amenity);
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-default-100 transition-colors"
                  >
                    {Icon ? (
                      <Icon className="text-primary flex-shrink-0" size={24} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs">✓</span>
                      </div>
                    )}
                    <span className="text-default-700">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Cabin Information */}
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold">Cabin Information</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="text-primary" size={24} />
              <div>
                <p className="text-sm text-default-500">Maximum Capacity</p>
                <p className="text-base font-semibold">
                  {cabin.capacity} {cabin.capacity === 1 ? 'guest' : 'guests'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bed className="text-primary" size={24} />
              <div>
                <p className="text-sm text-default-500">Accommodation</p>
                <p className="text-base font-semibold">{cabin.name}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* House Rules */}
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold">House Rules</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <div>
                <p className="font-semibold">Check-in</p>
                <p className="text-sm text-default-500">After 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <div>
                <p className="font-semibold">Check-out</p>
                <p className="text-sm text-default-500">Before 11:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <div>
                <p className="font-semibold">Cancellation Policy</p>
                <p className="text-sm text-default-500">
                  Free cancellation up to 48 hours before check-in
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <div>
                <p className="font-semibold">Quiet Hours</p>
                <p className="text-sm text-default-500">10:00 PM - 8:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary text-lg">✓</span>
              <div>
                <p className="font-semibold">Smoking</p>
                <p className="text-sm text-default-500">
                  No smoking inside the cabin
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

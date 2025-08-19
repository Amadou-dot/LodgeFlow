import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";

import { title, subtitle } from "@/components/primitives";

interface BookingFormProps {
  cabin: {
    _id: string;
    name: string;
    regularPrice: number;
    maxCapacity: number;
  };
}

export default function BookingForm({ cabin }: BookingFormProps) {
  // Fallback values if cabin is undefined or missing properties
  const maxCapacity = cabin?.maxCapacity || 8;
  const cabinName = cabin?.name || "This Cabin";
  const regularPrice = cabin?.regularPrice || 0;
  
  const guestOptions = Array.from({ length: maxCapacity }, (_, i) => ({
    key: (i + 1).toString(),
    label: `${i + 1} Guest${i + 1 > 1 ? 's' : ''}`,
  }));
  return (
    <Card className="p-6">
      <CardHeader>
        <div>
          <h3 className={title({ size: "sm" })}>Book {cabinName}</h3>
          <p className={subtitle({ class: "mt-2" })}>
            ${regularPrice}/night
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <form className="space-y-4">
          {/* Guest Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter your first name"
              isRequired
            />
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              isRequired
            />
          </div>
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            isRequired
          />
          
          <Input
            label="Phone"
            type="tel"
            placeholder="Enter your phone number"
            isRequired
          />

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Check-in Date"
              isRequired
            />
            <DatePicker
              label="Check-out Date"
              isRequired
            />
          </div>

          <Select
            label="Number of Guests"
            placeholder="Select number of guests"
            isRequired
          >
            {guestOptions.map((option) => (
              <SelectItem key={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>

          <Textarea
            label="Special Requests"
            placeholder="Any special requests or dietary requirements?"
            minRows={3}
          />

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span>Total (estimated)</span>
              <span className="text-xl font-bold text-green-600">
                Contact for pricing
              </span>
            </div>
            
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
            >
              Submit Booking Request
            </Button>
            
            <p className="text-xs text-default-500 mt-2 text-center">
              This is a booking request. Final confirmation and pricing will be provided by our team.
            </p>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

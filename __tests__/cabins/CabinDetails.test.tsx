import { render, screen } from '@testing-library/react';
import CabinDetails from '@/components/CabinDetails';

// Mock cabin data
const mockCabin = {
  _id: '1',
  name: 'Luxury Mountain Cabin',
  price: 250,
  capacity: 4,
  image: 'https://example.com/cabin.jpg',
  discount: 0,
  description: 'A beautiful mountain cabin with stunning views and modern amenities.',
  amenities: ['WiFi', 'Kitchen', 'Parking', 'Hot Tub', 'Mountain View'],
};

describe('CabinDetails Component', () => {
  it('renders cabin description', () => {
    render(<CabinDetails cabin={mockCabin} />);
    
    expect(screen.getByText('About this cabin')).toBeInTheDocument();
    expect(screen.getByText(mockCabin.description)).toBeInTheDocument();
  });

  it('renders amenities section with correct amenities', () => {
    render(<CabinDetails cabin={mockCabin} />);
    
    expect(screen.getByText('Amenities')).toBeInTheDocument();
    expect(screen.getByText('Everything you need for a comfortable stay')).toBeInTheDocument();
    
    // Check that each amenity is rendered
    mockCabin.amenities.forEach((amenity) => {
      expect(screen.getByText(amenity)).toBeInTheDocument();
    });
  });

  it('renders cabin information section', () => {
    render(<CabinDetails cabin={mockCabin} />);
    
    expect(screen.getByText('Cabin Information')).toBeInTheDocument();
    expect(screen.getByText('Maximum Capacity')).toBeInTheDocument();
    expect(screen.getByText('4 guests')).toBeInTheDocument();
    expect(screen.getByText('Accommodation')).toBeInTheDocument();
    expect(screen.getByText(mockCabin.name)).toBeInTheDocument();
  });

  it('renders house rules section', () => {
    render(<CabinDetails cabin={mockCabin} />);
    
    expect(screen.getByText('House Rules')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('After 3:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Check-out')).toBeInTheDocument();
    expect(screen.getByText('Before 11:00 AM')).toBeInTheDocument();
  });

  it('handles cabin with no amenities', () => {
    const cabinNoAmenities = {
      ...mockCabin,
      amenities: [],
    };
    
    render(<CabinDetails cabin={cabinNoAmenities} />);
    
    // Should still render other sections
    expect(screen.getByText('About this cabin')).toBeInTheDocument();
    expect(screen.getByText('Cabin Information')).toBeInTheDocument();
    
    // Amenities section should not be rendered
    expect(screen.queryByText('Everything you need for a comfortable stay')).not.toBeInTheDocument();
  });

  it('renders correct guest text for single guest', () => {
    const singleGuestCabin = {
      ...mockCabin,
      capacity: 1,
    };
    
    render(<CabinDetails cabin={singleGuestCabin} />);
    
    expect(screen.getByText('1 guest')).toBeInTheDocument();
  });
});

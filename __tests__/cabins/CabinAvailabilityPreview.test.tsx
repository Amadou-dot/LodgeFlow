import { render, screen } from '@testing-library/react';
import CabinAvailabilityPreview from '@/components/CabinAvailabilityPreview';
import { useCabinAvailability } from '@/hooks/useCabinAvailability';

jest.mock('@/hooks/useCabinAvailability');

describe('CabinAvailabilityPreview', () => {
  it('renders skeleton while loading', () => {
    (useCabinAvailability as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
    });
    const { container } = render(<CabinAvailabilityPreview cabinId='abc' />);
    expect(
      container.querySelector('[data-testid="availability-skeleton"]')
    ).toBeInTheDocument();
  });

  it('renders month headings when loaded', () => {
    (useCabinAvailability as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        unavailableDates: [],
        queryRange: { start: '2026-03-01', end: '2026-09-01' },
      },
    });
    render(<CabinAvailabilityPreview cabinId='abc' />);
    expect(screen.getByText('Availability')).toBeInTheDocument();
  });

  it('renders Available and Booked legend items', () => {
    (useCabinAvailability as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        unavailableDates: [],
        queryRange: { start: '2026-03-01', end: '2026-09-01' },
      },
    });
    render(<CabinAvailabilityPreview cabinId='abc' />);
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Booked')).toBeInTheDocument();
  });
});

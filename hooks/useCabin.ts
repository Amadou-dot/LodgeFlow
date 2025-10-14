import { useQuery } from '@tanstack/react-query';

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

const fetchCabin = async (cabinId: string): Promise<Cabin> => {
  const response = await fetch(`/api/cabins/${cabinId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch cabin');
  }

  const data = await response.json();
  return data.cabin;
};

export function useCabin(cabinId: string) {
  return useQuery({
    queryKey: ['cabin', cabinId],
    queryFn: () => fetchCabin(cabinId),
    enabled: !!cabinId, // Only run query if cabinId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

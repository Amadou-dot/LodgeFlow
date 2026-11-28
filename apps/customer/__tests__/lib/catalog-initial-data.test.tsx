import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createTestQueryClient } from '@/__tests__/shared/test-utils';
import { useDining } from '@/hooks/useDining';
import { useDiningItem } from '@/hooks/useDiningItem';
import { useExperiences } from '@/hooks/useExperiences';
import { useExperience } from '@/hooks/useExperience';
import type { Dining, Experience } from '@/types';

const dining: Dining = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Soup',
  description: 'Local vegetables',
  type: 'menu',
  mealType: 'lunch',
  category: 'regular',
  price: 12,
  maxPeople: 4,
  servingTime: { start: '12:00', end: '15:00' },
  image: '/soup.jpg',
};
const experience: Experience = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Forest walk',
  description: 'A guided walk',
  price: 25,
  duration: '2 hours',
  difficulty: 'Easy',
  category: 'Nature',
  image: '/forest.jpg',
  ctaText: 'Book now',
};

const cases = [
  {
    name: 'dining listing',
    useCatalog: () => useDining({}, { initialData: [dining] }),
    queryKey: ['dining', {}],
    expected: [dining],
  },
  {
    name: 'experience listing',
    useCatalog: () => useExperiences({}, { initialData: [experience] }),
    queryKey: ['experiences', {}],
    expected: [experience],
  },
  {
    name: 'dining detail',
    useCatalog: () => useDiningItem(dining._id, { initialData: dining }),
    queryKey: ['dining-item', dining._id],
    expected: dining,
  },
  {
    name: 'experience detail',
    useCatalog: () =>
      useExperience(experience._id, { initialData: experience }),
    queryKey: ['experience', experience._id],
    expected: experience,
  },
];

test.each(cases)(
  '$name renders server data immediately without waiting for a browser API request',
  ({ useCatalog, queryKey, expected }) => {
    const client = createTestQueryClient();
    const fetchMock = jest.fn(() => new Promise<Response>(() => {}));
    global.fetch = fetchMock;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(
      () => {
        const { data, isSuccess } = useCatalog();
        return { data, isSuccess };
      },
      { wrapper }
    );
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(expected);
    expect(client.getQueryData(queryKey)).toEqual(expected);
    expect(fetchMock).not.toHaveBeenCalled();
    unmount();
    client.clear();
  }
);

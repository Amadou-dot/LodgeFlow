/** @jest-environment node */
import { Types, type Model } from 'mongoose';
import DiningModel from '@lodgeflow/database/models/Dining';
import { Experience as ExperienceModel } from '@lodgeflow/database/models/Experience';
import type { DiningJsonSource } from '@lodgeflow/database/dining-json';
import type { ExperienceJsonSource } from '@lodgeflow/database/experience-json';

const mockConnect = jest.fn();
const mockConnection = jest.fn();
const mockDiningList = jest.fn<Promise<DiningJsonSource[]>, []>();
const mockExperienceList = jest.fn<Promise<ExperienceJsonSource[]>, []>();
const mockDiningSort = jest.fn((..._args: unknown[]) => mockDiningList());
const mockExperienceSort = jest.fn((..._args: unknown[]) =>
  mockExperienceList()
);
const mockDiningFind = jest.fn((..._args: unknown[]) => ({
  sort: mockDiningSort,
}));
const mockExperienceFind = jest.fn((..._args: unknown[]) => ({
  sort: mockExperienceSort,
}));
const mockDiningDetail = jest.fn<Promise<DiningJsonSource | null>, []>();
const mockExperienceDetail = jest.fn<
  Promise<ExperienceJsonSource | null>,
  []
>();
const mockDiningById = jest.fn((..._args: unknown[]) => ({
  lean: mockDiningDetail,
}));
const mockExperienceById = jest.fn((..._args: unknown[]) => ({
  lean: mockExperienceDetail,
}));

jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  // Request memoization is supplied by the RSC renderer in production.
  cache: <Arguments extends unknown[], Result>(
    fn: (...args: Arguments) => Result
  ) => fn,
}));
jest.mock('next/server', () => ({ connection: () => mockConnection() }));
jest.mock('@lodgeflow/database', () => ({
  connectDB: () => mockConnect(),
  Dining: {
    find: (...args: unknown[]) => mockDiningFind(...args),
    findById: (...args: unknown[]) => mockDiningById(...args),
  },
  Experience: {
    find: (...args: unknown[]) => mockExperienceFind(...args),
    findById: (...args: unknown[]) => mockExperienceById(...args),
  },
}));

import {
  getDiningForListing,
  getExperiencesForListing,
  getDiningById,
  getExperienceById,
} from '@/lib/data/catalog';

const id = '507f1f77bcf86cd7994390ab';
const TypedDining: Model<DiningJsonSource> = DiningModel;
const TypedExperience: Model<ExperienceJsonSource> = ExperienceModel;
const dining = {
  _id: new Types.ObjectId(id),
  name: 'Soup',
  description: 'Local vegetables',
  type: 'menu',
  mealType: 'lunch',
  category: 'regular',
  price: 12,
  maxPeople: 4,
  servingTime: { start: '12:00', end: '15:00' },
  image: '/soup.jpg',
  isAvailable: false,
  gallery: null,
  createdAt: new Date('2026-01-02T00:00:00Z'),
} satisfies DiningJsonSource;
const experience = {
  _id: new Types.ObjectId(id),
  name: 'Forest walk',
  description: 'A guided walk',
  price: 25,
  duration: '2 hours',
  difficulty: 'Easy',
  category: 'Nature',
  image: '/forest.jpg',
  ctaText: 'Book now',
  includes: null,
  updatedAt: new Date('2026-02-03T00:00:00Z'),
} satisfies ExperienceJsonSource;

beforeEach(() => {
  jest.clearAllMocks();
  mockConnection.mockResolvedValue(undefined);
  mockConnect.mockResolvedValue(undefined);
  mockDiningList.mockResolvedValue([
    new TypedDining({ ...dining, isAvailable: true }),
  ]);
  mockExperienceList.mockResolvedValue([new TypedExperience(experience)]);
  mockDiningDetail.mockResolvedValue(dining);
  mockExperienceDetail.mockResolvedValue(experience);
});

test('dining listing preserves public visibility, ordering and serialized dates', async () => {
  const rows = await getDiningForListing();
  expect(mockConnection).toHaveBeenCalledTimes(1);
  expect(mockDiningFind).toHaveBeenCalledWith({ isAvailable: true });
  expect(mockDiningSort).toHaveBeenCalledWith({
    mealType: 1,
    type: 1,
    name: 1,
  });
  expect(rows[0]).toMatchObject({
    _id: id,
    createdAt: '2026-01-02T00:00:00.000Z',
    gallery: null,
  });
});

test('experience listing preserves its public ordering and serialized dates', async () => {
  const rows = await getExperiencesForListing();
  expect(mockConnection).toHaveBeenCalledTimes(1);
  expect(mockExperienceFind).toHaveBeenCalledWith({});
  expect(mockExperienceSort).toHaveBeenCalledWith({ isPopular: -1, price: 1 });
  expect(rows[0]).toMatchObject({
    _id: id,
    updatedAt: '2026-02-03T00:00:00.000Z',
    includes: null,
  });
});

describe.each([
  ['dining', getDiningById, mockDiningDetail],
  ['experience', getExperienceById, mockExperienceDetail],
] as const)('%s detail', (_name, read, detail) => {
  test.each(['invalid', '', '../bookings'])(
    'rejects %s before database access',
    async invalid => {
      expect(await read(invalid)).toBeNull();
      expect(mockConnect).not.toHaveBeenCalled();
      expect(mockDiningById).not.toHaveBeenCalled();
      expect(mockExperienceById).not.toHaveBeenCalled();
    }
  );

  test('returns the stored lowercase ID for an uppercase URL alias', async () => {
    expect(await read(id.toUpperCase())).toMatchObject({ _id: id });
  });

  test('returns null for a deleted record', async () => {
    detail.mockResolvedValueOnce(null);
    expect(await read(id)).toBeNull();
  });

  test('rejects a different record before it enters the client cache', async () => {
    await expect(read('507f1f77bcf86cd7994390ac')).rejects.toThrow();
  });

  test('does not disguise a database outage as a missing record', async () => {
    const failure = new Error('database unavailable');
    mockConnect.mockRejectedValueOnce(failure);
    await expect(read(id)).rejects.toBe(failure);
  });
});

test('unavailable dining details remain viewable with their availability flag', async () => {
  expect(await getDiningById(id)).toMatchObject({
    _id: id,
    isAvailable: false,
  });
});

test('dining listing rejects malformed stored data before seeding the client cache', async () => {
  mockDiningList.mockResolvedValue([
    new TypedDining({ ...dining, isAvailable: true, description: '' }),
  ]);
  await expect(getDiningForListing()).rejects.toThrow();
});

test('dining listing rejects a row outside its public visibility policy', async () => {
  mockDiningList.mockResolvedValue([new TypedDining(dining)]);
  await expect(getDiningForListing()).rejects.toThrow();
});

test('experience listing rejects malformed stored data before seeding the client cache', async () => {
  mockExperienceList.mockResolvedValue([
    new TypedExperience({ ...experience, description: '' }),
  ]);
  await expect(getExperiencesForListing()).rejects.toThrow();
});

test('dining detail rejects malformed stored data before seeding the client cache', async () => {
  mockDiningDetail.mockResolvedValue({ ...dining, description: '' });
  await expect(getDiningById(id)).rejects.toThrow();
});

test('experience detail rejects malformed stored data before seeding the client cache', async () => {
  mockExperienceDetail.mockResolvedValue({ ...experience, description: '' });
  await expect(getExperienceById(id)).rejects.toThrow();
});

test.each([getDiningForListing, getExperiencesForListing])(
  'a request-boundary failure does not become a successful empty catalog',
  async read => {
    const failure = new Error('request boundary');
    mockConnection.mockRejectedValueOnce(failure);
    await expect(read()).rejects.toBe(failure);
    expect(mockConnect).not.toHaveBeenCalled();
  }
);

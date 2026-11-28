import { cache } from 'react';
import { connection } from 'next/server';
import type { Model } from 'mongoose';

import { connectDB, Dining, Experience } from '@lodgeflow/database';
import {
  serializeDining,
  type DiningJsonSource,
} from '@lodgeflow/database/dining-json';
import {
  serializeExperience,
  type ExperienceJsonSource,
} from '@lodgeflow/database/experience-json';
import { catalogIdSchema } from '@/lib/validations/catalog';
import {
  diningDetailSchema,
  diningListSchema,
  experienceDetailSchema,
  experienceListSchema,
} from '@/lib/validations/catalog-json';
import type {
  Dining as DiningData,
  Experience as ExperienceData,
} from '@/types';

const diningReader: Model<DiningJsonSource> = Dining;
const experienceReader: Model<ExperienceJsonSource> = Experience;

// Keep catalog links live when demo records are replaced after a deployment.
export const getDiningForListing = cache(async (): Promise<DiningData[]> => {
  await connection();
  await connectDB();
  const rows = await diningReader
    .find({ isAvailable: true })
    .sort({ mealType: 1, type: 1, name: 1 });
  return diningListSchema.parse(rows.map(serializeDining));
});

export const getExperiencesForListing = cache(
  async (): Promise<ExperienceData[]> => {
    await connection();
    await connectDB();
    const rows = await experienceReader
      .find({})
      .sort({ isPopular: -1, price: 1 });
    return experienceListSchema.parse(rows.map(serializeExperience));
  }
);

// React cache shares each read between generateMetadata and its server page.
// Missing records return null; database failures remain errors, not false 404s.
export const getDiningById = cache(
  async (id: string): Promise<DiningData | null> => {
    const input = catalogIdSchema.safeParse(id);
    if (!input.success) return null;
    await connection();
    await connectDB();
    const row = await diningReader.findById(input.data).lean();
    return row
      ? diningDetailSchema(input.data).parse(serializeDining(row))
      : null;
  }
);

export const getExperienceById = cache(
  async (id: string): Promise<ExperienceData | null> => {
    const input = catalogIdSchema.safeParse(id);
    if (!input.success) return null;
    await connection();
    await connectDB();
    const row = await experienceReader.findById(input.data).lean();
    return row
      ? experienceDetailSchema(input.data).parse(serializeExperience(row))
      : null;
  }
);

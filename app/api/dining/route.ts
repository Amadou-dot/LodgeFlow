import { NextResponse } from 'next/server';
import { connectDB, Dining } from '@/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Build query object based on search parameters
    const query: any = { isAvailable: true };

    if (searchParams.get('type')) {
      query.type = searchParams.get('type');
    }

    if (searchParams.get('mealType')) {
      query.mealType = searchParams.get('mealType');
    }

    if (searchParams.get('category')) {
      query.category = searchParams.get('category');
    }

    if (searchParams.get('isPopular')) {
      query.isPopular = searchParams.get('isPopular') === 'true';
    }

    // Price range filtering
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Dietary restrictions filtering
    const dietary = searchParams.get('dietary');
    if (dietary) {
      const dietaryArray = dietary.split(',');
      query.dietary = { $in: dietaryArray };
    }

    // Text search functionality
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { dietary: { $regex: search, $options: 'i' } },
      ];
    }

    const dining = await Dining.find(query).sort({
      mealType: 1,
      type: 1,
      name: 1,
    });

    return NextResponse.json({
      success: true,
      data: dining,
    });
  } catch (error) {
    console.error('Error fetching dining options:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dining options',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { connectDB, Dining } from '@/models';
import type { ApiResponse } from '@/types';

type Params = Promise<{ id: string }>;

export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await connectDB();

    const { id } = await params;
    const dining = await Dining.findById(id).lean();

    if (!dining) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Dining item not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<typeof dining> = {
      success: true,
      data: dining,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dining item:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch dining item',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

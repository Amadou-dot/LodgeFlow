import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Cabin from '../../../../models/Cabin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();
    const cabin = await Cabin.findById(id).lean();

    if (!cabin) {
      return NextResponse.json({ error: 'Cabin not found' }, { status: 404 });
    }

    // Convert MongoDB document to plain object
    const serializedCabin = JSON.parse(JSON.stringify(cabin));

    return NextResponse.json({ cabin: serializedCabin });
  } catch (error) {
    console.error('Error fetching cabin:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

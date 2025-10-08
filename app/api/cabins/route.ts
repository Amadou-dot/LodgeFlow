import { NextRequest, NextResponse } from "next/server";
import { connectDB, Cabin } from "@/models";
import type { ApiResponse, Cabin as CabinType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const capacity = searchParams.get("capacity");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const available = searchParams.get("available");
    const search = searchParams.get("search");

    // Build query
    let query: any = {};
    
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Text search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { amenities: { $regex: search, $options: 'i' } }
      ];
    }

    const cabins = await Cabin.find(query).sort({ price: 1 });

    const response: ApiResponse<CabinType[]> = {
      success: true,
      data: cabins,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching cabins:", error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch cabins",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

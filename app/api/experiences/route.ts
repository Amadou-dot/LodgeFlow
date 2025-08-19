import { NextRequest, NextResponse } from "next/server";
import { connectDB, Experience } from "@/models";
import type { ApiResponse, Experience as ExperienceType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isPopular = searchParams.get("isPopular");
    const tags = searchParams.get("tags");

    // Build query
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (isPopular !== null) {
      query.isPopular = isPopular === 'true';
    }

    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const experiences = await Experience.find(query).sort({ isPopular: -1, price: 1 });

    const response: ApiResponse<ExperienceType[]> = {
      success: true,
      data: experiences,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch experiences",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

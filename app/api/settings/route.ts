import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Settings } from '@/models';
import type { ApiResponse, Settings as SettingsType } from '@/types';

export async function GET() {
  try {
    await connectDB();

    const settings = await Settings.findOne().sort({ createdAt: -1 });

    if (!settings) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Settings not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<SettingsType> = {
      success: true,
      data: settings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);

    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch settings',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { Booking, connectDB } from '@/models';
import type { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const booking = await Booking.findById(id).populate('cabin');

    if (!booking) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Booking not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: booking,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking:', error);

    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch booking',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking details (limited to customer's own bookings)
 * Customers can only update: numGuests, specialRequests, extras
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized',
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Booking not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verify the booking belongs to the authenticated user
    if (booking.customer.toString() !== userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized to modify this booking',
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Customers can only update certain fields
    const allowedUpdates = ['numGuests', 'specialRequests', 'extras'];
    const updates: any = {};

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Prevent modifications to checked-in/checked-out bookings
    if (booking.status === 'checked-in' || booking.status === 'checked-out') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Cannot modify bookings that are checked-in or checked-out',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('cabin');

    const response: ApiResponse<any> = {
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);

    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update booking',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel a booking (soft delete - changes status to 'cancelled')
 * Only unconfirmed or confirmed bookings can be cancelled
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized',
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Booking not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verify the booking belongs to the authenticated user
    if (booking.customer.toString() !== userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized to cancel this booking',
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check if booking can be cancelled
    if (
      booking.status === 'checked-in' ||
      booking.status === 'checked-out' ||
      booking.status === 'cancelled'
    ) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Cannot cancel booking with status: ${booking.status}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Soft delete - update status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    const response: ApiResponse<any> = {
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error cancelling booking:', error);

    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to cancel booking',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

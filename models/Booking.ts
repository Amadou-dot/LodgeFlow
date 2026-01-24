import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  cabin: mongoose.Types.ObjectId | string;
  customer: mongoose.Types.ObjectId | string;
  checkInDate: Date;
  checkOutDate: Date;
  numNights: number;
  numGuests: number;
  status:
    | 'unconfirmed'
    | 'confirmed'
    | 'checked-in'
    | 'checked-out'
    | 'cancelled';
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'online';
  extras: {
    hasBreakfast: boolean;
    breakfastPrice: number;
    hasPets: boolean;
    petFee: number;
    hasParking: boolean;
    parkingFee: number;
    hasEarlyCheckIn: boolean;
    earlyCheckInFee: number;
    hasLateCheckOut: boolean;
    lateCheckOutFee: number;
  };
  observations?: string;
  specialRequests: string[];
  depositPaid: boolean;
  depositAmount: number;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: Date;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    cabin: {
      type: Schema.Types.ObjectId,
      ref: 'Cabin',
      required: [true, 'Cabin is required'],
    },
    customer: {
      type: Schema.Types.String,
      required: [true, 'Customer is required'],
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function (this: IBooking, checkOutDate: Date) {
          return checkOutDate > this.checkInDate;
        },
        message: 'Check-out date must be after check-in date',
      },
    },
    numNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: [1, 'Minimum 1 night required'],
    },
    numGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest required'],
    },
    status: {
      type: String,
      enum: [
        'unconfirmed',
        'confirmed',
        'checked-in',
        'checked-out',
        'cancelled',
      ],
      default: 'unconfirmed',
    },
    cabinPrice: {
      type: Number,
      required: [true, 'Cabin price is required'],
      min: [0, 'Cabin price must be positive'],
    },
    extrasPrice: {
      type: Number,
      default: 0,
      min: [0, 'Extras price must be positive'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be positive'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank-transfer', 'online'],
      default: 'online',
    },
    extras: {
      hasBreakfast: { type: Boolean, default: false },
      breakfastPrice: { type: Number, default: 0 },
      hasPets: { type: Boolean, default: false },
      petFee: { type: Number, default: 0 },
      hasParking: { type: Boolean, default: false },
      parkingFee: { type: Number, default: 0 },
      hasEarlyCheckIn: { type: Boolean, default: false },
      earlyCheckInFee: { type: Number, default: 0 },
      hasLateCheckOut: { type: Boolean, default: false },
      lateCheckOutFee: { type: Number, default: 0 },
    },
    observations: {
      type: String,
      maxlength: [1000, 'Observations cannot exceed 1000 characters'],
    },
    specialRequests: {
      type: [String],
      default: [],
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: [0, 'Deposit amount must be positive'],
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeSessionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount must be positive'],
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ status: 1, checkInDate: 1 });
BookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// Prevent overlapping bookings for the same cabin
BookingSchema.index(
  { cabin: 1, checkInDate: 1, checkOutDate: 1 },
  {
    partialFilterExpression: {
      status: { $nin: ['cancelled'] },
    },
  }
);

// Prevent model re-compilation in development
const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

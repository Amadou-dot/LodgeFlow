import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  _id: string;
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
  breakfastPrice: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  requireDeposit: boolean;
  depositPercentage: number;
  allowPets: boolean;
  petFee: number;
  smokingAllowed: boolean;
  earlyCheckInFee: number;
  lateCheckOutFee: number;
  wifiIncluded: boolean;
  parkingIncluded: boolean;
  parkingFee: number;
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    minBookingLength: {
      type: Number,
      required: [true, "Minimum booking length is required"],
      min: [1, "Minimum booking length must be at least 1 night"],
      default: 2,
    },
    maxBookingLength: {
      type: Number,
      required: [true, "Maximum booking length is required"],
      min: [1, "Maximum booking length must be at least 1 night"],
      default: 30,
    },
    maxGuestsPerBooking: {
      type: Number,
      required: [true, "Maximum guests per booking is required"],
      min: [1, "Maximum guests must be at least 1"],
      default: 8,
    },
    breakfastPrice: {
      type: Number,
      required: [true, "Breakfast price is required"],
      min: [0, "Breakfast price must be positive"],
      default: 15,
    },
    checkInTime: {
      type: String,
      required: [true, "Check-in time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Check-in time must be in HH:MM format"],
      default: "15:00",
    },
    checkOutTime: {
      type: String,
      required: [true, "Check-out time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Check-out time must be in HH:MM format"],
      default: "11:00",
    },
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      default: "moderate",
    },
    requireDeposit: {
      type: Boolean,
      default: true,
    },
    depositPercentage: {
      type: Number,
      min: [0, "Deposit percentage must be positive"],
      max: [100, "Deposit percentage cannot exceed 100%"],
      default: 25,
    },
    allowPets: {
      type: Boolean,
      default: true,
    },
    petFee: {
      type: Number,
      min: [0, "Pet fee must be positive"],
      default: 20,
    },
    smokingAllowed: {
      type: Boolean,
      default: false,
    },
    earlyCheckInFee: {
      type: Number,
      min: [0, "Early check-in fee must be positive"],
      default: 50,
    },
    lateCheckOutFee: {
      type: Number,
      min: [0, "Late check-out fee must be positive"],
      default: 50,
    },
    wifiIncluded: {
      type: Boolean,
      default: true,
    },
    parkingIncluded: {
      type: Boolean,
      default: false,
    },
    parkingFee: {
      type: Number,
      min: [0, "Parking fee must be positive"],
      default: 10,
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "USD",
      maxlength: [3, "Currency code cannot exceed 3 characters"],
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      default: "UTC",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Validation to ensure max booking length is greater than min
SettingsSchema.pre("validate", function (this: ISettings) {
  if (this.maxBookingLength <= this.minBookingLength) {
    throw new Error("Maximum booking length must be greater than minimum booking length");
  }
});

// Prevent model re-compilation in development
const Settings = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;

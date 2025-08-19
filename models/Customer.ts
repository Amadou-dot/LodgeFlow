import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  nationalId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    smokingPreference: "smoking" | "non-smoking" | "no-preference";
    dietaryRestrictions: string[];
    accessibilityNeeds: string[];
  };
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v: string) {
          return /^[1-9]\d{9,14}$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },
    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      trim: true,
    },
    nationalId: {
      type: String,
      required: [true, "National ID is required"],
      trim: true,
      uppercase: true,
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
    },
    emergencyContact: {
      name: { type: String, required: true, trim: true },
      phone: {
        type: String,
        required: true,
        validate: {
          validator: function (v: string) {
            return /^[1-9]\d{9,14}$/.test(v);
          },
          message: "Please provide a valid emergency contact phone number",
        },
      },
      relationship: {
        type: String,
        required: true,
        enum: ["spouse", "parent", "sibling", "friend", "other"],
      },
    },
    preferences: {
      smokingPreference: {
        type: String,
        enum: ["smoking", "non-smoking", "no-preference"],
        default: "no-preference",
      },
      dietaryRestrictions: {
        type: [String],
        default: [],
      },
      accessibilityNeeds: {
        type: [String],
        default: [],
      },
    },
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastBookingDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for efficient queries
// Note: email index is already created by unique: true
CustomerSchema.index({ name: "text", email: "text" });
CustomerSchema.index({ totalSpent: -1 });

// Prevent model re-compilation in development
const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;

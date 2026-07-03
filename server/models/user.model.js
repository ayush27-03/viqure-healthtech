const mongoose = require("mongoose");
const { Schema } = mongoose;

// Embedded sub-schemas to follow NoSQL / document design
const ProfileSchema = new Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true }
  },
  { _id: false },
);

const AddressSchema = new Schema(
  {
    type: { type: String, enum: ["HOME", "WORK", "OTHER"], default: "HOME" },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  }
);

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false },
);

const TimeSlotSchema = new Schema(
  {
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    isBooked: { type: Boolean, default: false },
  }
);

const DoctorDetailsSchema = new Schema(
  {
    medicalLicense: { type: String, unique: true, trim: true, sparse: true },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    consultationFee: { type: Number, default: 0 },
    qualifications: [String],
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    bio: { type: String, maxLength: 500 },
    averageRating: { type: Number, default: 0 },
    timeSlots: [TimeSlotSchema],
    isAvailable: { type: Boolean, default: true },
    stats: {
      rating: { type: Number, min: 0, max: 5, default: 0 },
      totalRatings: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 }
    }
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    // top-level identity / auth
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      unique: true,
    },
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{9,14}$/, "Invalid phone number"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "DOCTOR", "ADMIN"],
      required: true,
    },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    dob: { type: Date },

    // Embedded documents for common NoSQL patterns
    profile: { type: ProfileSchema, default: {} },
    addresses: { type: [AddressSchema], default: [] },
    cart: { type: [CartItemSchema], default: [] }, // volatile, session-specific

    // Doctor specific details (only present when `role === 'doctor'`)
    detailsOfHealthCareProfessional: {
      type: DoctorDetailsSchema,
      default: null,
    },

    // status and metadata
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    avatar: { type: String, default: null },
    fcmToken: { type: String, default: null },
  },
  { timestamps: true },
);

// Indexes: keep unique constraints and common filters fast
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);

/**
IMPORTANT:
The uploaded schemas are the source of truth.
Never invent fields.
Never rename fields.
Never create properties not present in the schema.
If a field is required by the schema, populate it.
If a relationship exists in the schema, maintain referential integrity.
 */
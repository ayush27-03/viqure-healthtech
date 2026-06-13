const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    documentURL: {
      type: String,
      trim: true,
    },
    documentType: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const PaymentDetailsSchema = new Schema(
  {
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paidAt: {
      type: Date,
    },
  },
  { _id: false }
);

const CancellationSchema = new Schema(
  {
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { _id: false }
);

const MeetingSchema = new Schema(
  {
    meetingId: {
      type: String,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    consultationType: {
      type: String,
      enum: ['VIDEO', 'PHONE', 'IN_PERSON'],
      default: 'VIDEO',
    },
  },
  { _id: false }
);

const FinancialsSchema = new Schema(
  {
    consultationFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    refundableAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const RemarksSchema = new Schema(
  {
    text: {
      type: String,
      maxlength: 2000,
    },
    mode: {
      type: String,
      enum: ['File', 'Text'],
    },
  },
  { _id: false }
);

const FeedbackSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  { _id: false }
);

const ReportedIssueSchema = new Schema(
  {
    issue: {
      type: String,
      trim: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
    },
    resolution: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schedule: {
      scheduledAt: {
        type: Date,
        required: true,
      },
      slotTime: {
        type: String,
      },
      startDateTime: {
        type: Date,
      },
      endDateTime: {
        type: Date,
      },
    },
    meeting: { type: MeetingSchema, default: {} },
    financials: { type: FinancialsSchema, default: {} },
    paymentDetails: { type: PaymentDetailsSchema, default: {} },
    appointmentStatus: {
      type: String,
      enum: ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'BOOKED',
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    cancellation: { type: CancellationSchema, default: null },
    documentsShared: {
      type: [DocumentSchema],
      default: [],
    },
    doctorRemarks: { type: RemarksSchema, default: {} },
    feedback: { type: FeedbackSchema, default: {} },
    reportedIssue: { type: ReportedIssueSchema, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

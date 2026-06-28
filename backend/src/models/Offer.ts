import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  code: string;
  gradient: string;
  claimed: number;
  maxClaims?: number;
  minOrderValue?: number;
  isActive: boolean;
  canteenId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    discount: {
      type: String,
      required: [true, 'Discount description is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
      trim: true,
    },
    validUntil: {
      type: String,
      required: [true, 'Validity period is required'],
    },
    code: {
      type: String,
      required: [true, 'Offer code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    gradient: {
      type: String,
      default: 'from-purple-600 to-blue-600',
    },
    claimed: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxClaims: {
      type: Number,
      default: null,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    canteenId: {
      type: Schema.Types.ObjectId,
      ref: 'Canteen',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, validUntil: 1 });

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);

import mongoose, { Document, Schema } from 'mongoose';
import type { RushLevel } from '../utils/constants';

export interface ICanteen extends Document {
  name: string;
  description?: string;
  rating: number;
  ratingCount: number;
  tags: string[];
  rushLevel: RushLevel;
  avgWaitTime: string;
  bannerImage: string;
  logoImage?: string;
  categories: string[];
  isActive: boolean;
  ownerId?: mongoose.Types.ObjectId;
  contactPhone?: string;
  address?: string;
  openingHours?: string;
  createdAt: Date;
  updatedAt: Date;
}

const canteenSchema = new Schema<ICanteen>(
  {
    name: {
      type: String,
      required: [true, 'Canteen name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    rushLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    avgWaitTime: {
      type: String,
      default: '5 min',
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    logoImage: {
      type: String,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    openingHours: {
      type: String,
      trim: true,
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

canteenSchema.index({ name: 'text', tags: 'text' });
canteenSchema.index({ isActive: 1, rating: -1 });

export const Canteen = mongoose.model<ICanteen>('Canteen', canteenSchema);

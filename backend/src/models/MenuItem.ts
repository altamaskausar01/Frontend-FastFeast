import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  canteenId: mongoose.Types.ObjectId;
  category: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  prepTime: string;
  image: string;
  isVeg: boolean;
  inStock: boolean;
  isTrending?: boolean;
  isFast?: boolean;
  customizationOptions?: {
    name: string;
    type: 'single' | 'multi';
    options: { label: string; price: number }[];
  }[];
  spiceLevels?: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    canteenId: {
      type: Schema.Types.ObjectId,
      ref: 'Canteen',
      required: [true, 'Canteen ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    prepTime: {
      type: String,
      required: [true, 'Preparation time is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    isVeg: {
      type: Boolean,
      required: [true, 'Veg/Non-veg designation is required'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isFast: {
      type: Boolean,
      default: false,
    },
    customizationOptions: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['single', 'multi'],
          required: true,
        },
        options: [
          {
            label: { type: String, required: true },
            price: { type: Number, default: 0 },
          },
        ],
      },
    ],
    spiceLevels: [
      {
        type: String,
        enum: ['mild', 'medium', 'hot'],
      },
    ],
    sortOrder: {
      type: Number,
      default: 0,
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

menuItemSchema.index({ canteenId: 1, category: 1 });
menuItemSchema.index({ canteenId: 1, isTrending: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ isFast: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

import mongoose, { Document, Schema } from 'mongoose';
import type { OrderStatus, PaymentMethod, SpiceLevel } from '../utils/constants';

interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  spiceLevel?: SpiceLevel;
  customizations?: string[];
  specialNotes?: string;
}

export interface IOrder extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  canteenId: mongoose.Types.ObjectId;
  canteenName: string;
  items: IOrderItem[];
  subtotal: number;
  gst: number;
  platformFee: number;
  discount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  estimatedTime: string;
  queuePosition?: number;
  notes?: string;
  isGroupOrder: boolean;
  groupOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot'],
    },
    customizations: [{ type: String }],
    specialNotes: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    token: {
      type: String,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    canteenId: {
      type: Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    canteenName: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    gst: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'received',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Wallet', 'Counter'],
      required: true,
    },
    estimatedTime: {
      type: String,
      default: '15-20 min',
    },
    queuePosition: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    isGroupOrder: {
      type: Boolean,
      default: false,
    },
    groupOrderId: {
      type: String,
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

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ canteenId: 1, status: 1 });
orderSchema.index({ token: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function (next) {
  if (this.isNew && !this.token) {
    const randomNum = Math.floor(Math.random() * 999) + 1;
    this.token = `A-${String(randomNum).padStart(3, '0')}`;
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);

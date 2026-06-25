import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  image: string;
  price: string;
  rating: string;
  affiliateUrl: string;
  asin: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: String, default: '' },
    rating: { type: String, default: '' },
    affiliateUrl: { type: String, required: true },
    asin: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

import { Schema, Document } from 'mongoose';

export interface Vertical extends Document {
  name: string;
  description: string;
}

export const VerticalSchema = new Schema<Vertical>({
  name: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

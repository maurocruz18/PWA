// FICHEIRO: src/models/PlanCompletion.ts

import { Schema, model, Document, Types } from 'mongoose';

export interface IPlanCompletion extends Document {
  clientId: Types.ObjectId;
  ptId: Types.ObjectId;
  planId: Types.ObjectId;
  planName: string;
  completedAt: Date;
  status: 'completed' | 'late' | 'failed';
  feedback?: string;
  proofImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlanCompletionSchema = new Schema<IPlanCompletion>(
  {
    clientId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    ptId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    planId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Plan', 
      required: true 
    },
    planName: { 
      type: String, 
      required: true 
    },
    completedAt: { 
      type: Date, 
      default: Date.now,
      index: true
    },
    status: { 
      type: String, 
      enum: ['completed', 'late', 'failed'], 
      required: true 
    },
    feedback: { 
      type: String 
    },
    proofImage: { 
      type: String 
    },
  },
  { timestamps: true }
);

export const PlanCompletion = model<IPlanCompletion>(
  'PlanCompletion',
  PlanCompletionSchema
);
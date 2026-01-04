import { Schema, model, Document, Types } from 'mongoose';

interface ICompletion {
  date: Date;
  status: 'completed' | 'late' | 'failed';
  feedback?: string;
  proofImage?: string;
}

export interface IPlan extends Document {
  clientId: Types.ObjectId;
  ptId: Types.ObjectId;
  dayOfWeek: number; // 0=Domingo, 1=Segunda, ... 6=Sábado
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    videoLink?: string;
  }>;
  completions: ICompletion[];
  weekAssigned: Date; // Data em que o plano foi criado/atribuído
  isCompleted: boolean;
  feedback?: string;
  completionImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompletionSchema = new Schema({
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['completed', 'late', 'failed'], 
    required: true 
  },
  feedback: { type: String },
  proofImage: { type: String }
});

const PlanSchema = new Schema<IPlan>({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ptId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    videoLink: String
  }],
  completions: [CompletionSchema],
  weekAssigned: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  feedback: String,
  completionImage: String
}, { timestamps: true });

export const TrainingPlan = model<IPlan>('TrainingPlan', PlanSchema);
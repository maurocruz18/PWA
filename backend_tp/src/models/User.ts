import { Schema, model, Document, Types } from 'mongoose';

export interface IPTChangeRequest {
  _id?: Types.ObjectId;
  fromPT: Types.ObjectId;
  toPT: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  respondedBy?: Types.ObjectId;
  reason?: string;
}

export interface IClientRequestFromPT {
  _id?: Types.ObjectId;
  ptId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  rejectionReason?: string;
}

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'ADMIN' | 'PT' | 'CLIENT';
  isValidated: boolean;
  ptId?: Types.ObjectId;
  profileImage?: string;
  themePreference?: 'light' | 'dark';
  email?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  ptChangeRequests?: IPTChangeRequest[];
  pendingPTChange?: {
    toPT: Types.ObjectId;
    requestedAt: Date;
  };
  clientRequestsFromPTs?: IClientRequestFromPT[];
  clientCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'PT', 'CLIENT'], default: 'CLIENT' },
  isValidated: { type: Boolean, default: false },
  ptId: { type: Schema.Types.ObjectId, ref: 'User' },
  profileImage: { type: String },
  themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
  email: { type: String, sparse: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  clientCount: { type: Number, default: 0 },
  ptChangeRequests: [{
    _id: { type: Schema.Types.ObjectId, auto: true },
    fromPT: { type: Schema.Types.ObjectId, ref: 'User' },
    toPT: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String }
  }],
  
  pendingPTChange: {
    toPT: { type: Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date }
  },

  clientRequestsFromPTs: [{
    _id: { type: Schema.Types.ObjectId, auto: true },
    ptId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    rejectionReason: { type: String }
  }]
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
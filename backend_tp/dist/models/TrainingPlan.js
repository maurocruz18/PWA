"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingPlan = void 0;
const mongoose_1 = require("mongoose");
const CompletionSchema = new mongoose_1.Schema({
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['completed', 'late', 'failed'],
        required: true
    },
    feedback: { type: String },
    proofImage: { type: String }
});
const PlanSchema = new mongoose_1.Schema({
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    ptId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
exports.TrainingPlan = (0, mongoose_1.model)('TrainingPlan', PlanSchema);

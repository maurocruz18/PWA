"use strict";
// FICHEIRO: src/models/PlanCompletion.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanCompletion = void 0;
const mongoose_1 = require("mongoose");
const PlanCompletionSchema = new mongoose_1.Schema({
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    ptId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
exports.PlanCompletion = (0, mongoose_1.model)('PlanCompletion', PlanCompletionSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
    entityType: "question" | "extracted_question" | "simulado";
    entityId: mongoose.Types.ObjectId;
    action: "ia_review" | "manual_correction" | "ia_generation";
    performedBy: "ia" | mongoose.Types.ObjectId;
    details: {
        previousValue?: any;
        newValue?: any;
        auditResult?: {
            status: "approved" | "corrected" | "flagged";
            confidence: number;
            feedback: string;
            academicRole: string;
        };
    };
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
    {
        entityType: { type: String, required: true },
        entityId: { type: Schema.Types.ObjectId, required: true },
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.Mixed, required: true }, // "ia" or userId
        details: {
            previousValue: { type: Schema.Types.Mixed },
            newValue: { type: Schema.Types.Mixed },
            auditResult: {
                status: { type: String },
                confidence: { type: Number },
                feedback: { type: String },
                academicRole: { type: String },
            },
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

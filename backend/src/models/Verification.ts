import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, required: true },
    contentHash: { type: String, required: true },
    aiScore: { type: Number, required: true },
    classification: { type: String, required: true },
    confidence: { type: Number, required: true },
    fileUrl: { type: String },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  },
  { timestamps: true }
);

export default mongoose.model('Verification', verificationSchema);

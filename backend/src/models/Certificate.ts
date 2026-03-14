import mongoose from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new mongoose.Schema(
  {
    verificationId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentHash: { type: String, required: true },
    aiScore: { type: Number, required: true },
    classification: { type: String, required: true },
    confidence: { type: Number, required: true },
    certificateNumber: { type: String, unique: true },
    pdfUrl: { type: String },
    txHash: { type: String },
    verifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.pre('save', function (next) {
  if (!this.certificateNumber) {
    this.certificateNumber = `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Certificate', certificateSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, sparse: true },
    picture: { type: String },
    company: { type: String },
    role: { type: String },
    isOnboarded: { type: Boolean, default: false },
    wallet: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referralCount: { type: Number, default: 0 },
    verifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Verification' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

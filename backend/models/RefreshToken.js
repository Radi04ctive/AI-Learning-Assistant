import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Opaque uuid v4 string (not a JWT). Verified by DB lookup, not signature,
    // so a refresh token can only be used if it still exists here.
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: Mongo automatically deletes docs once `expiresAt` passes,
// so expired refresh tokens clean themselves up with no cron job.
refreshTokenSchema.index({ expiresAt: 1 }, { expires: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;

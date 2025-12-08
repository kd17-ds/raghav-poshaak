const { Schema, model } = require("mongoose");

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // Stored as SHA-256 hash for security
    tokenHash: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["email_verify", "password_reset"],
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
  }
);

// Auto-delete tokens when they expire
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Speed up searches using tokenHash
TokenSchema.index({ tokenHash: 1 });

module.exports = model("Token", TokenSchema);

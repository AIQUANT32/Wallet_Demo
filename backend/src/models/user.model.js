const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  srp: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  authMethod: {
    type: String,
    enum: ["email", "wallet"],
    default: "email",
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    default: null,
    required: function () {
      return this.authMethod === "email";
    },
  },
  password: {
    type: String,
    required: true,
  },
  walletName: {
    type: String,
    default: null,
  },
  walletAddress: {
    type: String,
    default: null,
    sparse: true,
    unique: true,
  },
});

userSchema.index({ walletAddress: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model("User", userSchema);
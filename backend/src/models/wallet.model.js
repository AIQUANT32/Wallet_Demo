const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  srp: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  walletName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Wallet", walletSchema);

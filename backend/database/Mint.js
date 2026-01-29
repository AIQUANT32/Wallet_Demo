const mongoose = require("mongoose");

const mintSchema = new mongoose.Schema(
    {
        owner: String,
        nftName: String,
        txHash: String,
    },
    {timestamps: true},

);

module.exports = mongoose.model("Mint", mintSchema);
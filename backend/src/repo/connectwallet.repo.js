const Wallet = require("../models/wallet.model");

exports.findWallet = ({ srp, walletName, address }) => {
  return Wallet.findOne({ srp, walletName, address });
};

exports.createWallet = ({ srp, walletName, address }) => {
  return Wallet.create({
    srp,
    walletName,
    address,
  });
};

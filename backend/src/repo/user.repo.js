const User = require("../models/user.model");

exports.findByEmail = (email) => {
  return User.findOne(email);
};

exports.findByWalletAddress = (address) => {
  return User.findOne({ walletAddress: address });
};

exports.findByUsername = (username) => {
  return User.findOne({ username });
};

exports.createUser = (data) => {
  return User.create(data);
};
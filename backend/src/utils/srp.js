// SRP GENERATOR

exports.generateSRP = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let srp = "";

  for (let i = 0; i < 10; i++) {
    srp += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return srp;
};
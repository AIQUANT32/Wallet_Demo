const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepo = require("../repo/user.repo");
const walletRepo = require("../repo/connectwallet.repo");
const { generateSRP } = require("../utils/srp");

exports.signup = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new Error("Username, email and password are required");
  }

  const existsByEmail = await userRepo.findByEmail({ email });
  if (existsByEmail) {
    throw new Error("User already exists with this email");
  }
  const existsByUsername = await userRepo.findByUsername(username);
  if (existsByUsername) {
    throw new Error("Username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 15);
  const srp = generateSRP();

  const user = await userRepo.createUser({
    authMethod: "email",
    username,
    email,
    password: hashedPassword,
    srp,
  });

  return {
    message: "User created successfully",
    srp,
    userId: user._id,
  };
};

exports.login = async ({ email, password, srp }) => {
  if (!email || !password || !srp) {
    throw new Error("All Fields are required");
  }

  const user = await userRepo.findByEmail({ email });
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const isSame = bcrypt.compareSync(password, user.password);

  if (!isSame) {
    throw new Error("Invalid Credentials");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" },
  );
  return {
    message: "Login Successfull",
    token,
  };
};

exports.signupWithWallet = async ({ walletName, address, type }) => {
  if (!walletName || !address) {
    throw new Error("Wallet name and address are required");
  }

  const existingUser = await userRepo.findByWalletAddress(address);
  if (existingUser) {
    throw new Error("An account with this wallet already exists. Use Login with Wallet.");
  }

  const srp = generateSRP();
  const user = await userRepo.createUser({
    authMethod: "wallet",
    srp,
    username: address,
    email: null,
    password: await bcrypt.hash(srp, 10),
    walletName,
    walletAddress: address,
  });

  const existingWallet = await walletRepo.findWallet({ srp, walletName, address });
  if (!existingWallet) {
    await walletRepo.createWallet({ srp, walletName, address });
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "20m" },
  );

  return {
    message: "Account created with wallet",
    token,
    srp,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      authMethod: "wallet",
    },
    primaryWallet: { walletName, address, type: type || "ethereum" },
  };
};

exports.loginWithWallet = async ({ walletName, address, type }) => {
  if (!walletName || !address) {
    throw new Error("Wallet name and address are required");
  }

  const user = await userRepo.findByWalletAddress(address);
  if (!user) {
    throw new Error("No account found for this wallet. Sign up with wallet first.");
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" },
  );

  return {
    message: "Login successful",
    token,
    srp: user.srp,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      authMethod: user.authMethod,
    },
    primaryWallet: {
      walletName,
      address,
      type: type || "ethereum",
    },
  };
};

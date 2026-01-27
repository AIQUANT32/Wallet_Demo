const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./database/User");
const Wallet = require("./database/Wallet");
const Transaction=require("./database/Transaction");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// SRP GENERATOR

const generateSRP = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let srp = "";

  for (let i = 0; i < 10; i++) {
    srp += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return srp;
};

// MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ROUTES

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// SIGN UP
app.post("/submit", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const srp = generateSRP();

    await User.create({
      firstName,
      lastName,
      email,
      password,
      srp,
    });

    res.status(201).json({
      message: "User created successfully",
      srp,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password, srp } = req.body;

    if (!email || !password || !srp) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email, password, srp });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// WALLET CONNECT
app.post("/api/wallet/connect", async (req, res) => {
  try {
    const { srp, walletName, address } = req.body;

    if (!srp || !walletName || !address) {
      return res.status(400).json({
        error: "Missing required fields: srp, walletName, address",
      });
    }

    const user = await User.findOne({ srp });
    if (!user) {
      return res.status(404).json({
        error: "User not found with the provided SRP",
      });
    }
    let wallet=await Wallet.findOne({srp,walletName,address});
    if(!wallet){
      wallet = await Wallet.create({
      srp,
      walletName,
      address,
      });
    }

    res.status(200).json({
      message: "Wallet connected successfully",
      wallet: {
        id: wallet._id,
        walletName: wallet.walletName,
        address: wallet.address,
        connectedAt: wallet.connectedAt,
      },
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/wallet/transaction", async(req,res) => {
  try{
    const{srp,walletName,from,to,amount,txHash}=req.body;

    if (!srp || !from || !to || !amount || !txHash) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ srp });
    if (!user) {
      return res.status(404).json({ error: "Invalid SRP" });
    }

    const tx = await Transaction.create({
      srp,
      walletName,
      from,
      to,
      amount,
      txHash,
    });

    res.status(201).json({
      message: "Transaction saved",
      transaction: tx,
    });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ error: "Transaction failed" });
  }
});

// SERVER START
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

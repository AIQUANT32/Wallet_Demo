const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
// const bcrypt = require("bcrypt");
// require("dotenv").config();

const authRoutes = require("./src/routes/auth.route");
const connectWallet = require("./src/routes/connectwallet.route");
const transaction = require("./src/routes/transaction.route");
const mint = require("./src/routes/mintnft.route");
const User = require("./src/models/user.model");
const Wallet = require("./src/models/wallet.model");
const Transaction = require("./src/models/transaction.model");
const Mint = require("./src/models/mint.model");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./src/middleware/auth");

const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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


app.use("/api/auth", authRoutes);
app.use("/api",connectWallet);
app.use("/api",transaction);
app.use("/api",mint);


// SIGN UP
// app.post("/submit", async (req, res) => {
  // try {
    // const { firstName, lastName, email, password } = req.body;
// 
    // if (!firstName || !lastName || !email || !password) {
      // return res.status(400).json({ error: "All fields are required" });
    // }
// 
    // const hashedPassword = await bcrypt.hash(password, 15);
    // console.log(hashedPassword);
// 
    // const userExists = await User.findOne({ email });
    // if (userExists) {
      // return res.status(400).json({ message: "User already exists" });
    // }
// 
    // const srp = generateSRP();
// 
    // console.log(srp)
// 
    // await User.create({
      // firstName,
      // lastName,
      // email,
      // password: hashedPassword,
      // srp,
    // });
// 
// 
// 
    // res.status(201).json({
      // message: "User created successfully",
      // srp,
    // });
  // } catch (error) {
    // console.error("Error creating user:", error);
    // res.status(500).json({ error: "Internal server error" });
  // }
// });

// LOGIN
// app.post("/login", async (req, res) => {
  // try {
    // const { email, password, srp } = req.body;
// 
    // if (!email || !password || !srp) {
      // return res.status(400).json({ error: "All fields are required" });
    // }
// 
    // const user = await User.findOne({ srp });
// 
    // if (!user) {
      // return res.status(401).json({ error: "Invalid credentials" });
    // }
// 
    // const isSame = bcrypt.compareSync(password, user.password);
    // console.log(isSame);
    // if (!isSame) {
      // return res.status(401).json({
        // error: "Invalid credentials"
      // });
    // }
// 
// 
    // const token = jwt.sign(
      // {
        // userId: user._id,
        // email: user.email,
      // },
      // process.env.ACCESS_TOKEN_SECRET,
      // { expiresIn: "1h" }
    // );
    // console.log(token);
// 
    // res.status(200).json({
      // message: "Login successful",
      // token,
      // user: {
        // id: user._id,
        // email: user.email,
        // firstName: user.firstName,
        // lastName: user.lastName,
      // },
    // });
  // } catch (error) {
    // console.error("Error during login:", error);
    // res.status(500).json({ error: "Internal server error" });
  // }
// });

// WALLET CONNECT
// app.post("/api/wallet/connect", async (req, res) => {
  // try {
    // const { srp, walletName, address } = req.body;
// 
    // if (!srp || !walletName || !address) {
      // return res.status(400).json({
        // error: "Missing required fields: srp, walletName, address",
      // });
    // }
// 
    // const user = await User.findOne({ srp });
    // if (!user) {
      // return res.status(404).json({
        // error: "User not found with the provided SRP",
      // });
    // }
    // let wallet = await Wallet.findOne({ srp, walletName, address });
    // if (!wallet) {
      // wallet = await Wallet.create({
        // srp,
        // walletName,
        // address,
      // });
    // }
// 
    // res.status(200).json({
      // message: "Wallet connected successfully",
      // wallet: {
        // id: wallet._id,
        // walletName: wallet.walletName,
        // address: wallet.address,
        // connectedAt: wallet.connectedAt,
      // },
    // });
  // } catch (error) {
    // console.error("Error connecting wallet:", error);
    // res.status(500).json({ error: "Internal server error" });
  // }
// });

// Store Transaction in MONGO
// app.post("/api/wallet/transaction", async (req, res) => {
//   try {
//     const { srp, walletName, from, to, amount, txHash } = req.body;

//     if (!srp || !from || !to || !amount || !txHash) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     const user = await User.findOne({ srp });
//     if (!user) {
//       return res.status(404).json({ error: "Invalid SRP" });
//     }

//     const tx = await Transaction.create({
//       srp,
//       walletName,
//       from,
//       to,
//       amount,
//       txHash,
//     });

//     res.status(201).json({
//       message: "Transaction saved",
//       transaction: tx,
//     });
//   } catch (err) {
//     console.error("Transaction error:", err);
//     res.status(500).json({ error: "Transaction failed" });
//   }
// });

app.post("/api/mint", async (req, res) => {
  try {
    const { owner, nftName, txHash } = req.body;

    if (!owner || !nftName || !txHash) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exist = await Mint.findOne({ nftName });
    if (exist) {
      return res.status(409).json({ error: "NFT already Created" });
    }

    const tx = await Mint.create({
      owner,
      nftName,
      txHash,
    });

    return res.status(201).json({
      message: "Transaction saved",
      transaction: tx,
    });
  }
  catch (err) {
    console.error(err);
  }
});

// SERVER START
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

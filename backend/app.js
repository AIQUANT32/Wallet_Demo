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
const swaggerUi = require("swagger-ui-express")
const authenticateToken = require("./src/middleware/auth");
const swaggerJSDoc = require("swagger-jsdoc");

const app = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet_Demo',
      version: '1.0'
    },
    servers:[
      {
        url:"http://localhost:5000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis:['./src/routes/*.js']
}

const swaggerSpecs =  swaggerJSDoc(options)


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
app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(swaggerSpecs))
app.use(authenticateToken)
app.use("/api",connectWallet);
app.use("/api",transaction);
app.use("/api",mint);



// SERVER START
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

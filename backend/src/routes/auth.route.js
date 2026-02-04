const router = require("express").Router();
const controller = require("../controller/auth.controller");

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new account using name, email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: Harjyot Singh
 *               email:
 *                 type: string
 *                 example: harjyot@gmail.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/signup", controller.signup);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Login using email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: harjyot@gmail.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *               srp:
 *                 type: string
 *                 example: OFzeQdaPMf
 *     responses:
 *       200:
 *         description: Login successful (JWT returned)
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", controller.login);
/**
 * @swagger
 * /api/auth/signup-with-wallet:
 *   post:
 *     summary: Register using wallet
 *     description: Creates account using blockchain wallet address instead of password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletName:
 *                 type: String
 *                 example: Metamask
 *               address:
 *                 type: string
 *                 example: addr1qx2fxv2umy...
 *     responses:
 *       201:
 *         description: Wallet signup successful
 *       400:
 *         description: Wallet already registered
 */
router.post("/signup-with-wallet", controller.signupWithWallet);
/**
 * @swagger
 * /api/auth/login-with-wallet:
 *   post:
 *     summary: Login using wallet
 *     description: Authenticates user via wallet address or signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletName:
 *                 type: String
 *                 example: Metamask
 *               address:
 *                 type: string
 *                 example: addr1qx2fxv2umy...
 *     responses:
 *       200:
 *         description: Wallet login successful
 *       401:
 *         description: Wallet not registered
 */
router.post("/login-with-wallet", controller.loginWithWallet);

module.exports = router;
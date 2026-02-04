const router = require("express").Router();
const controller = require("../controller/connectwallet.controller");
/**
 * @swagger
 * /api/connect:
 *   post:
 *     summary: Connect wallet
 *     description: Authenticates or registers a user using their blockchain wallet address
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               srp:
 *                 type: string
 *                 description: Unique passkey of user
 *                 example: OFzeQdaPMf
 *               walletName:
 *                 type: string
 *                 description: Public wallet address of the user
 *                 example: addr1qx2fxv2umyhtk5d8s9example
 *               address:
 *                 type: string
 *                 description: Signed message for verification (optional)
 *                 example: 0x98af34bcd123...
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: jwt_token_here
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *       401:
 *         description: Invalid signature or wallet
 *       500:
 *         description: Server error
 */
router.post("/connect", controller.connect);

module.exports = router;
const transactionController = require("../controller/transaction.controller");
const router = require("express").Router();

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Create blockchain transaction
 *     description: Sends funds or tokens from one wallet to another
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *               - to
 *               - amount
 *             properties:
 *               from:
 *                 type: string
 *                 description: Sender wallet address
 *                 example: addr1senderxyz
 *               to:
 *                 type: string
 *                 description: Receiver wallet address
 *                 example: addr1receiverxyz
 *               amount:
 *                 type: number
 *                 example: 10
 *               token:
 *                 type: string
 *                 description: Token name (optional)
 *                 example: ADA
 *     responses:
 *       200:
 *         description: Transaction successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txHash:
 *                   type: string
 *                   example: 0x987hashabc
 *       400:
 *         description: Invalid transaction
 *       500:
 *         description: Transaction failed
 */
router.post("/transaction",transactionController.transaction);

module.exports = router;
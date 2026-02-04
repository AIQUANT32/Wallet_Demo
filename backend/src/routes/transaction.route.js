const transactionController = require("../controller/transaction.controller");
const router = require("express").Router();

/**
 * @swagger
 * /api/transaction :
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - srp
 *               - walletName
 *               - from
 *               - to
 *               - amount
 *               - txHash
 *             properties:
 *               srp:
 *                 type: string
 *                 example: "seed-phrase-123"
 *               walletName:
 *                 type: string
 *                 example: "MetaMask"
 *               from:
 *                 type: string
 *                 example: "0xabc123..."
 *               to:
 *                 type: string
 *                 example: "0xdef456..."
 *               amount:
 *                 type: number
 *                 example: 1.5
 *               txHash:
 *                 type: string
 *                 example: "0x9a8b7c6d..."
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/transaction",transactionController.transaction);

module.exports = router;
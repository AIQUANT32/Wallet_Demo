const mintNFTRoute = require("../controller/mintnft.controller");
const router = require("express").Router();

/**
 * @swagger
 * /api/mint:
 *   post:
 *     summary: Mint a new NFT
 *     tags: [NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner
 *               - nftName
 *               - txHash
 *             properties:
 *               owner:
 *                 type: string
 *                 description: Wallet address of NFT owner
 *                 example: "0xabc123..."
 *               nftName:
 *                 type: string
 *                 description: Name of the NFT
 *                 example: "ByteBattles Genesis #1"
 *               txHash:
 *                 type: string
 *                 description: Blockchain transaction hash
 *                 example: "0x9f8e7d6c..."
 *     responses:
 *       201:
 *         description: NFT minted successfully
 *       400:
 *         description: Invalid input
 */


router.post("/mint",mintNFTRoute.mintNFTController);

module.exports = router;
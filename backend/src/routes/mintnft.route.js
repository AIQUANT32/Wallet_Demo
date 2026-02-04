const mintNFTRoute = require("../controller/mintnft.controller");
const router = require("express").Router();

/**
 * @swagger
 * /nft/mint:
 *   post:
 *     summary: Mint a new NFT
 *     description: Creates and mints a new NFT on the blockchain for the provided wallet address
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
 *             properties:
 *               owner:
 *                 type: string
 *                 description: Wallet address of the NFT owner
 *                 example: addr1qx2fxv2umyhtk5example
 *               nftName:
 *                 type: string
 *                 description: Name of the NFT
 *                 example: ByteBattles Trophy
 *               metadata:
 *                 type: object
 *                 description: Optional NFT metadata
 *     responses:
 *       201:
 *         description: NFT minted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txHash:
 *                   type: string
 *                   example: 0xabc123hash
 *                 nftId:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Minting failed
 */
router.post("/mint",mintNFTRoute.mintNFTController);

module.exports = router;
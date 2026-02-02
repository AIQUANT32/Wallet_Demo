const mintNFTRoute = require("../controller/mintnft.controller");
const router = require("express").Router();

router.post("/mint",mintNFTRoute.mintNFTController);

module.exports = router;
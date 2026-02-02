const router = require("express").Router();
const controller = require("../controller/connectwallet.controller");

router.post("/connect", controller.connect);

module.exports = router;
const router = require("express").Router();
const controller = require("../controller/auth.controller");

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/signup-with-wallet", controller.signupWithWallet);
router.post("/login-with-wallet", controller.loginWithWallet);

module.exports = router;
const transactionController = require("../controller/transaction.controller");
const router = require("express").Router();

router.post("/transaction",transactionController.transaction);

module.exports = router;
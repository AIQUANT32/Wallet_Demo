const Transaction = require("../models/transaction.model")

exports.createTransaction = ({srp,walletName, from, to, amount, txHash}) => {
    return Transaction.create({
        srp,
        walletName,
        from,
        to,
        amount,
        txHash,
    })
}
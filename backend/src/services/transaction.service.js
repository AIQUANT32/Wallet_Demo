const Transaction = require("../repo/transaction.repo")

exports.transactionService = async ({srp,walletName, from, to, amount, txHash}) => {
    if(!srp || !walletName || !from || !to || !amount || !txHash){
        throw new Error("All fields are required");
    }
    
    await Transaction.createTransaction({srp,walletName, from, to, amount, txHash});
}
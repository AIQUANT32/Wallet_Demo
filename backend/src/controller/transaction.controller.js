const transactionController = require("../services/transaction.service");

exports.transaction = async (req,res) => {
    try{
        const result = await transactionController.transactionService(req.body);
        res.status(201).json(result);
    }
    catch(err){
        res.status(400).json({error: err.message});
    }
}
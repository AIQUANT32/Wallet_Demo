const walletconnect = require("../services/connectwallet.service");

exports.connect = async (req,res) => {
    try{
        const result = await walletconnect.connect(req.body);
        res.status(201).json(result);
    }
    catch(err){
        res.status(400).json({error: err.message});
    }
}
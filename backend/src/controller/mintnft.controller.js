const mintNFTService = require("../services/mintnft.services");

exports.mintNFTController = async (req,res) => {
    try{
        const result = await mintNFTService.mint(req.body);
        res.status(201).json(result);
    }
    catch(err){
        res.status(400).json({error: err.message});
    }
}
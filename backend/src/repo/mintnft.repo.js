const mintSchema = require("../models/transaction.model")

exports.createNFT = ({owner, nftName, txHash}) => {
    return mintSchema.create({
        owner, nftName, txHash
    })
}

exports.nftExists = ({nftName}) => {
    return mintSchema.findOne({
        nftName,
    })
}
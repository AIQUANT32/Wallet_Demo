const walletRepo = require("../repo/connectwallet.repo");

exports.connect = async ({srp, walletName, address}) => {
    if(!srp || !walletName || !address){
        throw new Error("Not all data received");
    }

    const exists = await walletRepo.findWallet({srp, walletName, address});
    if(!exists){
        walletRepo.createWallet({srp, walletName, address});
    }
}
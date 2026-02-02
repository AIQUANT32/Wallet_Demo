const mintRepo = require("../repo/mintnft.repo");

exports.mint = async ({owner, nftName, txHash}) => {
    if(!owner || !nftName || !txHash){
        throw new Error("All fields are not recieved");
    }

    if(await mintRepo.nftExists(nftName)){
        throw new Error("NFT already Exists");
    }
    else{
        await mintRepo.createNFT({owner, nftName, txHash});
    }
}
import { ethers } from "ethers";
import { useState } from "react";
import ABI from "../ABI.json";
import "./NFT.css";

export default function NFT() {
  const [receiver, setReceiver] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [nftName, setnftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftImageURL, setNftImageURL] = useState(null);
  const [nameError, setNameError] = useState("");

  const isValidName = (nftName) => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com#AIQUANT\d+$/;
    return regex.test(nftName);
  };

  const getContract = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    console.log(contractAddress);
    const abi = ABI;
    const contract = new ethers.Contract(contractAddress, abi, signer);

    return { contract, signer };
  };

  const mintNFT = async () => {
    try {
      const { contract, signer } = await getContract();
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: nftImageURL,
      };
      const tokenURI =
        "data:application/json;base64," + btoa(JSON.stringify(metadata));
      // console.log(tokenURI);
      const tx = await contract.awardItem(await signer.getAddress(), tokenURI);
      const receipt = await tx.wait();
      // console.log(receipt);
      console.log("NFT Minted");

      const res= await fetch('http://localhost:5000/api/mint',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: localStorage.getItem('srp'),
          nftName: nftName,
          txHash: receipt.hash,
        })
      })
      const data= await res.json();
      if(res.ok){
        console.log(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendNFT = async () => {
    try {
      if (!receiver || !tokenId) {
        alert("Enter all the Fields");
        return;
      }
      const { contract, signer } = await getContract();

      const senderAddress = await signer.getAddress();
      const tx = await contract.safeTransferFrom(
        senderAddress,
        receiver,
        tokenId,
      );

      const receipt = await tx.wait();
      console.log("NFT Transffered");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <input
          className="dashboard-input mono"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => {
            const value = e.target.value;
            setnftName(e.target.value);

            if (!isValidName(value)) {
              setNameError("Format must be: abc@gmail.com#AIQUANT<number>");
            } else {
              setNameError("");
            }
          }}
        />
        <br />
        {nameError && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "8px" }}>
            {nameError}
          </p>
        )}

        <input
          className="dashboard-input mono"
          placeholder="Description"
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
        />
        <br />
        <input
          className="dashboard-input mono"
          placeholder="Image URL"
          value={nftImageURL}
          onChange={(e) => setNftImageURL(e.target.value)}
        />
        <button
          className="primary-button"
          onClick={mintNFT}
          disabled={nameError}
        >
          Mint NFT
        </button>

        <hr className="divider" />

        <input
          className="dashboard-input mono"
          placeholder="Receiver Address"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />

        <input
          className="dashboard-input mono"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />

        <button className="secondary-button" onClick={sendNFT}>
          Send NFT
        </button>
      </div>
    </div>
  );
}

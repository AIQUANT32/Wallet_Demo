import { useState } from "react";
import { ethers } from "ethers";
import {Lucid, Blockfrost} from "lucid-cardano";
import "./Dashboard.css";

// WALLET DETECTION

const detectWalletOptions = () => {
  const options = [];

  // MetaMask (Ethereum)
  if (window.ethereum) {
    const providers = window.ethereum.providers || [window.ethereum];
    providers.forEach((provider) => {
      if (provider.isMetaMask) {
        options.push({
          name: "MetaMask",
          type: "ethereum",
          provider,
        });
      }
    });
  }

  // Cardano wallets
  if (window.cardano) {
    if (window.cardano.eternl) {
      options.push({ name: "Eternl", type: "cardano", wallet: window.cardano.eternl });
    }
    if (window.cardano.lace) {
      options.push({ name: "Lace", type: "cardano", wallet: window.cardano.lace });
    }
  }

  return options;
};

function Dashboard() {
  const [walletOptions, setWalletOptions] = useState([]);
  const [selected, setSelected] = useState("");
  const [connectedInfo, setConnectedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toAddress,setToAddress] = useState("");
  const [amount,setAmount] = useState("");
  const [txHash, setTxHash] = useState("");

  // CONNECT CLICK
  const handleConnectClick = () => {
    const detected = detectWalletOptions();
    if (!detected.length) {
      alert("No supported wallets found");
      return;
    }
    setWalletOptions(detected);
  };

  // Switch to testnet
  async function switchToSepolia() {
  if (window.ethereum) {
    const SEPOLIA_CHAIN_ID = process.env.REACT_APP_SEPOLIA_CHAIN_ID;
    const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
    try {
      // 11155111 in decimal is 0xaa36af in hex
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID}],
      });
      console.log("Switched to Sepolia successfully");
    } catch (switchError) {
      // 4902 error code indicates the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                rpcUrls: [SEPOLIA_RPC_URL], // Alternative: Infura/Alchemy
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Sepolia:", addError);
        }
      } else {
        console.error("Failed to switch to Sepolia:", switchError);
      }
    }
  } else {
    console.error("MetaMask is not installed");
  }
}

  // CONNECT SELECTED

  const connectSelectedWallet = async () => {
    const wallet = walletOptions.find((w) => w.name === selected);
    if (!wallet) return;

    const srp = sessionStorage.getItem("srp") || localStorage.getItem("srp");
    if (!srp) {
      alert("SRP not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setToAddress("");
      setAmount("");
      setTxHash("");
      
      let address = null;
      let bal=null;

      // Ethereum
      if (wallet.type === "ethereum") {
        await switchToSepolia()
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log(network);
        const signer = await provider.getSigner();
        address = await signer.getAddress();
        bal=await provider.getBalance(address);
        bal=`${ethers.formatEther(bal)} ETH`
        console.log(process.env.REACT_APP_BLOCKFROST_KEY);
        console.log(bal);
      }

      // Cardano
      if (wallet.type === "cardano") {
        const api = await wallet.wallet.enable();
        address = await api.getChangeAddress();
        console.log(process.env.REACT_APP_BLOCKFROST_KEY);
        const lucid = await Lucid.new(
          new Blockfrost(
            "https://cardano-preprod.blockfrost.io/api/v0",
            process.env.REACT_APP_BLOCKFROST_KEY
          ),
          "Preprod"
        );

        lucid.selectWallet(api);
        const utxos = await lucid.wallet.getUtxos();

        let totalLovelace = 0n;
        utxos.forEach((u) => {
          totalLovelace += u.assets.lovelace || 0n;
        });

        bal = `${Number(totalLovelace) / 1_000_000} ADA`;
        console.log(bal);
      }

      setConnectedInfo({
        wallet: wallet.name,
        type:wallet.type,
        address,
        bal,
      });

      // Save wallet
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/wallet/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ srp, 
          walletName: wallet.name,
          address 
        }),
      });
    } catch (err) {
      alert(err.message || "Error connecting wallet");
    } finally {
      setLoading(false);
    }
  };

  // TRANSACTIONS

  const sendTransaction = async() => {
    if(!connectedInfo){
      return alert("Connect wallet first");
    }
    let hash;
    if(connectedInfo.type==="ethereum"){
      const provider = new ethers.BrowserProvider(window.ethereum);
      // console.log(provider);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount),
      });

      const receipt = await tx.wait();
      hash = receipt.hash;

      // console.log(hash);
    }
    if(connectedInfo.type==="cardano"){
      const api = await window.cardano[
        connectedInfo.wallet.toLowerCase()
      ].enable();

      const lucid = await Lucid.new(
        new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0",
          process.env.REACT_APP_BLOCKFROST_KEY,
        ),
        "Preprod"
      );

      lucid.selectWallet(api);

      const tx=await lucid.newTx().payToAddress(
        toAddress,{
          lovelace: amount*1000000,
        }
      ).complete();

      const signed=await tx.sign().complete();
      hash = await signed.submit();
    }

    setTxHash(hash);

    const srp=localStorage.getItem("srp");
    await fetch("http://localhost:5000/api/wallet/transaction",{
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        srp,
        walletName: connectedInfo.wallet,
        from: connectedInfo.address,
        to: toAddress,
        amount,
        txHash: hash,
      }),
    });
  };

  return (
  <div className="dashboard-container">
    <div className="dashboard-card">
      <h1 className="dashboard-title">Wallet Dashboard</h1>
      <p className="dashboard-subtitle">
        Connect your blockchain wallet securely
      </p>

      <button
        className="primary-button"
        onClick={handleConnectClick}
      >
        Detect Wallets
      </button>

      {walletOptions.length > 0 && (
        <div className="wallet-select">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select Wallet</option>
            {walletOptions.map((w) => (
              <option key={w.name} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>

          <button
            className="secondary-button"
            onClick={connectSelectedWallet}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      )}

      {connectedInfo && (
        <div className="wallet-info">
          <h3>Connected Wallet</h3>

          <div className="wallet-row">
            <span>Wallet</span>
            <p>{connectedInfo.wallet}</p>
          </div>

          <div className="wallet-row">
            <span>Address</span>
            <p className="mono">{connectedInfo.address}</p>
          </div>

          <div className="wallet-row">
            <span>Balance</span>
            <p className="mono">{connectedInfo.bal}</p>
          </div>

          <h3>Send Transaction</h3>

          <input
            placeholder="Receiver address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />

          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            className="primary-button"
            onClick={sendTransaction}
          >
            Send
          </button>

          {txHash && (
            <div className="wallet-row">
              <span>Transaction Hash</span>
              <p className="mono">{txHash}</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
}

export default Dashboard;
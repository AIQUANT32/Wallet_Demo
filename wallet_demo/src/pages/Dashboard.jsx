import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Lucid, Blockfrost } from "lucid-cardano";
import { useNavigate } from "react-router-dom";
import { detectWalletOptions, switchToSepolia } from "../utils/walletUtils";
import "./Dashboard.css";

function Dashboard() {
  const [walletOptions, setWalletOptions] = useState([]);
  const [selected, setSelected] = useState("");
  const [connectedInfo, setConnectedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const navigate = useNavigate();

  // Preload wallet from "Connect with Wallet" signup/login
  useEffect(() => {
    const primaryWallet = localStorage.getItem("primaryWallet");
    if (!primaryWallet) return;
    try {
      const { walletName, address, type } = JSON.parse(primaryWallet);
      setConnectedInfo({
        wallet: walletName,
        type: type || "ethereum",
        address,
        bal: "Loading...",
      });
      (async () => {
        try {
          let bal = "—";
          if (type === "ethereum") {
            await switchToSepolia();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const balance = await provider.getBalance(address);
            bal = `${ethers.formatEther(balance)} ETH`;
          } else if (type === "cardano" && window.cardano?.[walletName.toLowerCase()]) {
            const api = await window.cardano[walletName.toLowerCase()].enable();
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
          }
          setConnectedInfo((prev) => (prev ? { ...prev, bal } : null));
        } catch (err) {
          setConnectedInfo((prev) => (prev ? { ...prev, bal: "Error loading" } : null));
        }
      })();
    } catch (e) {
      // ignore invalid primaryWallet
    }
  }, []);

  // CONNECT CLICK
  const handleConnectClick = () => {
    const detected = detectWalletOptions();
    if (!detected.length) {
      alert("No supported wallets found");
      return;
    }
    setWalletOptions(detected);
  };

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
        await switchToSepolia();
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
      await fetch("http://localhost:5000/api/connect", {
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

        <button className="primary-button" onClick={handleConnectClick}>
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

            <button className="create-nft-btn" onClick={() => navigate("/nft")} disabled={connectedInfo.type!=="ethereum"}>
              Create NFT
            </button>

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

            <button className="primary-button" onClick={sendTransaction}>
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
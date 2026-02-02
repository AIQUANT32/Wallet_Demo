import { ethers } from "ethers";

export const detectWalletOptions = () => {
  const options = [];

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

export async function switchToSepolia() {
  if (window.ethereum) {
    const SEPOLIA_CHAIN_ID = process.env.REACT_APP_SEPOLIA_CHAIN_ID;
    const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 && SEPOLIA_CHAIN_ID && SEPOLIA_RPC_URL) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              rpcUrls: [SEPOLIA_RPC_URL],
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }
}

export async function getAddressFromWallet(walletOption) {
  if (walletOption.type === "ethereum") {
    await switchToSepolia();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { address, walletName: walletOption.name, type: "ethereum" };
  }

  if (walletOption.type === "cardano") {
    const api = await walletOption.wallet.enable();
    const address = await api.getChangeAddress();
    return { address, walletName: walletOption.name, type: "cardano" };
  }

  throw new Error("Unsupported wallet type");
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { detectWalletOptions, getAddressFromWallet } from "../utils/walletUtils";
import "./SignUp.css";

const API_BASE = "http://localhost:5000/api";

function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [walletOptions, setWalletOptions] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [showWalletSelect, setShowWalletSelect] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleConnectWithWalletClick = () => {
    const detected = detectWalletOptions();
    if (!detected.length) {
      setError("No supported wallets found. Install MetaMask or a Cardano wallet.");
      return;
    }
    setError("");
    setWalletOptions(detected);
    setShowWalletSelect(true);
  };

  const handleWalletSignup = async () => {
    const wallet = walletOptions.find((w) => w.name === selectedWallet);
    if (!wallet) {
      setError("Please select a wallet");
      return;
    }
    try {
      setWalletLoading(true);
      setError("");
      const { address, walletName, type } = await getAddressFromWallet(wallet);
      const res = await fetch(`${API_BASE}/auth/signup-with-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletName, address, type }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("srp", data.srp);
        localStorage.setItem("primaryWallet", JSON.stringify(data.primaryWallet));
        navigate("/dashboard");
      } else {
        setError(data.error || "Sign up with wallet failed");
      }
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      return setError("Username is required");
    }
    if (!formData.email) {
      return setError("Email is required");
    }
    if (!formData.password) {
      return setError("Please enter a secure password");
    }

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("srp", data.srp);
        navigate("/srp");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create account</h1>
          <p>Get started in less than a minute</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-button" type="submit">
            Create account
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          {!showWalletSelect ? (
            <button
              type="button"
              className="secondary-button"
              onClick={handleConnectWithWalletClick}
            >
              Connect with Wallet
            </button>
          ) : (
            <div className="wallet-select-auth">
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <option value="">Select wallet</option>
                {walletOptions.map((w) => (
                  <option key={w.name} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="primary-button"
                onClick={handleWalletSignup}
                disabled={walletLoading || !selectedWallet}
              >
                {walletLoading ? "Connecting..." : "Sign up with Wallet"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowWalletSelect(false);
                  setSelectedWallet("");
                }}
              >
                Back
              </button>
            </div>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;

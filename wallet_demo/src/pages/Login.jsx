import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { detectWalletOptions, getAddressFromWallet } from "../utils/walletUtils";
import "./SignUp.css";

const API_BASE = "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    srp: "",
  });
  const [error, setError] = useState("");
  const [walletOptions, setWalletOptions] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [showWalletSelect, setShowWalletSelect] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleWalletLogin = async () => {
    const wallet = walletOptions.find((w) => w.name === selectedWallet);
    if (!wallet) {
      setError("Please select a wallet");
      return;
    }
    try {
      setWalletLoading(true);
      setError("");
      const { address, walletName, type } = await getAddressFromWallet(wallet);
      const res = await fetch(`${API_BASE}/auth/login-with-wallet`, {
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
        setError(data.error || "Login with wallet failed");
      }
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.srp) {
      setError('Please enter all the Details');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          srp: formData.srp
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store JWT token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Store SRP in localStorage for wallet connections
        localStorage.setItem('srp', formData.srp);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

 return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Log in to continue to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <input
            type="password"
            name="srp"
            placeholder="Secret Recovery Phrase"
            value={formData.srp}
            onChange={handleChange}
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-button" type="submit">
            Log in
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
                onClick={handleWalletLogin}
                disabled={walletLoading || !selectedWallet}
              >
                {walletLoading ? "Connecting..." : "Log in with Wallet"}
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
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

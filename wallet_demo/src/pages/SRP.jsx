import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SRP() {
  const [srp, setSrp] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("srp");
    if (!stored) {
      navigate("/");
      return;
    }
    setSrp(stored);
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(srp);
    alert("SRP copied!");
  };

  return (
    <div className="srp-container">
      <div className="srp-card">
        <h1 className="srp-title">Secret Recovery Phrase</h1>

        <p className="srp-warning">
          Save this carefully. It will <b>not</b> be shown again.
        </p>

        <div className="srp-box">
          {srp}
        </div>

        <button className="primary-button" onClick={copyToClipboard}>
          Copy to clipboard
        </button>

        <button
          className="secondary-button"
          onClick={() => navigate("/login")}
        >
          Proceed to login
        </button>
      </div>
    </div>
  );
}

export default SRP;

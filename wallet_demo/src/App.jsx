import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";

const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SRP = lazy(() => import("./pages/SRP"));
const NFT = lazy(() => import("./pages/NFT"));

function App() {
  return (
    <Router>
      <Suspense fallback= "Loading">
        <div className="app">
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/srp" element={<SRP />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nft" element={<NFT />} />
            <Route path="/" element={<Navigate to="/signup" replace />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
}

export default App;

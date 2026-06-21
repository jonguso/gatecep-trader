import { useNavigate } from "react-router-dom";

export default function InvestorHome() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Start with Coach G</h1>
      <button onClick={() => navigate("/mobile/broker-link")}>Existing Investor</button>
      <button onClick={() => navigate("/mobile/new-investor")}>New Investor</button>
    </div>
  );
}

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Dashboard from "./mobile/MobileBrokerMirrorRebalance";
import MobileNewInvestorWizard from "./mobile/MobileNewInvestorWizard";
import MobileBrokerLink from "./mobile/MobileBrokerLink";
import MobileBrokerUpload from "./mobile/MobileBrokerUpload";
import MobileBrokerMirrorHome from "./mobile/MobileBrokerMirrorHome";
import MobileBrokerMirrorRebalance from "./mobile/MobileBrokerMirrorRebalance";
import MobileHoldingDetails from "./mobile/MobileHoldingDetails";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/mobile" element={<Dashboard />} />
      <Route path="/mobile/investor-home" element={<Dashboard />} />

      <Route path="/mobile/new-investor" element={<MobileNewInvestorWizard />} />
      <Route path="/mobile/broker-link" element={<MobileBrokerLink />} />
      <Route path="/mobile/broker-home" element={<MobileBrokerMirrorHome />} />
      <Route path="/mobile/broker-upload" element={<MobileBrokerUpload />} />
      <Route path="/mobile/broker-rebalance" element={<MobileBrokerMirrorRebalance />} />
      <Route path="/mobile/holding-details" element={<MobileHoldingDetails />} />

      <Route path="*" element={<Navigate to="/Dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
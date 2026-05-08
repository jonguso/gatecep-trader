import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import ExecutionAnalyticsPage from "./pages/ExecutionAnalyticsPage";
import LiveOrderExecutionPanel from "./components/orders/LiveOrderExecutionPanel";
import TradeBlotterPage from "./pages/TradeBlotterPage";
import PortfolioDashboard from "./components/PortfolioDashboard";
import PortfolioPerformanceChart from "./components/PortfolioPerformanceChart";
import SettlementLedgerPanel from "./components/SettlementLedgerPanel";
import ComplianceSurveillancePanel from "./components/ComplianceSurveillancePanel";
import AdminControlCenter from "./components/AdminControlCenter";

function HomePage() {
  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">
        Gatecep OMS Dashboard
      </h1>
      <AdminControlCenter />
      <PortfolioDashboard />
      <PortfolioPerformanceChart />
      <SettlementLedgerPanel />
      <ComplianceSurveillancePanel />
      <LiveOrderExecutionPanel />
    </div>
  );
}

function Navigation() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex gap-6">
      <Link
        to="/"
        className="text-white hover:text-cyan-400 font-medium"
      >
        Execution Queue
      </Link>

      <Link
        to="/execution-analytics"
        className="text-white hover:text-cyan-400 font-medium"
      >
        OMS Analytics
      </Link>

      <Link
        to="/trade-blotter"
        className="text-white hover:text-cyan-400 font-medium"
      >
        Trade Blotter
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <Navigation />

        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/execution-analytics"
            element={<ExecutionAnalyticsPage />}
          />

          <Route
            path="/trade-blotter"
            element={<TradeBlotterPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}
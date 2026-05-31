import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

import AdminControlCenter from "./components/AdminControlCenter";
import PortfolioDashboard from "./components/PortfolioDashboard";
import PortfolioPerformanceChart from "./components/PortfolioPerformanceChart";
import SettlementLedgerPanel from "./components/SettlementLedgerPanel";
import ComplianceSurveillancePanel from "./components/ComplianceSurveillancePanel";
import MobileBottomNav from "./components/mobile/MobileBottomNav";

import LiveOrderExecutionPanel from "./components/orders/LiveOrderExecutionPanel";
import ExecutionAnalyticsPage from "./pages/ExecutionAnalyticsPage";
import TradeBlotterPage from "./pages/TradeBlotterPage";
import LivePortfolioPnLPanel from "./components/LivePortfolioPnLPanel";
import NSEMarketOverviewPanel from "./components/NSEMarketOverviewPanel";
import MarketMoversPanel from "./components/MarketMoversPanel";
import TimeSalesTape from "./components/TimeSalesTape";
import TradingTerminalPage from "./pages/TradingTerminalPage";
import MobileCoachHome from "./mobile/MobileCoachHome";
import MobileMarkets from "./mobile/MobileMarkets";
import MobilePortfolio from "./mobile/MobilePortfolio";
import MobileStockDetails from "./mobile/MobileStockDetails";
import MobileOrderTicket from "./mobile/MobileOrderTicket";
import MobileDepositFunds from "./mobile/MobileDepositFunds";
import MobileWallet from "./mobile/MobileWallet";
import MobileNotifications from "./mobile/MobileNotifications";
import MobileWatchlist from "./mobile/MobileWatchlist";
import MobileDividends from "./mobile/MobileDividends";
import MobileDividendAI from "./mobile/MobileDividendAI";
import MobileAIRebalance from "./mobile/MobileAIRebalance";
import MobilePortfolioHeatmap from "./mobile/MobilePortfolioHeatmap";
import MobileMarketPulse from "./mobile/MobileMarketPulse";
import MobileSectorRotation from "./mobile/MobileSectorRotation";
import MobilePortfolioScore from "./mobile/MobilePortfolioScore";
import MobileTradeJournal from "./mobile/MobileTradeJournal";
import MobileFunds from "./mobile/MobileFunds";
import MobileBrokerTreasury from "./mobile/MobileBrokerTreasury";
import MobileOrders from "./mobile/MobileOrders";
import MobileModifyOrder from "./mobile/MobileModifyOrder";
import MobileBrokerMirrorRebalance from "./mobile/MobileBrokerMirrorRebalance";
import MobileBrokerMirrorHome from "./mobile/MobileBrokerMirrorHome";
import MobileBrokerUpload from "./mobile/MobileBrokerUpload";
import MobileHoldingDetails from "./mobile/MobileHoldingDetails";

import OrderSplitterPanel from "./components/OrderSplitterPanel";
import ChildOrderExecutionPanel from "./components/ChildOrderExecutionPanel";
import LiveMarketTicker from "./components/LiveMarketTicker";
import ProfessionalChart from "./components/ProfessionalChart";
import CoachGSignalsPanel from "./components/CoachGSignalsPanel";
import WatchlistPanel from "./components/WatchlistPanel";
import BrokerAccountsPanel from "./components/BrokerAccountsPanel";
import PnlAnalyticsPanel from "./components/PnlAnalyticsPanel";
import FixSessionPanel from "./components/FixSessionPanel";
import AuditExportCenter from "./components/AuditExportCenter";
import NotificationCenter from "./components/NotificationCenter";
import RebalancerPanel from "./components/RebalancerPanel";
import ErrorBoundary from "./components/ErrorBoundary";

function HomePage() {
  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <AdminControlCenter />

      <LivePortfolioPnLPanel />
      
      <NotificationCenter />
      
      <RebalancerPanel />
     
      <ProfessionalChart />

      <CoachGSignalsPanel />

      <WatchlistPanel />

      <NSEMarketOverviewPanel />

      <MarketMoversPanel />

      <TimeSalesTape />

      <BrokerAccountsPanel />

      <FixSessionPanel />

     <AuditExportCenter />

      <PortfolioDashboard />

      <PortfolioPerformanceChart />

      <SettlementLedgerPanel />

      <PnlAnalyticsPanel />

      <ComplianceSurveillancePanel />

      <LiveOrderExecutionPanel />

      <OrderSplitterPanel />

      <ChildOrderExecutionPanel />
    </div>
  );
}

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
      <div className="flex gap-6">
        <Link
          to="/"
          className="text-white hover:text-cyan-400 font-medium"
        >
          Dashboard
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

<Link
  to="/trading-terminal"
  className="text-white hover:text-cyan-400 font-medium"
>
  Trading Terminal
</Link>

      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-300">
          {user?.username} ({user?.role})
        </div>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-500 rounded-lg px-4 py-2 text-sm font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
           <LiveMarketTicker />
              <Navigation />
              <HomePage />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/execution-analytics"
        element={
          <ProtectedRoute
            roles={[
              "ADMIN",
              "TRADER",
              "RISK_MANAGER"
            ]}
          >
            <>
              <Navigation />
              <ExecutionAnalyticsPage />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/trade-blotter"
        element={
          <ProtectedRoute
            roles={[
              "ADMIN",
              "TRADER",
              "COMPLIANCE"
            ]}
          >
            <>
              <Navigation />
              <TradeBlotterPage />
                         
            </>
          </ProtectedRoute>
        }
      />
<Route
  path="/trading-terminal"
  element={
    <ProtectedRoute>
      <>
        <Navigation />
        <TradingTerminalPage />
      </>
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile"
  element={
    <ProtectedRoute>
      <MobileCoachHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/markets"
  element={
    <ProtectedRoute>
      <MobileMarkets />
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/pro"
  element={
    <ProtectedRoute>
      <>
        <ExecutionAnalyticsPage />
        <MobileBottomNav />
      </>
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/deposit"
  element={
    <ProtectedRoute>
      <MobileDepositFunds />
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/wallet"
  element={
    <ProtectedRoute>
      <MobileWallet />
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/order/:symbol/:side"
  element={
    <ProtectedRoute>
      <MobileOrderTicket />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/portfolio"
  element={
    <ProtectedRoute>
      <MobilePortfolio />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/stock/:symbol"
  element={
    <ProtectedRoute>
      <MobileStockDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/notifications"
  element={
    <ProtectedRoute>
      <MobileNotifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/watchlist"
  element={
    <ProtectedRoute>
      <MobileWatchlist />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/dividends"
  element={
    <ProtectedRoute>
      <MobileDividends />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/dividends-ai"
  element={
    <ProtectedRoute>
      <MobileDividendAI />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/ai-rebalance"
  element={
    <ProtectedRoute>
      <MobileAIRebalance />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/market-pulse"
  element={
    <ProtectedRoute>
      <MobileMarketPulse />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/sector-rotation"
  element={
    <ProtectedRoute>
      <MobileSectorRotation />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/portfolio-heatmap"
  element={
    <ProtectedRoute>
      <MobilePortfolioHeatmap />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/portfolio-score"
  element={
    <ProtectedRoute>
      <MobilePortfolioScore />
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/trade-journal"
  element={
    <ProtectedRoute>
      <MobileTradeJournal />
    </ProtectedRoute>
  }
/>
<Route
  path="/mobile/funds"
  element={
    <ProtectedRoute>
      <MobileFunds />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/broker-treasury"
  element={
    <ProtectedRoute>
      <MobileBrokerTreasury />
    </ProtectedRoute>
  }
/>

<Route
  path="/mobile/orders"
  element={<MobileOrders />}
/>

<Route
  path="/mobile/orders/:id/modify"
  element={<MobileModifyOrder />}
/>

<Route
  path="/mobile/broker-rebalance"
  element={<MobileBrokerMirrorRebalance />}
/>

<Route 
path="/mobile/broker-home" 
element={<MobileBrokerMirrorHome />}
/>

<Route 
path="/mobile/broker-upload" 
element={<MobileBrokerUpload />} 
/>

<Route
  path="/mobile/holding-details"
  element={<MobileHoldingDetails />}
/>

</Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
</ErrorBoundary>
  );
}
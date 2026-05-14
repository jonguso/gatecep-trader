import NSEChartPanel from "../components/NSEChartPanel";
import OrderBookPanel from "../components/OrderBookPanel";
import TimeSalesTape from "../components/TimeSalesTape";
import MarketMoversPanel from "../components/MarketMoversPanel";
import NSEMarketOverviewPanel from "../components/NSEMarketOverviewPanel";
import CoachGSignalsPanel from "../components/CoachGSignalsPanel";
import AdvancedOrderTicket from "../components/AdvancedOrderTicket";
import Level2OrderBook from "../components/Level2OrderBook";

export default function TradingTerminalPage() {
  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white">
          Gatecep Trading Terminal
        </h1>

        <p className="text-slate-400 mt-2">
          Professional NSE execution workspace with market intelligence and live analytics
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <NSEChartPanel />
        </div>

        <div>
          <TimeSalesTape />
        </div>
      </div>

      <MarketMoversPanel />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <OrderBookPanel />

<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
  <div className="xl:col-span-2">
    <OrderBookPanel />
  </div>

  <div>
    <AdvancedOrderTicket />
  </div>
</div>

        <CoachGSignalsPanel />
      </div>

      <NSEMarketOverviewPanel />
    </div>
  );
}
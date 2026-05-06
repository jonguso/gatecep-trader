import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Page, Header, CTA, Disclaimer } from "../../src/components/ProTradingUI";
import GlobalAccountHeader from "../../src/components/GlobalAccountHeader";
import PortfolioDetailsModal from "../../src/components/PortfolioDetailsModal";
import {
  AIInsightsCard,
  DonutChartCard,
  DrilldownPanel,
  buildPortfolioAnalytics
} from "../../src/components/PortfolioDrilldownCharts";

function mergePortfolioWithPrices(portfolioRows, priceRows) {
  const priceMap = Object.fromEntries(
    (priceRows || []).map(x => [
      x.symbol,
      {
        price: Number(x.price || x.lastPrice || x.marketPrice || 0),
        sector: x.sector || x.industry || x.category || "Other",
        name: x.name
      }
    ])
  );

  return (portfolioRows || [])
    .filter(h => Number(h.qty || 0) > 0)
    .map(h => {
      const market = priceMap[h.symbol] || {};
      const qty = Number(h.qty || 0);
      const avgPrice = Number(h.avgPrice || 0);
      const marketPrice = Number(h.marketPrice || market.price || avgPrice || 0);

      return {
        ...h,
        name: h.name || market.name,
        sector: h.sector || h.industry || market.sector || "Other",
        qty,
        avgPrice,
        marketPrice,
        marketValue: qty * marketPrice,
        investedValue: qty * avgPrice
      };
    });
}

export default function Portfolio() {
  const [account, setAccount] = useState({ cash: 0 });
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  const load = async () => {
    try {
      const [a, pf, p] = await Promise.all([
        API.get("/account/u1"),
        API.get("/portfolio/u1"),
        API.get("/prices")
      ]);

      setAccount(a.data || { cash: 0 });
      setPortfolio(pf.data || []);
      setPrices(p.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const holdings = useMemo(
    () => mergePortfolioWithPrices(portfolio, prices),
    [portfolio, prices]
  );

  const analytics = useMemo(
    () => buildPortfolioAnalytics({ holdings, availableFunds: Number(account?.cash || 0) }),
    [holdings, account]
  );

  const openHolding = (h) => {
    router.push({ pathname: "/trade", params: { symbol: h.symbol, side: "BUY" } });
  };

  return (
    <Page>
      <Header title="Portfolio" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlobalAccountHeader />

        <DonutChartCard
          title="Allocation by Securities"
          data={analytics.bySecurity}
          selected={selectedAllocation?.type === "security" ? selectedAllocation : null}
          onSelect={(segment) => setSelectedAllocation(segment)}
        />

        <DonutChartCard
          title="Allocation by Industries"
          data={analytics.byIndustry}
          selected={selectedAllocation?.type === "industry" ? selectedAllocation : null}
          onSelect={(segment) => setSelectedAllocation(segment)}
        />

        <DrilldownPanel
          selected={selectedAllocation}
          holdings={holdings}
          onClear={() => setSelectedAllocation(null)}
          onOpenHolding={openHolding}
        />

        <AIInsightsCard analytics={analytics} />

        <CTA onPress={() => setDetailsOpen(true)}>Portfolio Details</CTA>

        <Disclaimer />
      </ScrollView>

      <PortfolioDetailsModal
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        account={account}
        holdings={holdings}
      />
    </Page>
  );
}

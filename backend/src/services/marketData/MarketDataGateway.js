import { mergeSecurityMasterWithPrices } from "../../data/nseSecurityMaster.js";

const demoPrices = [
  { symbol: "ABSA", name: "Absa Bank Kenya PLC", sector: "Banking", price: 28.30, open: 29.00, high: 28.58, low: 27.88, prevClose: 28.45, change: -0.15, changePct: -0.53, volume: 30000, turnover: 849000 },
  { symbol: "BAT", name: "British American Tobacco Kenya PLC", sector: "Manufacturing and Allied", price: 573.00, open: 574.00, high: 578.73, low: 564.40, prevClose: 574.00, change: -1.00, changePct: -0.17, volume: 13300, turnover: 7600000 },
  { symbol: "BRIT", name: "Britam Holdings PLC", sector: "Insurance", price: 16.38, open: 16.00, high: 16.54, low: 16.13, prevClose: 16.05, change: 0.33, changePct: 2.06, volume: 70000, turnover: 1146600 },
  { symbol: "COOP", name: "Co-operative Bank of Kenya Ltd", sector: "Banking", price: 29.00, open: 29.50, high: 29.29, low: 28.57, prevClose: 29.55, change: -0.55, changePct: -1.86, volume: 105400, turnover: 3056600 },
  { symbol: "EABL", name: "East African Breweries PLC", sector: "Manufacturing and Allied", price: 241.75, open: 245.00, high: 244.17, low: 238.12, prevClose: 241.50, change: 0.25, changePct: 1.49, volume: 48000, turnover: 11604000 },
  { symbol: "EQTY", name: "Equity Group Holdings PLC", sector: "Banking", price: 74.50, open: 75.00, high: 75.25, low: 73.88, prevClose: 74.50, change: 0.00, changePct: 1.78, volume: 6967744, turnover: 519096928 },
  { symbol: "KCB", name: "KCB Group PLC", sector: "Banking", price: 67.50, open: 67.50, high: 68.17, low: 66.83, prevClose: 67.50, change: 0.00, changePct: 2.12, volume: 3906685, turnover: 263701237 },
  { symbol: "KPLC", name: "Kenya Power & Lighting Co Ltd", sector: "Energy and Petroleum", price: 16.25, open: 16.35, high: 16.41, low: 16.01, prevClose: 16.20, change: 0.05, changePct: 0.31, volume: 64134, turnover: 1042177 },
  { symbol: "NCBA", name: "NCBA Group PLC", sector: "Banking", price: 44.49, open: 44.00, high: 44.93, low: 43.82, prevClose: 43.90, change: 0.59, changePct: 1.34, volume: 35000, turnover: 1557150 },
  { symbol: "SCOM", name: "Safaricom PLC", sector: "Telecommunication", price: 29.85, open: 29.80, high: 30.10, low: 29.70, prevClose: 29.20, change: 0.65, changePct: 2.23, volume: 115664, turnover: 3452570 }
];

class MarketDataGateway {
  async getPrices() {
    const merged = mergeSecurityMasterWithPrices(demoPrices);
    return {
      provider: "gatecep-demo-plus-full-nse-security-master",
      generatedAt: new Date().toISOString(),
      count: merged.length,
      data: merged
    };
  }
}

export const marketDataGateway = new MarketDataGateway();

export const securities = [
  { symbol: "SCOM", name: "Safaricom PLC", sector: "Telecom", price: 29.85, prevClose: 29.20, volume: 115664, marketCap: 1000000000000 },
  { symbol: "KCB", name: "KCB Group PLC", sector: "Banking", price: 67.50, prevClose: 66.10, volume: 33209, marketCap: 210000000000 },
  { symbol: "EQTY", name: "Equity Group Holdings", sector: "Banking", price: 74.50, prevClose: 73.20, volume: 20119, marketCap: 280000000000 },
  { symbol: "EABL", name: "East African Breweries PLC", sector: "Manufacturing", price: 241.75, prevClose: 238.20, volume: 2039, marketCap: 190000000000 },
  { symbol: "COOP", name: "Co-operative Bank", sector: "Banking", price: 29.00, prevClose: 29.55, volume: 105376, marketCap: 170000000000 },
  { symbol: "KPLC", name: "Kenya Power & Lighting Co Ltd", sector: "Energy", price: 16.25, prevClose: 16.20, volume: 64134, marketCap: 31711339481 },
  { symbol: "BAT", name: "British American Tobacco Kenya", sector: "Manufacturing", price: 573.00, prevClose: 574.00, volume: 13255, marketCap: 57300000000 },
  { symbol: "ABSA", name: "Absa Bank Kenya PLC", sector: "Banking", price: 28.30, prevClose: 28.45, volume: 305, marketCap: 153000000000 },
  { symbol: "NCBA", name: "NCBA Group PLC", sector: "Banking", price: 44.49, prevClose: 43.90, volume: 35000, marketCap: 73000000000 },
  { symbol: "BRIT", name: "Britam Holdings PLC", sector: "Insurance", price: 16.38, prevClose: 16.05, volume: 70000, marketCap: 41000000000 }
];

export function withMarketFields() {
  return securities.map((x, i) => {
    const price = Number(x.price);
    const changePct = ((price - x.prevClose) / x.prevClose) * 100;
    const turnover = price * x.volume;
    const step = price < 20 ? 0.05 : price < 100 ? 0.25 : 1;
    return {
      ...x,
      lastPrice: price,
      changePct: Number(changePct.toFixed(2)),
      turnover: Number(turnover.toFixed(2)),
      bidPrice: Number((price - step).toFixed(2)),
      bidQty: Math.round(x.volume * 0.4),
      offerPrice: Number(price.toFixed(2)),
      offerQty: Math.round(x.volume * 0.6),
      open: Number((price * 0.995).toFixed(2)),
      high: Number((price * 1.01).toFixed(2)),
      low: Number((price * 0.985).toFixed(2))
    };
  });
}

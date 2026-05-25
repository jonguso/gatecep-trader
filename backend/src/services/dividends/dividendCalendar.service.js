const dividendEvents = [
  {
    symbol: "BAT",
    company: "British American Tobacco Kenya",
    dividend: 45,
    currency: "KES",
    booksClosureDate: "2026-06-10",
    paymentDate: "2026-06-28",
    status: "ANNOUNCED"
  },
  {
    symbol: "SCOM",
    company: "Safaricom PLC",
    dividend: 0.65,
    currency: "KES",
    booksClosureDate: "2026-07-05",
    paymentDate: "2026-07-31",
    status: "EXPECTED"
  },
  {
    symbol: "KCB",
    company: "KCB Group PLC",
    dividend: 2,
    currency: "KES",
    booksClosureDate: "2026-06-21",
    paymentDate: "2026-07-12",
    status: "ANNOUNCED"
  }
];

export function getDividendCalendar() {
  return dividendEvents.map((item) => ({
    ...item,
    daysToBooksClosure: daysUntil(item.booksClosureDate),
    daysToPayment: daysUntil(item.paymentDate)
  }));
}

export function getDividendBySymbol(symbol) {
  return getDividendCalendar().filter(
    (item) =>
      item.symbol === String(symbol || "").toUpperCase()
  );
}

function daysUntil(dateValue) {
  const today = new Date();
  const target = new Date(dateValue);

  const diff =
    target.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
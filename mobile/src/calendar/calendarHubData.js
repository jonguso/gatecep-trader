export const CALENDAR_TABS = [
  "This Month",
  "Next 6 Months",
  "Last 12 Months"
];

export const CALENDAR_EVENTS = [
  {
    id: "CAL-001",
    type: "DIVIDEND",
    symbol: "SCOM",
    company: "Safaricom",
    date: "2026-07-30",
    title: "Final Dividend Payment",
    detail: "Expected dividend payment date for shareholders."
  },
  {
    id: "CAL-002",
    type: "BOOK_CLOSURE",
    symbol: "EABL",
    company: "East African Breweries",
    date: "2026-08-12",
    title: "Dividend Book Closure",
    detail: "Share register closes for dividend eligibility."
  },
  {
    id: "CAL-003",
    type: "AGM",
    symbol: "KCB",
    company: "KCB Group",
    date: "2026-09-18",
    title: "Annual General Meeting",
    detail: "Annual shareholder meeting."
  },
  {
    id: "CAL-004",
    type: "EARNINGS",
    symbol: "EQTY",
    company: "Equity Group",
    date: "2026-10-05",
    title: "Earnings Update",
    detail: "Expected financial results update."
  },
  {
    id: "CAL-005",
    type: "RIGHTS",
    symbol: "COOP",
    company: "Co-operative Bank",
    date: "2026-11-14",
    title: "Rights Issue Window",
    detail: "Corporate action tracking placeholder."
  },
  {
    id: "CAL-006",
    type: "TBILL",
    symbol: "CBK",
    company: "Central Bank of Kenya",
    date: "2026-12-01",
    title: "Treasury Bill Auction",
    detail: "Government securities auction watch."
  }
];

export function getCalendarEvents(tab) {
  if (tab === "This Month") {
    return CALENDAR_EVENTS.slice(0, 2);
  }

  if (tab === "Next 6 Months") {
    return CALENDAR_EVENTS;
  }

  if (tab === "Last 12 Months") {
    return CALENDAR_EVENTS.slice(0, 3).map((item) => ({
      ...item,
      date: "2025-" + item.date.slice(5)
    }));
  }

  return CALENDAR_EVENTS;
}

export function getCalendarSummary(events = []) {
  return {
    total: events.length,
    dividends: events.filter((e) => e.type === "DIVIDEND").length,
    agms: events.filter((e) => e.type === "AGM").length,
    actions: events.filter((e) =>
      ["BOOK_CLOSURE", "RIGHTS", "EARNINGS"].includes(e.type)
    ).length
  };
}
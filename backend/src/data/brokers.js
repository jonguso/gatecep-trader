export const BROKERS = [
  { id: "aib", name: "AIB-AXYS Africa", shortName: "AIB", market: "NSE", status: "SIGNUP_AVAILABLE", signupUrl: "https://www.aib-axysafrica.com/", supportsApiRouting: false },
  { id: "abc", name: "ABC Capital", shortName: "ABC", market: "NSE", status: "SIGNUP_AVAILABLE", signupUrl: "https://www.abccapital.co.ke/", supportsApiRouting: false },
  { id: "ncba", name: "NCBA Investment Bank", shortName: "NCBA", market: "NSE", status: "PLANNED", signupUrl: "", supportsApiRouting: false },
  { id: "dyer", name: "Dyer & Blair Investment Bank", shortName: "Dyer", market: "NSE", status: "PLANNED", signupUrl: "", supportsApiRouting: false },
  { id: "kingdom", name: "Kingdom Securities", shortName: "Kingdom", market: "NSE", status: "PLANNED", signupUrl: "", supportsApiRouting: false },
  { id: "sib", name: "Standard Investment Bank", shortName: "SIB", market: "NSE", status: "PLANNED", signupUrl: "", supportsApiRouting: false }
];

export function findBroker(id) {
  return BROKERS.find(b => b.id === id);
}

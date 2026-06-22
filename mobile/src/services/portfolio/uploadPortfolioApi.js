import { API_URL } from "../../config/apiConfig";

export async function uploadConfirmedPortfolio(rows = [], context = {}) {
  const response = await fetch(`${API_URL}/broker-reports/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      reportType: "valuation",
      broker: context.broker || "AIB",
      clientNumber: context.clientNumber || "",
      cdsNumber: context.cdsNumber || "",
      email: context.email || "",
      rows
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to upload valuation to backend.");
  }

  return response.json();
}
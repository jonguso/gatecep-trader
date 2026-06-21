import { DemoNSEProvider } from "./DemoNSEProvider.js";
import { NSEDirectProvider } from "./NSEDirectProvider.js";
import { VendorNSEProvider } from "./VendorNSEProvider.js";

export function createMarketDataProvider() {
  const mode = process.env.NSE_DATA_MODE || "demo";

  if (mode === "nse-direct") {
    return new NSEDirectProvider({
      baseUrl: process.env.NSE_API_BASE_URL,
      apiKey: process.env.NSE_API_KEY
    });
  }

  if (mode === "vendor") {
    return new VendorNSEProvider({
      baseUrl: process.env.NSE_API_BASE_URL,
      apiKey: process.env.NSE_API_KEY,
      vendorName: process.env.NSE_VENDOR_NAME || "authorised-vendor"
    });
  }

  return new DemoNSEProvider();
}

export const marketDataProvider = createMarketDataProvider();

export const TOKENS = {
  color: {
    bg: "#0D1117",
    surface: "#161B22",
    elevated: "#1C2333",
    border: "#21262D",
    borderSubtle: "#30363D",
    brand: "#1F6FEB",
    brandLight: "#388BFD",
    brandTint: "#1F6FEB1A",
    brandBorder: "#1F6FEB44",
    up: "#3FB950",
    upCta: "#238636",
    upBg: "#1A3D1A",
    down: "#F85149",
    downCta: "#B91C1C",
    downBg: "#3D1A1A",
    warning: "#D29922",
    infoBg: "#1A2E44",
    text: "#E6EDF3",
    textSecondary: "#8B949E",
    textDisabled: "#484F58",
    white: "#FFFFFF"
  },
  radius: { sm: 6, md: 10, lg: 12, xl: 16, pill: 20 },
  spacing: { screen: 20, card: 14, xs: 6, sm: 8, md: 12, lg: 16, xl: 20 },
  type: {
    display: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
    h1: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
    h2: { fontSize: 18, fontWeight: "700" },
    body: { fontSize: 13, fontWeight: "400" },
    caption: { fontSize: 11, fontWeight: "400" },
    micro: { fontSize: 10, fontWeight: "600", letterSpacing: 0.8 },
    button: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 }
  },
  layout: { ctaHeight: 48, fieldHeight: 40, listItemHeight: 54, minTouch: 44 },
  fees: { nseLevy: 0.0012, brokerCommission: 0.015, cdsFee: 0.0006, cdscLevy: 0.0005 },
  settlement: { cycle: "T+3", steps: ["Placed", "Matching", "Cleared", "Settled"] }
};

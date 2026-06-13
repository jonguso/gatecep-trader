import { userGetItem, userSetItem } from "../auth/userStorage";

export async function saveTradeBasket(items = [], source = "COACH_G") {
  const basket = {
    id: `BASKET-${Date.now()}`,
    source,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    items: items.map((item, index) => ({
      id: `BI-${Date.now()}-${index}`,
      symbol: String(item.symbol || "").toUpperCase(),
      name: item.name || item.symbol,
      side: item.side || "BUY",
      amount: Number(item.amount || item.value || 0),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || item.marketPrice || 0),
      reason: item.reason || "Coach G recommendation"
    }))
  };

  await userSetItem("activeTradeBasket", JSON.stringify(basket));

  return basket;
}

export async function loadTradeBasket() {
  const raw = await userGetItem("activeTradeBasket");
  return raw ? JSON.parse(raw) : null;
}

export async function clearTradeBasket() {
  await userSetItem("activeTradeBasket", "");
}
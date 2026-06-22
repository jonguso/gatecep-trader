export function validateOrder({
  side,
  symbol,
  quantity,
  price,
  cash,
  totalCost,
  portfolio,
  brokerProfile
}) {
  const errors = [];

  const qty = Number(quantity || 0);
  const orderPrice = Number(price || 0);

  if (!brokerProfile) {
    errors.push("Broker profile is required before placing an order.");
  }

  if (!symbol) {
    errors.push("Select a security.");
  }

  if (!qty || qty <= 0) {
    errors.push("Quantity must be greater than zero.");
  }

  if (!orderPrice || orderPrice <= 0) {
    errors.push("Price must be greater than zero.");
  }

  if (side === "BUY" && Number(totalCost || 0) > Number(cash || 0)) {
    errors.push("Insufficient cash for this order.");
  }

  if (side === "SELL") {
    const holding = (portfolio || []).find(
      (item) => String(item.symbol).toUpperCase() === String(symbol).toUpperCase()
    );

    if (!holding) {
      errors.push(`You do not hold ${symbol}.`);
    } else if (qty > Number(holding.quantity || 0)) {
      errors.push(`You only hold ${holding.quantity} shares of ${symbol}.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
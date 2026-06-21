export function calculateTradeFees({ side, price, qty }) {
  const orderValue = Number(price) * Number(qty);
  const brokerFee = orderValue * 0.015;
  const nseLevy = orderValue * 0.0012;
  const cdsFee = String(side).toUpperCase() === "BUY" ? orderValue * 0.0006 : 0;
  const cdscLevy = orderValue * 0.0005;
  const totalFees = brokerFee + nseLevy + cdsFee + cdscLevy;
  return {
    orderValue: Number(orderValue.toFixed(2)),
    brokerFee: Number(brokerFee.toFixed(2)),
    nseLevy: Number(nseLevy.toFixed(2)),
    cdsFee: Number(cdsFee.toFixed(2)),
    cdscLevy: Number(cdscLevy.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    cashRequired: Number((orderValue + totalFees).toFixed(2)),
    estimatedProceeds: Number((orderValue - totalFees).toFixed(2))
  };
}

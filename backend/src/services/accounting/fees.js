export const DEFAULT_FEES = {
  brokerCommissionRate: 0.015,
  nseLevyRate: 0.0012,
  cdsFeeRate: 0.0006,
  cdscLevyRate: 0.0005
};

export function calculateTradeFees({ side, price, qty, brokerFees = {} }) {
  const orderValue = Number(price) * Number(qty);

  const brokerRate = brokerFees.brokerCommissionRate ?? DEFAULT_FEES.brokerCommissionRate;
  const nseRate = brokerFees.nseLevyRate ?? DEFAULT_FEES.nseLevyRate;
  const cdsRate = brokerFees.cdsFeeRate ?? DEFAULT_FEES.cdsFeeRate;
  const cdscRate = brokerFees.cdscLevyRate ?? DEFAULT_FEES.cdscLevyRate;

  const brokerFee = orderValue * brokerRate;
  const nseLevy = orderValue * nseRate;
  const cdsFee = String(side).toUpperCase() === "BUY" ? orderValue * cdsRate : 0;
  const cdscLevy = orderValue * cdscRate;

  const totalFees = brokerFee + nseLevy + cdsFee + cdscLevy;
  const cashRequired = orderValue + totalFees;
  const estimatedProceeds = orderValue - totalFees;

  return {
    orderValue: Number(orderValue.toFixed(2)),
    brokerFee: Number(brokerFee.toFixed(2)),
    nseLevy: Number(nseLevy.toFixed(2)),
    cdsFee: Number(cdsFee.toFixed(2)),
    cdscLevy: Number(cdscLevy.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    cashRequired: Number(cashRequired.toFixed(2)),
    estimatedProceeds: Number(estimatedProceeds.toFixed(2))
  };
}

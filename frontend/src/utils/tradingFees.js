export function calculateFees(orderValue = 0) {
  const brokerage = orderValue * 0.013;
  const levy = orderValue * 0.002;
  const statutory = 50;

  const totalFees =
    brokerage + levy + statutory;

  return {
    brokerage,
    levy,
    statutory,
    totalFees,
    netCost: orderValue + totalFees
  };
}
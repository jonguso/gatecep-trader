/**
 * ============================================================================
 * STATUS: DEV
 * MODULE: Shared Cash Calculations
 * DOMAIN ID: CASH-001
 * ENGINE ID: ENG-CASH-001
 * PURPOSE: Single source of truth for cash and buying power calculations.
 * LAST VERIFIED: 2026-06-29
 * ============================================================================
 */

function n(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export function calculateReservedCash({
  pendingOrders = [],
  pendingWithdrawals = 0,
  unsettledBuys = 0
} = {}) {
  const orderReserve = pendingOrders.reduce((sum, order) => {
    const quantity = n(order.quantity);
    const price = n(order.price || order.limitPrice);
    const fees = n(order.fees || order.estimatedFees);
    return sum + quantity * price + fees;
  }, 0);

  return orderReserve + n(pendingWithdrawals) + n(unsettledBuys);
}

export function calculateAvailableCash({
  cashBalance = 0,
  reservedCash = 0,
  pendingOrders = [],
  pendingWithdrawals = 0,
  unsettledBuys = 0
} = {}) {
  const reserve =
    reservedCash ||
    calculateReservedCash({
      pendingOrders,
      pendingWithdrawals,
      unsettledBuys
    });

  return Math.max(n(cashBalance) - n(reserve), 0);
}

export function calculateBuyingPower({
  cashBalance = 0,
  availableCash,
  multiplier = 1
} = {}) {
  const base =
    availableCash === undefined
      ? n(cashBalance)
      : n(availableCash);

  return Math.max(base * n(multiplier || 1), 0);
}

export function calculateCashSummary({
  balances = [],
  pendingOrders = [],
  pendingWithdrawals = 0,
  unsettledBuys = 0,
  currency = "KES"
} = {}) {
  const cashBalance = balances.reduce(
    (sum, item) =>
      sum +
      n(
        item.cashBalance ||
          item.cash_balance ||
          item.availableCash ||
          item.balance ||
          item.amount
      ),
    0
  );

  const reservedCash = calculateReservedCash({
    pendingOrders,
    pendingWithdrawals,
    unsettledBuys
  });

  const availableCash = calculateAvailableCash({
    cashBalance,
    reservedCash
  });

  const buyingPower = calculateBuyingPower({
    availableCash
  });

  return {
    currency,
    cashBalance,
    reservedCash,
    availableCash,
    buyingPower,
    pendingWithdrawals: n(pendingWithdrawals),
    unsettledBuys: n(unsettledBuys),
    balancesCount: balances.length
  };
}
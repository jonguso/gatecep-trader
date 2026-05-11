import {
  savePosition,
  loadPositions
} from "../../repositories/position.repository.js";

const positions = new Map();

function key(broker, symbol) {
  return `${broker}:${symbol}`;
}

export async function initializePositions() {
  const saved = await loadPositions();

  for (const position of saved) {
    positions.set(
      key(position.broker, position.symbol),
      position
    );
  }

  console.log(`Loaded ${saved.length} persistent positions`);
}

export async function updatePositionFromFill(fill) {
  const mapKey = key(fill.broker, fill.symbol);

  const existing =
    positions.get(mapKey) || {
      symbol: fill.symbol,
      broker: fill.broker,
      quantity: 0,
      averageCost: 0,
      realizedPnL: 0,
      updatedAt: new Date().toISOString()
    };

  if (fill.side === "BUY") {
    const totalCost =
      existing.quantity * existing.averageCost +
      fill.quantity * fill.price;

    existing.quantity += fill.quantity;

    existing.averageCost =
      existing.quantity > 0
        ? Number((totalCost / existing.quantity).toFixed(2))
        : 0;
  } else {
    const pnl =
      (fill.price - existing.averageCost) * fill.quantity;

    existing.realizedPnL += pnl;

    existing.quantity -= fill.quantity;

    if (existing.quantity < 0) {
      existing.quantity = 0;
    }
  }

  existing.updatedAt = new Date().toISOString();

  positions.set(mapKey, existing);

  await savePosition(existing);

  return existing;
}

export function getPositions() {
  return Array.from(positions.values());
}

export function getPositionBySymbol(symbol) {
  return getPositions().filter(
    (position) => position.symbol === symbol
  );
}
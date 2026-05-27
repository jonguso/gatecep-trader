export async function executeTWAP({
  order,
  slices = 5,
  intervalMs = 3000,
  executeSlice
}) {
  const quantity = Number(order.quantity || 0);

  const sliceQty = Math.max(
    1,
    Math.floor(quantity / slices)
  );

  const results = [];

  for (let i = 0; i < slices; i++) {
    const remaining =
      quantity -
      results.reduce(
        (sum, r) =>
          sum + Number(r.quantity || 0),
        0
      );

    if (remaining <= 0) {
      break;
    }

    const currentSliceQty =
      i === slices - 1
        ? remaining
        : Math.min(sliceQty, remaining);

    const sliceOrder = {
      ...order,
      quantity: currentSliceQty,
      parentOrderId: order.id,
      executionStrategy: "TWAP",
      sliceNumber: i + 1
    };

    const result =
      await executeSlice(sliceOrder);

    results.push({
      slice: i + 1,
      quantity: currentSliceQty,
      result
    });

    if (i < slices - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, intervalMs)
      );
    }
  }

  return results;
}
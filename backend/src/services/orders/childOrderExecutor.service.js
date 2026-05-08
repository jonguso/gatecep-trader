import { queueOrder } from "./executionQueue.service.js";
import { splitOrder } from "./orderSplitter.service.js";

const parentExecutions = [];

export function executeSplitOrder({
  symbol = "SCOM",
  quantity = 5000,
  side = "BUY"
}) {
  const split = splitOrder({
    symbol,
    quantity
  });

  const parentExecution = {
    parentId: `PARENT-${Date.now()}`,
    symbol,
    side,
    quantity,
    executionStyle: split.executionStyle,
    recommendedBroker: split.recommendedBroker,
    status: "RUNNING",
    completedChildren: 0,
    totalChildren: split.childOrders.length,
    completionPercent: 0,
    childExecutions: [],
    createdAt: new Date().toISOString()
  };

  split.childOrders.forEach((child, index) => {
    setTimeout(() => {
      const queued = queueOrder({
        symbol,
        side,
        quantity: child.quantity,
        price: 18.45,
        broker: split.recommendedBroker
      });

      parentExecution.childExecutions.push({
        childId: child.childId,
        orderId: queued.id,
        quantity: child.quantity,
        status: queued.status
      });

      parentExecution.completedChildren += 1;

      parentExecution.completionPercent =
        Math.round(
          (
            parentExecution.completedChildren /
            parentExecution.totalChildren
          ) * 100
        );

      if (
        parentExecution.completedChildren >=
        parentExecution.totalChildren
      ) {
        parentExecution.status = "COMPLETED";
      }
    }, index * 500);
  });

  parentExecutions.push(parentExecution);

  return parentExecution;
}

export function getParentExecutions() {
  return parentExecutions;
}
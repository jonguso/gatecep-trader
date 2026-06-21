import { queueOrder } from "./executionQueue.service.js";
import { splitOrder } from "./orderSplitter.service.js";
import {
  saveParentExecution,
  saveChildOrder
} from "../../repositories/executionPersistence.repository.js";

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

saveParentExecution(parentExecution).catch((error) => {
  console.error("Failed to persist parent execution:", error.message);
});

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
saveChildOrder(
  parentExecution.parentId,
  {
    childId: child.childId,
    quantity: child.quantity,
    status: queued.status,
    createdAt: new Date().toISOString()
  },
  split.recommendedBroker
).catch((error) => {
  console.error("Failed to persist child order:", error.message);
});

      parentExecution.completedChildren += 1;

      parentExecution.completionPercent =
        Math.round(
          (
            parentExecution.completedChildren /
            parentExecution.totalChildren
          ) * 100
        );
saveParentExecution(parentExecution).catch((error) => {
  console.error("Failed to update parent execution:", error.message);
});

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
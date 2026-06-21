const fixSessions = [
  {
    broker: "ABC",
    sessionId: "FIX-ABC-001",
    status: "CONNECTED",
    heartbeatLatencyMs: 18,
    messagesSent: 124,
    messagesReceived: 131,
    lastHeartbeat: new Date().toISOString()
  },
  {
    broker: "AIB",
    sessionId: "FIX-AIB-002",
    status: "CONNECTED",
    heartbeatLatencyMs: 25,
    messagesSent: 88,
    messagesReceived: 91,
    lastHeartbeat: new Date().toISOString()
  }
];

export function getFixSessions() {
  return fixSessions;
}

export function simulateFixExecution(order) {
  return {
    fixMessageType: "ExecutionReport",
    execType: "FILL",
    ordStatus: "FILLED",
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: order.price,
    broker: order.broker,
    transactTime: new Date().toISOString()
  };
}
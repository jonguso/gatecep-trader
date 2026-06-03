import API from "../api";

export async function getBrokerPortfolio(userId = "u1") {
  const res = await API.get(`/broker-mirror/portfolio/${userId}`);
  return res.data;
}

export async function getBrokerFunds(userId = "u1") {
  const res = await API.get(`/broker-mirror/funds/${userId}`);
  return res.data;
}

export async function getBrokerOrders(userId = "u1") {
  const res = await API.get(`/broker-mirror/orders/${userId}`);
  return res.data;
}

export async function placeBrokerOrder({ userId = "u1", brokerId, order }) {
  const res = await API.post("/broker-mirror/orders/place", { userId, brokerId, order });
  return res.data;
}

export async function cancelBrokerOrder({ userId = "u1", brokerId, orderId }) {
  const res = await API.post("/broker-mirror/orders/cancel", { userId, brokerId, orderId });
  return res.data;
}

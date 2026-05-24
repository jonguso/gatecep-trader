const notifications = [];

export function addNotification(notification) {
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...notification
  });

  return notifications[0];
}

export function getNotifications() {
  return notifications;
}

export function markNotificationRead(id) {
  const found = notifications.find(
    (item) => item.id === id
  );

  if (found) {
    found.read = true;
  }

  return found || null;
}

/* -------------------------------- */
/* AI MARKET ALERTS                 */
/* -------------------------------- */

export function generateMarketAlert({
  symbol,
  type,
  message,
  severity = "info"
}) {
  return addNotification({
    category: "MARKET",
    symbol,
    type,
    severity,
    title: `${symbol} Market Alert`,
    message
  });
}

/* -------------------------------- */
/* DIVIDEND ALERTS                  */
/* -------------------------------- */

export function generateDividendAlert({
  symbol,
  dividend,
  booksClosureDate,
  paymentDate
}) {
  return addNotification({
    category: "DIVIDEND",
    symbol,
    type: "DIVIDEND_DECLARED",
    severity: "positive",
    title: `${symbol} Dividend Announced`,
    message:
      `${symbol} announced dividend of KES ${dividend}. ` +
      `Books closure: ${booksClosureDate}. ` +
      `Payment date: ${paymentDate}.`
  });
}

/* -------------------------------- */
/* PORTFOLIO RISK ALERTS            */
/* -------------------------------- */

export function generatePortfolioRiskAlert({
  symbol,
  exposure,
  sector
}) {
  return addNotification({
    category: "PORTFOLIO",
    symbol,
    type: "CONCENTRATION_RISK",
    severity: "warning",
    title: `High ${symbol} Exposure`,
    message:
      `${symbol} now represents ${exposure}% ` +
      `of your portfolio. Sector: ${sector}.`
  });
}

/* -------------------------------- */
/* ORDER EXECUTION ALERTS           */
/* -------------------------------- */

export function generateExecutionAlert({
  symbol,
  orderId,
  status,
  broker
}) {
  return addNotification({
    category: "EXECUTION",
    symbol,
    type: status,
    severity:
      status === "FILLED"
        ? "positive"
        : status === "REJECTED"
        ? "error"
        : "info",
    title: `${symbol} Order ${status}`,
    message:
      `Order ${orderId} routed via ${broker}. ` +
      `Current status: ${status}.`
  });
}

/* -------------------------------- */
/* AI TRADE OPPORTUNITY ALERTS      */
/* -------------------------------- */

export function generateAITradeAlert({
  symbol,
  signal,
  confidence,
  message
}) {
  return addNotification({
    category: "AI_SIGNAL",
    symbol,
    type: signal,
    severity:
      confidence >= 80
        ? "positive"
        : "info",
    title: `Coach G AI Signal — ${symbol}`,
    message:
      `${message} ` +
      `(Confidence ${confidence}%)`
  });
}
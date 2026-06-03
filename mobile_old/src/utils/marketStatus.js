export function getMarketStatus(date = new Date()) {
  const day = date.getDay(); // 0 Sunday, 6 Saturday
  const minutes = date.getHours() * 60 + date.getMinutes();

  // Kenya/East Africa Time logic if device is set locally.
  // NSE normal session approximation:
  // PreOpen: 09:00 - 09:30
  // Open:    09:30 - 15:00
  // Closed: otherwise/weekends
  if (day === 0 || day === 6) {
    return {
      label: "Closed",
      tone: "closed",
      detail: "Weekend"
    };
  }

  if (minutes >= 9 * 60 && minutes < 9 * 60 + 30) {
    return {
      label: "PreOpen",
      tone: "preopen",
      detail: "Market pre-open"
    };
  }

  if (minutes >= 9 * 60 + 30 && minutes < 15 * 60) {
    return {
      label: "Open",
      tone: "open",
      detail: "Market open"
    };
  }

  return {
    label: "Closed",
    tone: "closed",
    detail: "Market closed"
  };
}

export function getStatusStyle(status) {
  if (status?.tone === "open") {
    return {
      backgroundColor: "#22C55E",
      color: "#052E16"
    };
  }

  if (status?.tone === "closed") {
    return {
      backgroundColor: "#EF4444",
      color: "#FFFFFF"
    };
  }

  return {
    backgroundColor: "#FDE047",
    color: "#111827"
  };
}

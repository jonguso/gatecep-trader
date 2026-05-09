import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function severityColor(severity) {
  switch (severity) {
    case "SUCCESS":
      return "border-green-500 text-green-400";

    case "HIGH":
      return "border-red-500 text-red-400";

    case "MEDIUM":
      return "border-yellow-500 text-yellow-400";

    default:
      return "border-cyan-500 text-cyan-400";
  }
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  async function loadNotifications() {
    const res = await fetch(`${API_URL}/notifications`);
    const data = await res.json();

    if (data.ok) {
      setNotifications(data.notifications || []);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          Notification Center
        </h2>

        <div className="bg-cyan-600 text-white text-sm px-3 py-1 rounded-full">
          {notifications.length} Alerts
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {notifications.map((notification, index) => (
          <div
            key={`${notification.type}-${index}`}
            className={`border rounded-xl p-4 bg-slate-800 ${severityColor(
              notification.severity
            )}`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold">
                {notification.type}
              </div>

              <div className="text-xs text-slate-400">
                {new Date(
                  notification.timestamp
                ).toLocaleTimeString()}
              </div>
            </div>

            <div className="text-sm text-slate-200">
              {notification.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
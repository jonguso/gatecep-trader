import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function severityStyle(severity) {
  if (severity === "positive") {
    return "bg-green-500/10 border-green-500/40 text-green-400";
  }

  if (severity === "warning") {
    return "bg-yellow-500/10 border-yellow-500/40 text-yellow-300";
  }

  if (severity === "error") {
    return "bg-red-500/10 border-red-500/40 text-red-400";
  }

  return "bg-cyan-500/10 border-cyan-500/40 text-cyan-300";
}

function categoryIcon(category) {
  if (category === "DIVIDEND") return "💰";
  if (category === "EXECUTION") return "✅";
  if (category === "PORTFOLIO") return "⚠️";
  if (category === "AI_SIGNAL") return "🤖";
  return "🔔";
}

export default function MobileNotifications() {
  const [notifications, setNotifications] = useState([]);

  async function loadNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      const data = await res.json();

      if (data.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  async function markRead(id) {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "POST"
      });

      loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Notifications
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          AI alerts, dividend updates, portfolio risks, and execution events.
        </p>

        <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4 mt-5">
          <div className="text-xs text-slate-400">
            Unread Alerts
          </div>

          <div className="text-3xl font-bold text-cyan-300 mt-1">
            {unreadCount}
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 ${severityStyle(
                item.severity
              )}`}
            >
              <div className="flex gap-3 items-start">
                <div className="text-2xl">
                  {categoryIcon(item.category)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <div className="font-bold">
                      {item.title}
                    </div>

                    {!item.read && (
                      <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-1 rounded-full font-bold h-fit">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-200 mt-2 leading-6">
                    {item.message}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>

                    {!item.read && (
                      <button
                        onClick={() => markRead(item.id)}
                        className="text-xs bg-slate-900/70 px-3 py-2 rounded-xl text-cyan-300 font-bold"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="bg-slate-900 rounded-2xl p-6 text-center text-slate-400 border border-slate-800">
              No notifications yet.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}
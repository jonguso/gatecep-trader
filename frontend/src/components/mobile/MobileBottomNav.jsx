import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileBottomNav() {
  const location = useLocation();
  const [notificationCount, setNotificationCount] =
    useState(0);

  function active(path) {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  }

  async function loadNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      const data = await res.json();

      if (data.ok) {
        const unread = (data.notifications || []).filter(
          (item) => !item.read
        );

        setNotificationCount(unread.length);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  const items = [
  {
    label: "Coach",
    path: "/mobile"
  },
  {
    label: "Markets",
    path: "/mobile/markets"
  },
  {
    label: "Watchlist",
    path: "/mobile/watchlist"
  },
  {
    label: "Portfolio",
    path: "/mobile/portfolio"
  },
  {
    label: "Alerts",
    path: "/mobile/notifications",
    badge: true
  }
];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 grid grid-cols-5 text-center text-xs text-white z-50">
      {items.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`relative py-3 font-bold ${
            active(item.path)
              ? "text-cyan-400 bg-slate-800"
              : "text-slate-300"
          }`}
        >
          <div className="relative inline-block">
            {item.label}

            {item.badge && notificationCount > 0 && (
              <span className="absolute -top-3 -right-5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse">
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
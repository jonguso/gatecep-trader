import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function eventColor(status = "") {
  if (status === "FILLED") return "bg-green-500";
  if (status === "PARTIAL_FILL") return "bg-yellow-500";
  if (status === "REJECTED") return "bg-red-500";
  if (status === "CANCELLED") return "bg-gray-500";
  if (status === "RETRYING") return "bg-purple-500";
  return "bg-cyan-500";
}

export default function ExecutionTimelinePanel() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("gatecep_token");

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token }
    });

    socket.on("execution:event", (event) => {
      setEvents((prev) => [event, ...prev].slice(0, 30));
    });

    socket.on("order:update", (order) => {
      if (!order?.executionEvents?.length) return;

      const latest =
        order.executionEvents[order.executionEvents.length - 1];

      setEvents((prev) =>
        [
          {
            orderId: order.id,
            symbol: order.symbol,
            broker: order.broker,
            ...latest
          },
          ...prev
        ].slice(0, 30)
      );
    });

    return () => {
      socket.off("execution:event");
      socket.off("order:update");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-4">
        Real-Time Execution Timeline
      </h2>

      {events.length === 0 ? (
        <div className="text-slate-400">
          Waiting for execution events...
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={`${event.orderId}-${event.timestamp}-${index}`} className="flex gap-4">
              <div className={`w-3 h-3 rounded-full mt-2 ${eventColor(event.status)}`} />

              <div className="border-l border-slate-700 pl-4">
                <div className="font-bold">
                  {event.status}
                </div>

                <div className="text-sm text-slate-300">
                  {event.message}
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  {event.symbol || ""} {event.broker ? `via ${event.broker}` : ""} ·{" "}
                  {event.timestamp
                    ? new Date(event.timestamp).toLocaleTimeString()
                    : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
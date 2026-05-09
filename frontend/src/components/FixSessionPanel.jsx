import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function FixSessionPanel() {
  const [sessions, setSessions] = useState([]);

  async function loadSessions() {
    const res = await fetch(`${API_URL}/fix/sessions`);
    const data = await res.json();

    if (data.ok) {
      setSessions(data.sessions || []);
    }
  }

  useEffect(() => {
    loadSessions();

    const interval = setInterval(loadSessions, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        FIX Gateway Sessions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div
            key={session.sessionId}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700"
          >
            <div className="flex justify-between mb-3">
              <div className="text-2xl font-bold">
                {session.broker}
              </div>

              <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
                {session.status}
              </span>
            </div>

            <div className="text-sm text-slate-400 mb-3">
              {session.sessionId}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                Heartbeat Latency:{" "}
                <span className="font-bold text-cyan-400">
                  {session.heartbeatLatencyMs} ms
                </span>
              </div>

              <div>
                Messages Sent:{" "}
                <span className="font-bold">
                  {session.messagesSent}
                </span>
              </div>

              <div>
                Messages Received:{" "}
                <span className="font-bold">
                  {session.messagesReceived}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Last heartbeat:{" "}
                {new Date(session.lastHeartbeat).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
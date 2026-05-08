import React from "react";

export default function OrderAuditTrail({ order, onClose }) {
  if (!order) return null;

  const events = order.executionEvents || [];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end">
      <div className="w-full max-w-md bg-slate-950 text-white h-full p-6 shadow-2xl overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold">Order Audit Trail</h2>
            <p className="text-xs text-slate-400">{order.id}</p>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 px-3 py-1 rounded-lg text-sm"
          >
            Close
          </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-5">
          <div className="font-semibold">
            {order.symbol} {order.side}
          </div>
          <div className="text-sm text-slate-400">
            {order.quantity} @ KES {order.price}
          </div>
          <div className="text-sm mt-2">
            Broker: <b>{order.broker}</b>
          </div>
          <div className="text-sm">
            Status: <b>{order.status}</b>
          </div>
          <div className="text-sm">
            Filled: <b>{order.filledQuantity}/{order.quantity}</b>
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="border-l-2 border-green-500 pl-4">
              <div className="font-bold text-sm">{event.status}</div>
              <div className="text-sm text-slate-300">{event.message}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-slate-400 text-sm">
              No audit events available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
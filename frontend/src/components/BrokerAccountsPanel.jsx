import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function BrokerAccountsPanel() {
  const [accounts, setAccounts] = useState([]);

  async function loadAccounts() {
    const res = await fetch(
      `${API_URL}/broker-accounts`
    );

    const data = await res.json();

    if (data.ok) {
      setAccounts(data.accounts || []);
    }
  }

  async function setPreferred(broker) {
    await fetch(
      `${API_URL}/broker-accounts/preferred`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          broker
        })
      }
    );

    loadAccounts();
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Multi-Broker Accounts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.accountNumber}
            className={`rounded-xl p-5 border ${
              account.preferred
                ? "border-cyan-500 bg-slate-800"
                : "border-slate-700 bg-slate-800"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold">
                {account.broker}
              </div>

              {account.preferred && (
                <span className="text-xs bg-cyan-600 px-2 py-1 rounded-full">
                  PREFERRED
                </span>
              )}
            </div>

            <div className="text-sm text-slate-400 mb-3">
              {account.accountNumber}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                Cash:{" "}
                <span className="font-bold text-green-400">
                  KES {account.cashBalance}
                </span>
              </div>

              <div>
                Portfolio:{" "}
                <span className="font-bold">
                  KES {account.portfolioValue}
                </span>
              </div>

              <div>
                Buying Power:{" "}
                <span className="font-bold text-purple-400">
                  KES {account.buyingPower}
                </span>
              </div>

              <div>
                Status:{" "}
                <span
                  className={
                    account.connected
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {account.connected
                    ? "CONNECTED"
                    : "OFFLINE"}
                </span>
              </div>
            </div>

            {!account.preferred && (
              <button
                onClick={() =>
                  setPreferred(
                    account.broker
                  )
                }
                className="mt-5 w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl p-3 font-bold"
              >
                Set Preferred
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
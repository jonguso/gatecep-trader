import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 rounded-2xl p-8 shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-2">
          Gatecep Login
        </h1>

        <p className="text-slate-400 mb-6">
          Sign in to the OMS platform.
        </p>

        {error && (
          <div className="bg-red-950 border border-red-500 text-red-300 rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-slate-800 rounded-xl p-3 mb-4"
          placeholder="Username"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 rounded-xl p-3 mb-5"
          placeholder="Password"
        />

        <button className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl p-3 font-bold">
          Login
        </button>

        <div className="text-xs text-slate-500 mt-5">
          Demo users: admin/admin123, trader/trader123, risk/risk123, compliance/compliance123
        </div>
      </form>
    </div>
  );
}
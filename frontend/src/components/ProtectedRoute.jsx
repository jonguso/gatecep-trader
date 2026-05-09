import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="p-10 text-white bg-slate-950 min-h-screen">
        <h1 className="text-2xl font-bold text-red-400">
          Access Denied
        </h1>
        <p className="text-slate-300 mt-2">
          Your role does not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}
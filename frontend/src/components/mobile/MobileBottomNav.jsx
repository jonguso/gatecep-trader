import { useLocation } from "react-router-dom";

export default function MobileBottomNav() {
  const location = useLocation();

  function active(path) {
    return location.pathname === path ||
      location.pathname.startsWith(path + "/");
  }

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
    label: "Portfolio",
    path: "/mobile/portfolio"
  },
  {
    label: "Wallet",
    path: "/mobile/wallet"
  },
  {
    label: "Pro",
    path: "/mobile/pro"
  }
];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 grid grid-cols-5 text-center text-xs text-white z-50">
      {items.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`py-3 font-bold ${
            active(item.path)
              ? "text-cyan-400 bg-slate-800"
              : "text-slate-300"
          }`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
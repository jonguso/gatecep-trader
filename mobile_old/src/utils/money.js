export function kes(v){ return `KES ${Number(v || 0).toLocaleString("en-KE",{minimumFractionDigits:2, maximumFractionDigits:2})}`; }
export function pct(v){ return `${Number(v || 0).toFixed(2)}%`; }
export function ref(symbol){ return `NSE-${new Date().getFullYear()}-${symbol}-${Math.floor(Math.random()*90000+10000)}`; }

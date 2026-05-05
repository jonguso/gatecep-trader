export function compactNumber(v){ const n=Number(v||0); if(n>=1e9)return`${(n/1e9).toFixed(2)}B`; if(n>=1e6)return`${(n/1e6).toFixed(2)}M`; if(n>=1e3)return`${(n/1e3).toFixed(1)}K`; return n.toLocaleString("en-KE");}
export function kesCompact(v){ return `KES ${compactNumber(v)}`; }

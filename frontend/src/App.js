import { useEffect, useState } from "react";
import API, { API_URL } from "./api";

const pages = [
  "Executive Dashboard",
  "Market Watch",
  "Advanced Trading",
  "Orders & Blotter",
  "Portfolio Valuation",
  "Funds & Cash",
  "Risk Management",
  "Reports & Audit",
  "KYC & Profile",
  "Coach G"
];

export default function App() {
  const [page, setPage] = useState("Executive Dashboard");
  const [userId, setUserId] = useState("u1");
  const [symbol, setSymbol] = useState("SCOM");
  const [securities, setSecurities] = useState([]);
  const [prices, setPrices] = useState({});
  const [summary, setSummary] = useState(null);
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [book, setBook] = useState({ bids: [], asks: [], symbol: "SCOM" });
  const [orders, setOrders] = useState([]);
  const [audit, setAudit] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [trades, setTrades] = useState([]);
  const [signal, setSignal] = useState(null);

  const load = async () => {
    setSecurities((await API.get("/securities")).data);
    const p = (await API.get("/prices")).data;
    setPrices(Object.fromEntries(p.data.map(x => [x.symbol, x.price])));
    setSummary((await API.get("/market/summary")).data);
    setAccount((await API.get(`/account/${userId}`)).data);
    setPortfolio((await API.get(`/portfolio/${userId}`)).data);
    setOrders((await API.get(`/orders?userId=${userId}`)).data);
    setAudit((await API.get("/audit")).data);
    setLedger((await API.get(`/ledger?userId=${userId}`)).data);
    setSignal((await API.get(`/recommendation/${symbol}/${userId}`)).data);
  };

  useEffect(() => { load(); }, [userId, symbol]);

  useEffect(() => {
    const wsUrl = API_URL.replace("https://", "wss://").replace("http://", "ws://");
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "price") setPrices(msg.data.prices);
      if (msg.type === "orderbook" && msg.data.symbol === symbol) setBook(msg.data);
      if (msg.type === "trade") setTrades(prev => [msg.data, ...prev.slice(0, 40)]);
      if (msg.type === "account_update") load();
    };

    return () => ws.close();
  }, [userId, symbol]);

  const ctx = {
    page, setPage,
    userId, setUserId,
    symbol, setSymbol,
    securities, prices, summary, account, portfolio, book,
    orders, audit, ledger, trades, signal, load
  };

  return (
    <div className="terminal">
      <aside className="sidebar">
        <div className="brand">GATECEP<span>Broker-Ready Platform</span></div>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} className={page === p ? "active" : ""}>{p}</button>
        ))}
        <div className="connection"><span className="dot"></span> CONNECTED<br/><small>BROKER-READY MODE</small></div>
      </aside>

      <main>
        <Topbar {...ctx}/>
        {page === "Executive Dashboard" && <Dashboard {...ctx}/>}
        {page === "Market Watch" && <MarketWatch {...ctx}/>}
        {page === "Advanced Trading" && <Trading {...ctx}/>}
        {page === "Orders & Blotter" && <Orders {...ctx}/>}
        {page === "Portfolio Valuation" && <Portfolio {...ctx}/>}
        {page === "Funds & Cash" && <Funds {...ctx}/>}
        {page === "Risk Management" && <Risk {...ctx}/>}
        {page === "Reports & Audit" && <Reports {...ctx}/>}
        {page === "KYC & Profile" && <Kyc {...ctx}/>}
        {page === "Coach G" && <Coach {...ctx}/>}
      </main>
    </div>
  );
}

function Topbar({ userId, setUserId, symbol, setSymbol, securities, prices, account }) {
  return (
    <div className="topbar">
      <b>{symbol}</b>
      <span className="gold">KES {prices[symbol] || "-"}</span>
      <select value={symbol} onChange={e => setSymbol(e.target.value)}>
        {securities.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
      </select>
      <select value={userId} onChange={e => setUserId(e.target.value)}>
        <option value="u1">Demo Trader</option>
        <option value="u2">Market Maker</option>
      </select>
      <span className="pill">{account?.user?.kycStatus || "KYC"}</span>
    </div>
  );
}

function Dashboard(ctx) {
  return (
    <Page title="Executive Dashboard">
      <div className="cards">
        <Metric title="Market Status" value={ctx.summary?.marketStatus || "-"} />
        <Metric title="Demo Index" value={ctx.summary?.indexValue || "-"} />
        <Metric title="Equity" value={`KES ${ctx.account?.equity?.toFixed(2) || "-"}`} />
        <Metric title="Coach G" value={`${ctx.signal?.action || "-"} ${ctx.signal?.confidence || ""}%`} />
      </div>
      <div className="layout3">
        <Panel title="Top Gainers"><MiniMarket rows={ctx.summary?.gainers || []} setSymbol={ctx.setSymbol}/></Panel>
        <Panel title="Top Losers"><MiniMarket rows={ctx.summary?.losers || []} setSymbol={ctx.setSymbol}/></Panel>
        <Activity trades={ctx.trades}/>
      </div>
    </Page>
  );
}

function MarketWatch({ securities, prices, setSymbol }) {
  return (
    <Page title="Market Watch">
      <Panel title="All Securities">
        <table>
          <thead><tr><th>Symbol</th><th>Security</th><th>Sector</th><th>Price</th></tr></thead>
          <tbody>
            {securities.map(s => (
              <tr key={s.symbol} onClick={() => setSymbol(s.symbol)}>
                <td>{s.symbol}</td><td>{s.name}</td><td>{s.sector}</td><td>{prices[s.symbol] || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Page>
  );
}

function Trading(ctx) {
  return (
    <Page title="Advanced Trading">
      <div className="tradingGrid">
        <Panel title="Watchlist">
          <div className="watchlist">
            {ctx.securities.map(s => (
              <button key={s.symbol} onClick={() => ctx.setSymbol(s.symbol)} className={ctx.symbol === s.symbol ? "selected" : ""}>
                {s.symbol}<span>{ctx.prices[s.symbol] || "-"}</span>
              </button>
            ))}
          </div>
        </Panel>
        <ChartPanel {...ctx}/>
        <DepthPanel {...ctx}/>
        <Ticket {...ctx}/>
      </div>
      <Activity trades={ctx.trades}/>
    </Page>
  );
}

function ChartPanel({ symbol, prices }) {
  const px = prices[symbol] || 10;
  const bars = Array.from({ length: 36 }, (_, i) => Math.max(1, px + Math.sin(i / 2) + (Math.random() - 0.5)));
  const max = Math.max(...bars), min = Math.min(...bars);
  return (
    <Panel title={`${symbol} Chart`}>
      <div className="chart">
        {bars.map((b, i) => <div key={i} className="bar" style={{ height: `${25 + ((b-min)/(max-min+0.01))*180}px` }} />)}
      </div>
      <div className="chartFooter">Demo visualization</div>
    </Panel>
  );
}

function Ticket({ userId, symbol, prices, load }) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState(prices[symbol] || 15);
  const [qty, setQty] = useState(100);
  const [preview, setPreview] = useState(null);

  useEffect(() => setPrice(prices[symbol] || price), [symbol, prices]);

  const previewOrder = async () => {
    setPreview((await API.post("/preview", { symbol, side, qty: Number(qty) })).data);
  };

  const send = async () => {
    try {
      await API.post("/order", { userId, symbol, side, price: Number(price), qty: Number(qty), orderType: "LIMIT" });
      setPreview(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Order failed");
    }
  };

  return (
    <Panel title={`Order Ticket — ${symbol}`}>
      <div className="tabs">
        <button className={side === "BUY" ? "buy" : ""} onClick={() => setSide("BUY")}>BUY</button>
        <button className={side === "SELL" ? "sell" : ""} onClick={() => setSide("SELL")}>SELL</button>
      </div>
      <label>Price</label><input value={price} onChange={e => setPrice(e.target.value)} />
      <label>Quantity</label><input value={qty} onChange={e => setQty(e.target.value)} />
      <div className="readonly">Value: KES {(Number(price) * Number(qty || 0)).toFixed(2)}</div>
      <button onClick={previewOrder}>Execution Insight</button>
      <button className={side === "BUY" ? "buy" : "sell"} onClick={send}>Submit {side}</button>
      {preview && <div className="notice">{preview.message || `Avg Fill ${preview.avgFillPrice}, Slippage ${preview.slippagePercent}%`}</div>}
    </Panel>
  );
}

function DepthPanel({ book }) {
  return (
    <Panel title={`Market Depth — ${book.symbol || ""}`}>
      <h4 className="red">ASKS</h4>
      {book.asks.slice().reverse().map((a, i) => <BookRow key={i} x={a} color="red"/>)}
      <div className="spread">Spread</div>
      <h4 className="green">BIDS</h4>
      {book.bids.map((b, i) => <BookRow key={i} x={b} color="green"/>)}
    </Panel>
  );
}

function Orders({ orders }) {
  return <Page title="Orders & Blotter"><Panel title="Orders"><Data rows={orders} cols={["submittedAt","symbol","side","price","originalQty","qty","status","brokerOrderId"]}/></Panel></Page>;
}

function Portfolio({ portfolio }) {
  return <Page title="Portfolio Valuation"><Panel title="Holdings"><Data rows={portfolio} cols={["symbol","qty","avgPrice","marketPrice","marketValue","totalPnl"]}/></Panel></Page>;
}

function Funds({ account, userId, ledger, load }) {
  const [amount, setAmount] = useState(1000);
  const [phone, setPhone] = useState("254700000000");

  const deposit = async () => {
    await API.post("/payments/mpesa/deposit", { userId, amount: Number(amount), phone });
    load();
  };

  return (
    <Page title="Funds & Cash">
      <div className="cards">
        <Metric title="Cash" value={`KES ${account?.cash?.toFixed(2) || "-"}`}/>
        <Metric title="Buying Power" value={`KES ${account?.buyingPower?.toFixed(2) || "-"}`}/>
        <Metric title="Equity" value={`KES ${account?.equity?.toFixed(2) || "-"}`}/>
      </div>
      <Panel title="M-Pesa Deposit Mock">
        <input value={phone} onChange={e => setPhone(e.target.value)} />
        <input value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={deposit}>Mock STK Deposit</button>
      </Panel>
      <Panel title="Ledger"><Data rows={ledger} cols={["createdAt","type","amount","status","description"]}/></Panel>
    </Page>
  );
}

function Risk({ account, portfolio, signal }) {
  const top = portfolio.slice().sort((a,b)=>b.marketValue-a.marketValue)[0];
  const exposure = account?.holdingsValue ? ((top?.marketValue||0)/account.holdingsValue*100) : 0;
  return (
    <Page title="Risk Management">
      <div className="cards">
        <Metric title="Top Exposure" value={top ? `${top.symbol} ${exposure.toFixed(1)}%` : "None"} />
        <Metric title="Cash" value={`KES ${account?.cash?.toFixed(2) || "-"}`} />
        <Metric title="Signal" value={`${signal?.action || "-"} ${signal?.confidence || ""}%`} />
      </div>
    </Page>
  );
}

function Reports({ audit }) {
  return <Page title="Reports & Audit"><Panel title="Audit Log"><Data rows={audit} cols={["time","event","detail","userId"]}/></Panel></Page>;
}

function Kyc({ account, userId, load }) {
  const approve = async () => {
    await API.post("/kyc/approve", { userId, brokerCustomerId: `BRK-${userId}`, cdsAccount: `CDS-${userId}` });
    load();
  };

  return (
    <Page title="KYC & Profile">
      <Panel title="Customer Profile">
        <p>Name: {account?.user?.name}</p>
        <p>Email: {account?.user?.email}</p>
        <p>KYC: <span className="gold">{account?.user?.kycStatus}</span></p>
        <p>Broker Customer: {account?.user?.brokerCustomerId}</p>
        <p>CDS Account: {account?.user?.cdsAccount}</p>
        <button onClick={approve}>Approve KYC Mock</button>
      </Panel>
    </Page>
  );
}

function Coach({ userId, symbol, signal }) {
  const [answer, setAnswer] = useState("");

  const ask = async () => {
    const res = await API.post("/ai/chat", { userId, symbol });
    setAnswer(res.data.answer);
  };

  return (
    <Page title="Coach G">
      <Panel title="AI Coach Signal">
        <h1 className="gold">{signal?.action} {signal?.confidence}%</h1>
        <p>{signal?.message}</p>
        <button onClick={ask}>Ask Coach G</button>
        {answer && <div className="notice">{answer}</div>}
      </Panel>
    </Page>
  );
}

function Activity({ trades }) {
  return <Panel title="Market Activity"><Data rows={trades} cols={["symbol","qty","price","buyerUserId","sellerUserId"]}/></Panel>;
}

function MiniMarket({ rows, setSymbol }) {
  return (
    <table>
      <thead><tr><th>Symbol</th><th>Price</th><th>%</th></tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.symbol} onClick={() => setSymbol(r.symbol)}>
            <td>{r.symbol}</td><td>{r.price}</td><td className={r.changePct >= 0 ? "green" : "red"}>{r.changePct}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Page({ title, children }) {
  return <section className="page"><h1>{title}</h1>{children}</section>;
}

function Panel({ title, children }) {
  return <div className="panel"><h3>{title}</h3>{children}</div>;
}

function Metric({ title, value }) {
  return <div className="metric"><span>{title}</span><b>{value}</b></div>;
}

function BookRow({ x, color }) {
  return <div className={`bookrow ${color}`}><span>{x.price}</span><span>{x.qty}</span></div>;
}

function Data({ rows = [], cols = [] }) {
  return (
    <table>
      <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{cols.map(c => <td key={c}>{format(r[c])}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function format(v) {
  if (typeof v === "number") return Number(v).toFixed(2);
  if (typeof v === "boolean") return v ? "YES" : "NO";
  return v ?? "-";
}

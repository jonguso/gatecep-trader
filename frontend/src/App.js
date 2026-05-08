import { useEffect, useState } from "react";
import API from "./api";
import OrdersPage from "./pages/OrdersPage";

const pages = ["Dashboard", "Markets", "Brokers", "Onboarding", "Trade", "Portfolio", "Orders", "Coach G", "Audit"];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [symbol, setSymbol] = useState("SCOM");
  const [account, setAccount] = useState(null);
  const [securities, setSecurities] = useState([]);
  const [prices, setPrices] = useState({});
  const [brokers, setBrokers] = useState([]);
  const [links, setLinks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [orders, setOrders] = useState([]);
  const [audit, setAudit] = useState([]);
  const [answer, setAnswer] = useState("");

  const load = async () => {
    const [a, s, p, b, l, pf, o, au] = await Promise.all([
      API.get("/account/u1"),
      API.get("/securities"),
      API.get("/prices"),
      API.get("/brokers"),
      API.get("/brokers/links?userId=u1"),
      API.get("/portfolio/u1"),
      API.get("/orders?userId=u1"),
      API.get("/audit")
    ]);
    setAccount(a.data);
    setSecurities(s.data);
    setPrices(Object.fromEntries((p.data.data || []).map(x => [x.symbol, x.price])));
    setBrokers(b.data);
    setLinks(l.data);
    setPortfolio(pf.data);
    setOrders(o.data);
    setAudit(au.data);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const connectBroker = async (brokerId) => {
    await API.post("/brokers/link", { userId: "u1", brokerId, brokerCustomerId: `CLIENT-${brokerId}-U1`, cdsAccount: `CDS-${brokerId}-U1` });
    await API.post("/brokers/select", { userId: "u1", brokerId });
    await load();
  };

  const askCoach = async () => {
    const res = await API.post("/ai/chat", { userId: "u1", symbol });
    setAnswer(res.data.answer);
  };

  return (
    <div className="app">
      <aside>
        <div className="brand">GATECEP<span>AI Coach + Multi-Broker</span></div>
        {pages.map(p => <button key={p} onClick={() => setPage(p)} className={page === p ? "active" : ""}>{p}</button>)}
      </aside>

      <main>
        <header>
          <b>{symbol}</b>
          <span className="gold">KES {prices[symbol] || "-"}</span>
          <select value={symbol} onChange={e => setSymbol(e.target.value)}>
            {securities.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>)}
          </select>
          <button onClick={load}>Refresh</button>
        </header>

        {page === "Dashboard" && <Dashboard account={account} />}
        {page === "Markets" && <Markets securities={securities} prices={prices} setSymbol={setSymbol} />}
        {page === "Brokers" && <Brokers brokers={brokers} links={links} connectBroker={connectBroker} />}
        {page === "Onboarding" && <Onboarding />}
        {page === "Trade" && <Trade symbol={symbol} load={load} />}
        {page === "Portfolio" && <Table title="Portfolio" rows={portfolio} cols={["symbol","qty","avgPrice","marketPrice","marketValue","totalPnl"]} />}
        {page === "Orders" && <Table title="Orders" rows={orders} cols={["submittedAt","symbol","side","price","originalQty","status","brokerId","brokerOrderId"]} />}
        {page === "Coach G" && <Coach symbol={symbol} askCoach={askCoach} answer={answer} />}
        {page === "Audit" && <Table title="Audit" rows={audit} cols={["time","event","detail","userId"]} />}
      </main>
    </div>
  );
}

function Dashboard({ account }) {
  return (
    <section>
      <h1>Dashboard</h1>
      <div className="cards">
        <Metric title="Equity" value={`KES ${account?.equity?.toFixed(2) || "-"}`} />
        <Metric title="Cash" value={`KES ${account?.cash?.toFixed(2) || "-"}`} />
        <Metric title="P&L" value={`KES ${account?.totalPnl?.toFixed(2) || "0.00"}`} />
        <Metric title="Broker" value={account?.user?.selectedBrokerId || "-"} />
      </div>
      <div className="notice">Coach G provides AI-assisted analysis only. Confirm trades through your selected licensed broker.</div>
    </section>
  );
}

function Markets({ securities, prices, setSymbol }) {
  return (
    <section>
      <h1>Market Watch</h1>
      <div className="panel">
        <table><thead><tr><th>Symbol</th><th>Name</th><th>Sector</th><th>Price</th></tr></thead>
        <tbody>{securities.map(s => <tr key={s.symbol} onClick={() => setSymbol(s.symbol)}><td>{s.symbol}</td><td>{s.name}</td><td>{s.sector}</td><td>{prices[s.symbol] || "-"}</td></tr>)}</tbody></table>
      </div>
    </section>
  );
}

function Brokers({ brokers, links, connectBroker }) {
  const status = id => links.find(l => l.brokerId === id)?.status || "NOT LINKED";
  return (
    <section>
      <h1>Broker Marketplace</h1>
      <div className="grid">
        {brokers.map(b => <div className="panel" key={b.id}>
          <h3>{b.name}</h3>
          <p>{b.notes}</p>
          <p>Status: <b className="gold">{b.status}</b></p>
          <p>Link: {status(b.id)}</p>
          <p>Fees: {b.fees.commissionBps / 100}% min KES {b.fees.minFee}</p>
          <button onClick={() => connectBroker(b.id)}>Connect / Select</button>
        </div>)}
      </div>
    </section>
  );
}

function Onboarding() {
  return (
    <section>
      <h1>Broker Onboarding Wizard</h1>
      <div className="panel">
        <p>The mobile app includes the full step-by-step wizard:</p>
        <ol>
          <li>Choose broker</li><li>Personal details</li><li>CDS details</li><li>KYC documents</li><li>Risk profile</li><li>Terms acceptance</li><li>Broker review</li><li>Trading enabled</li>
        </ol>
      </div>
    </section>
  );
}

function Trade({ symbol, load }) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");
  const [result, setResult] = useState(null);

  const submit = async () => {
    const res = await API.post("/order", { userId: "u1", symbol, side, price: Number(price), qty: Number(qty) });
    setResult(res.data);
    load();
  };

  return (
    <section>
      <h1>Broker-Aware Trade</h1>
      <div className="panel ticket">
        <button className={side === "BUY" ? "buy" : ""} onClick={() => setSide("BUY")}>BUY</button>
        <button className={side === "SELL" ? "sell" : ""} onClick={() => setSide("SELL")}>SELL</button>
        <label>Price</label><input value={price} onChange={e => setPrice(e.target.value)} />
        <label>Qty</label><input value={qty} onChange={e => setQty(e.target.value)} />
        <button onClick={submit}>Submit to Selected Broker</button>
      </div>
      {result && <pre>{JSON.stringify(result.brokerResponse, null, 2)}</pre>}
    </section>
  );
}
<OrdersPage />

function Coach({ symbol, askCoach, answer }) {
  return <section><h1>Coach G</h1><div className="panel"><button onClick={askCoach}>Should I buy {symbol}?</button><p>{answer}</p></div></section>;
}

function Metric({ title, value }) { return <div className="metric"><span>{title}</span><b>{value}</b></div>; }

function Table({ title, rows, cols }) {
  return <section><h1>{title}</h1><div className="panel"><table><thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i) => <tr key={i}>{cols.map(c => <td key={c}>{String(r[c] ?? "-")}</td>)}</tr>)}</tbody></table></div></section>;
}

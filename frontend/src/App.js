import { useEffect, useMemo, useState } from "react";
import API from "./api";

const pages = ["Dashboard","Market Watch","Order Entry","Orders","Portfolio Valuation","Available Funds","Reports","Risk","Coach G"];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [userId, setUserId] = useState("u1");
  const [symbol, setSymbol] = useState("SCOM");
  const [securities, setSecurities] = useState([]);
  const [prices, setPrices] = useState({});
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [book, setBook] = useState({ bids: [], asks: [], symbol: "SCOM" });
  const [orders, setOrders] = useState([]);
  const [audit, setAudit] = useState([]);
  const [trades, setTrades] = useState([]);
  const [signal, setSignal] = useState(null);

  const load = async () => {
    setSecurities((await API.get("/securities")).data);
    const p = (await API.get("/prices")).data;
    setPrices(Object.fromEntries(p.data.map(x => [x.symbol, x.price])));
    setAccount((await API.get(`/account/${userId}`)).data);
    setPortfolio((await API.get(`/portfolio/${userId}`)).data);
    setOrders((await API.get("/orders")).data);
    setAudit((await API.get("/audit")).data);
    setSignal((await API.get(`/recommendation/${symbol}/${userId}`)).data);
  };

  useEffect(() => { load(); }, [userId, symbol]);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
const WS_URL = API_URL.replace("https://", "wss://").replace("http://", "ws://");
const ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "price") setPrices(msg.data.prices);
      if (msg.type === "orderbook" && msg.data.symbol === symbol) setBook(msg.data);
      if (msg.type === "trade") setTrades(prev => [msg.data, ...prev.slice(0, 20)]);
      if (msg.type === "account_update") load();
    };
    return () => ws.close();
  }, [userId, symbol]);

  const ctx = { userId, setUserId, symbol, setSymbol, securities, prices, account, portfolio, book, orders, audit, trades, signal, load };

  return <div className="terminal">
    <aside className="sidebar">
      <div className="brand">GATECEP<span>AI Coach</span></div>
      {pages.map(p => <button key={p} onClick={()=>setPage(p)} className={page===p?"active":""}>{p}</button>)}
      <div className="status">NETWORK<br/><b>CONNECTED</b></div>
    </aside>
    <main>
      <Topbar {...ctx}/>
      {page==="Dashboard" && <Dashboard {...ctx}/>}
      {page==="Market Watch" && <MarketWatch {...ctx}/>}
      {page==="Order Entry" && <OrderEntry {...ctx}/>}
      {page==="Orders" && <Orders {...ctx}/>}
      {page==="Portfolio Valuation" && <Portfolio {...ctx}/>}
      {page==="Available Funds" && <Funds {...ctx}/>}
      {page==="Reports" && <Reports {...ctx}/>}
      {page==="Risk" && <Risk {...ctx}/>}
      {page==="Coach G" && <Coach {...ctx}/>}
    </main>
  </div>;
}

function Topbar({ userId, setUserId, symbol, setSymbol, securities, prices }) {
  return <div className="topbar">
    <b>{symbol}</b><span className="gold">KES {prices[symbol] || "-"}</span>
    <select value={symbol} onChange={e=>setSymbol(e.target.value)}>{securities.map(s=><option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}</select>
    <select value={userId} onChange={e=>setUserId(e.target.value)}><option value="u1">Demo Trader</option><option value="u2">Market Maker</option></select>
    <span className="pill">DELAYED / DEMO DATA</span>
  </div>
}

function Dashboard(ctx) {
  return <Page title="Dashboard">
    <div className="cards">
      <Metric title="Market Status" value="OPEN / DEMO"/>
      <Metric title="Cash" value={`KES ${ctx.account?.cash?.toFixed(2) || "-"}`}/>
      <Metric title="Equity" value={`KES ${ctx.account?.equity?.toFixed(2) || "-"}`}/>
      <Metric title="Coach G" value={`${ctx.signal?.action || "-"} ${ctx.signal?.confidence || ""}%`}/>
    </div>
    <div className="layout3">
      <MarketWatch {...ctx}/>
      <DepthPanel {...ctx}/>
      <Activity {...ctx}/>
    </div>
  </Page>
}

function MarketWatch({ securities, prices, setSymbol }) {
  return <Panel title="Market Watch">
    <table><thead><tr><th>Symbol</th><th>Name</th><th>Price</th></tr></thead><tbody>
      {securities.map(s=><tr key={s.symbol} onClick={()=>setSymbol(s.symbol)}><td>{s.symbol}</td><td>{s.name}</td><td>{prices[s.symbol] || "-"}</td></tr>)}
    </tbody></table>
  </Panel>
}

function OrderEntry(ctx) {
  return <Page title="Order Entry"><div className="layout3"><DepthPanel {...ctx}/><Ticket {...ctx}/><Activity {...ctx}/></div></Page>
}

function Ticket({ userId, symbol, prices, load }) {
  const [side,setSide]=useState("BUY"), [price,setPrice]=useState(prices[symbol]||15), [qty,setQty]=useState(1), [preview,setPreview]=useState(null);
  useEffect(()=>setPrice(prices[symbol]||price),[symbol,prices]);
  const previewOrder=async()=>setPreview((await API.post("/preview",{symbol,side,qty:Number(qty)})).data);
  const send=async()=>{try{await API.post("/order",{userId,symbol,side,price:Number(price),qty:Number(qty)}); setPreview(null); load();}catch(e){alert(e.response?.data?.error||"Order failed")}};
  return <Panel title={`Order Ticket — ${symbol}`}>
    <div className="tabs"><button className={side==="BUY"?"buy":""} onClick={()=>setSide("BUY")}>BUY</button><button className={side==="SELL"?"sell":""} onClick={()=>setSide("SELL")}>SELL</button></div>
    <label>Price</label><input value={price} onChange={e=>setPrice(e.target.value)}/>
    <label>Quantity</label><input value={qty} onChange={e=>setQty(e.target.value)}/>
    <button onClick={previewOrder}>Execution Insight</button><button className={side==="BUY"?"buy":"sell"} onClick={send}>Submit {side}</button>
    {preview && <div className="notice">{preview.message || <>Avg Fill: {preview.avgFillPrice}<br/>Slippage: {preview.slippagePercent}%<br/>Fillable: {preview.fillable ? "Yes":"Partial"}</>}</div>}
  </Panel>
}

function DepthPanel({ book }) {
  return <Panel title={`Market Depth — ${book.symbol || ""}`}>
    <h4 className="red">ASKS</h4>{book.asks.slice().reverse().map((a,i)=><Row key={i} x={a} color="red"/>)}
    <div className="spread">Spread</div>
    <h4 className="green">BIDS</h4>{book.bids.map((b,i)=><Row key={i} x={b} color="green"/>)}
  </Panel>
}
function Row({x,color}){return <div className={`bookrow ${color}`}><span>{x.price}</span><span>{x.qty}</span></div>}

function Orders({ orders }) { return <Page title="Orders"><Panel title="Order Report"><Data rows={orders} cols={["symbol","side","price","qty","status","userId"]}/></Panel></Page> }
function Portfolio({ portfolio }) { return <Page title="Portfolio Valuation"><Panel title="Holdings"><Data rows={portfolio} cols={["symbol","qty","avgPrice","marketPrice","marketValue","totalPnl"]}/></Panel></Page> }
function Funds({ account }) { return <Page title="Available Funds"><div className="cards"><Metric title="Available Cash" value={`KES ${account?.cash?.toFixed(2)||"-"}`}/><Metric title="Buying Power" value={`KES ${account?.buyingPower?.toFixed(2)||"-"}`}/><Metric title="Equity" value={`KES ${account?.equity?.toFixed(2)||"-"}`}/></div></Page> }
function Reports({ audit }) { return <Page title="Reports"><Panel title="Audit Log"><Data rows={audit} cols={["time","event","detail"]}/></Panel></Page> }
function Risk({ account, portfolio, signal }) {
  const top = portfolio.slice().sort((a,b)=>b.marketValue-a.marketValue)[0];
  const exposure = account?.holdingsValue ? ((top?.marketValue||0)/account.holdingsValue*100).toFixed(1) : 0;
  return <Page title="Risk Management"><div className="cards"><Metric title="Top Exposure" value={top?`${top.symbol} ${exposure}%`:"None"}/><Metric title="Signal Risk" value={signal?.confidence<40?"High":"Normal"}/><Metric title="Cash Buffer" value={`KES ${account?.cash?.toFixed(2)||"-"}`}/></div></Page>
}
function Coach({ userId, symbol, signal }) {
  const [answer,setAnswer]=useState("");
  const ask=async()=>setAnswer((await API.post("/ai/chat",{userId,symbol,question:`Should I buy ${symbol}?`})).data.answer);
  return <Page title="Coach G"><Panel title="AI Coach Signals"><h1 className="gold">{signal?.action} {signal?.confidence}%</h1><p>{signal?.message}</p><button onClick={ask}>Ask Coach G</button>{answer&&<div className="notice">{answer}</div>}</Panel></Page>
}
function Activity({ trades }) { return <Panel title="Market Activity"><Data rows={trades} cols={["symbol","qty","price","buyerUserId","sellerUserId"]}/></Panel> }
function Page({title,children}){return <section className="page"><h1>{title}</h1>{children}</section>}
function Panel({title,children}){return <div className="panel"><h3>{title}</h3>{children}</div>}
function Metric({title,value}){return <div className="metric"><span>{title}</span><b>{value}</b></div>}
function Data({rows,cols}){return <table><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{typeof r[c]==="number"?Number(r[c]).toFixed(2):r[c]}</td>)}</tr>)}</tbody></table>}

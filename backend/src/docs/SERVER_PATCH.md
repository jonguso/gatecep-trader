# Add WebSocket market stream to server.js

Install:
```bash
npm install ws
```

Add imports:
```js
import http from "http";
import { attachMarketWebSocket } from "./realtime/marketSocket.js";
import { getMarketSnapshot } from "./routes/marketSnapshot.js";
```

Add route:
```js
app.get("/market/snapshot", getMarketSnapshot);
```

Replace:
```js
app.listen(port, () => console.log(`Gatecep backend running on ${port}`));
```

With:
```js
const server = http.createServer(app);
attachMarketWebSocket(server);
server.listen(port, () => console.log(`Gatecep backend running on ${port}`));
```

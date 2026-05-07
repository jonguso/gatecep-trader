# Broker Mirror server.js patch

Add import:

```js
import { brokerMirrorRouter } from "./routes/brokerMirrorRoutes.js";
```

Add after `app.use(express.json())`:

```js
app.use("/broker-mirror", brokerMirrorRouter);
```

Test:

```bash
curl http://localhost:4000/broker-mirror/portfolio/u1
curl http://localhost:4000/broker-mirror/funds/u1
curl http://localhost:4000/broker-mirror/orders/u1
```

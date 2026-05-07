# Broker server.js patch

Add import:

```js
import { brokerRouter } from "./routes/brokerRoutes.js";
```

Add after `app.use(express.json())`:

```js
app.use("/brokers", brokerRouter);
```

Test:

```bash
curl http://localhost:4000/brokers
curl http://localhost:4000/brokers/user/u1
```

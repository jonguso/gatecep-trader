# Unified Portfolio server.js patch

Add import:

```js
import { unifiedPortfolioRouter } from "./routes/unifiedPortfolioRoutes.js";
```

Add after `app.use(express.json())`:

```js
app.use("/unified-portfolio", unifiedPortfolioRouter);
```

Test:

```bash
curl http://localhost:4000/unified-portfolio/u1
```

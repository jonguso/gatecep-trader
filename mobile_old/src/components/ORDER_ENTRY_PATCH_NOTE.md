# Optional OrderEntrySheet change

In `OrderEntrySheet.js`, change submit from local route:

```js
API.post("/order", orderPayload)
```

to broker mirror route first:

```js
const brokerRes = await API.post("/broker-mirror/orders/place", {
  userId: "u1",
  brokerId: selectedBroker.id,
  order: orderPayload
});
```

Then send/store only if you still want local backup.

The new Portfolio/Funds/Orders screens now read broker mirror data, so broker order placement is the source of truth.

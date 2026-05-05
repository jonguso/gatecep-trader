# Trade screen patch instructions

If you already applied `gatecep-trade-safety-ai-confidence`, update its `getCoachRecommendation` function.

## Replace the API call block with:

```js
const res = await API.post("/ai/recommendation", {
  userId: "u1",
  symbol,
  side,
  price: Number(price),
  qty: Number(qty),
  cashRequired
});

setCoachRec(res.data);
```

## Replace the Coach G card display with AISignalCard

Add import:

```js
import AISignalCard from "../../src/components/AISignalCard";
```

Then inside the Coach G Decision card, add:

```jsx
<AISignalCard recommendation={coachRec} />
```

Or keep your current card, but use:

```js
coachRec.signal
coachRec.confidence
coachRec.riskFlags
coachRec.scores
coachRec.reasons
coachRec.allowAutoEnable
```

## Enable button logic

Set:

```js
const hasDecision = !!coachRec || userOverride;
const canSubmit =
  hasDecision &&
  !duplicate &&
  !inCooldown &&
  !isSubmitting &&
  priceAllowed &&
  (userOverride || coachRec?.allowAutoEnable);
```

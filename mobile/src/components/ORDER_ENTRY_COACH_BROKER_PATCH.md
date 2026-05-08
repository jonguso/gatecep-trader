# Add Coach G broker recommendation to OrderEntrySheet

In `mobile/src/components/OrderEntrySheet.js`:

1. Add import:

```js
import CoachGBrokerRecommendationModal from "./CoachGBrokerRecommendationModal";
```

2. Add state:

```js
const [brokerRecOpen, setBrokerRecOpen] = useState(false);
const [brokerRecommendation, setBrokerRecommendation] = useState(null);
```

3. Change PortfolioImpactModal `onOk` from:

```js
onOk={requestCoach}
```

to:

```js
onOk={requestBrokerRecommendation}
```

4. Add this function before `requestCoach`:

```js
const requestBrokerRecommendation = async () => {
  setImpactOpen(false);

  try {
    const res = await API.post("/brokers/recommend", {
      userId: "u1",
      symbol,
      side,
      orderValue,
      selectedBrokerId: selectedBroker?.id || selectedBroker?.brokerId
    });

    setBrokerRecommendation(res.data);
  } catch {
    setBrokerRecommendation({
      brokerId: selectedBroker?.id || "aib",
      brokerName: selectedBroker?.name || "AIB-AXYS Africa",
      brokerShortName: selectedBroker?.shortName || "AIB",
      accountNumber: "AIB-DEMO-001",
      confidence: 82,
      recommendation: "Coach G recommends this linked broker because broker mirror routing is ready.",
      reasons: [
        "Broker account is linked.",
        "Portfolio and funds mirror are available.",
        "Broker mirror order routing is enabled."
      ],
      routingStatus: "MOCK_READY",
      apiMode: "MOCK_ADAPTER"
    });
  }

  setBrokerRecOpen(true);
};
```

5. In `requestCoach`, add broker values to payload:

```js
brokerId: brokerRecommendation?.brokerId || selectedBroker?.id,
brokerName: brokerRecommendation?.brokerName || selectedBroker?.name
```

6. Render this modal before `CoachGDecisionModal`:

```js
<CoachGBrokerRecommendationModal
  visible={brokerRecOpen}
  recommendation={brokerRecommendation}
  onAccept={() => {
    setBrokerRecOpen(false);
    requestCoach();
  }}
  onChangeBroker={() => {
    setBrokerRecOpen(false);
    setBrokerOpen(true);
  }}
  onCancel={() => setBrokerRecOpen(false)}
/>
```

7. In final order payload, include:

```js
brokerRecommendation
```

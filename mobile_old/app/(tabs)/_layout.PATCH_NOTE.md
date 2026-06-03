# Make Markets Default Page

Open `mobile/app/(tabs)/_layout.js`

Change:

```jsx
<Tabs
  screenOptions={{
```

To:

```jsx
<Tabs
  initialRouteName="markets"
  screenOptions={{
```

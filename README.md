# Gatecep Multi-Broker Foundation

Adds:
- Broker Management screen
- AIB and ABC examples
- Link broker account placeholder
- Open broker sign-up form
- Backend broker list and link routes

Apply:
1. Copy `mobile` and `backend` into your project.
2. Add this in `mobile/app/_layout.js`:
   `<Stack.Screen name="brokers" />`
3. Add this in `SideMenu.js`:
   `<MenuItem icon="business-outline" label="Brokers" onPress={() => go("/brokers")} />`
4. Patch backend `server.js` using `backend/src/docs/BROKER_SERVER_PATCH.md`.

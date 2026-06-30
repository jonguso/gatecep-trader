\# GateCEP Runtime Matrix



\## Purpose



Documents runtime compatibility across backend, web, mobile, and shared.



| Capability | Backend | Web | Mobile | Notes |

|---|---:|---:|---:|---|

| Direct root shared imports | ❌ | ⚠️ | ❌ | Not allowed until package boundary is ready |

| @gatecep/shared package | 🚧 | 🚧 | 🚧 | Target for GateCEP 3.2 |

| Environment variables | ✅ | ✅ | ✅ | Different naming rules by runtime |

| WebSockets | ✅ | ✅ | ✅ | Socket usage must be runtime-tested |

| PostgreSQL | ✅ | ❌ | ❌ | Backend only |

| Redis | ✅ | ❌ | ❌ | Backend only |

| React UI | ❌ | ✅ | ❌ | Web only |

| React Native UI | ❌ | ❌ | ✅ | Mobile only |



\## Rule



Any change crossing runtime boundaries must be validated in every affected runtime before release.


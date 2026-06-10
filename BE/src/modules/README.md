# Backend Modules

This folder contains Backend feature modules. The current baseline keeps only User/Auth support and removes sales domain modules.

Current modules:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, device registration |
| `user` | Current user profile and registered device lookup |
| `health` | Lightweight health endpoint |

Sales domain modules and DDL should be added back later one request at a time.

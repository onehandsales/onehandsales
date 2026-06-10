# Backend Modules

This folder contains Backend feature modules. The current baseline keeps User/Auth support and adds sales domain modules back one request at a time.

Current modules:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, device registration |
| `user` | Current user profile and registered device lookup |
| `company` | User-owned company, company field/region, memo log, encrypted private memo log APIs |
| `health` | Lightweight health endpoint |

Additional sales domain modules and DDL should be added later one request at a time.

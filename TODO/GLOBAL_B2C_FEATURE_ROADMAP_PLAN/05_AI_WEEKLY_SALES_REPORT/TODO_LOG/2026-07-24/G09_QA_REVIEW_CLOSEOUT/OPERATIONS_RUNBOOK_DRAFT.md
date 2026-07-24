# 05 AI Weekly Sales Report Operations Runbook Draft

상태: Draft
작성일: 2026-07-24

## 1. Required Backend Checks

- Run `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, and `pnpm run build` from `BE`.
- Confirm migrations are applied in order after `20260724010000_ai_weekly_report_db`, `20260724020000_add_follow_up_delivery_foundation`, and `20260724030000_allow_follow_up_email_disconnect_token_clear`.
- Confirm no shared/cloud DB migration is executed without the DB/Prisma operations gate.

## 2. Required User Web Checks

- Run `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, and `pnpm run test:e2e:mobile` from `FE/user-web`.
- Install Microsoft Edge or set `PLAYWRIGHT_INCLUDE_EDGE=1` only in an environment where the `msedge` channel exists.
- For local Chrome-only QA, Edge projects are skipped automatically when Edge is not installed.

## 3. Provider Environment

Do not write secret values into release docs or logs.

Backend key names to confirm:

- `FOLLOW_UP_DELIVERY_ENCRYPTION_KEY`
- `FOLLOW_UP_DELIVERY_ENCRYPTION_KEY_VERSION`
- `FOLLOW_UP_GOOGLE_CLIENT_ID`
- `FOLLOW_UP_GOOGLE_CLIENT_SECRET`
- `FOLLOW_UP_MICROSOFT_CLIENT_ID`
- `FOLLOW_UP_MICROSOFT_CLIENT_SECRET`
- `FOLLOW_UP_MICROSOFT_TENANT_ID` if the tenant is not `common`
- production SMS provider credential keys after the real SMS adapter is selected

Fallbacks:

- `ENCRYPTION_MASTER_KEY` can satisfy the follow-up encryption key in local/dev.
- `ENCRYPTION_KEY_VERSION` can satisfy the follow-up encryption key version in local/dev.
- Non-production SMS delivery uses the test provider; production returns a safe provider-unavailable result until a real adapter is configured.

## 4. OAuth Callback URLs

Register these callback URLs in provider consoles, replacing the host with the public Backend API host used by `VITE_API_URL`:

- `https://<api-host>/api/follow-up-delivery/email-connections/google/callback`
- `https://<api-host>/api/follow-up-delivery/email-connections/microsoft/callback`

The User Web builds the callback URL from `VITE_API_URL`, so release smoke must use the same public API origin that is registered in Gmail/Microsoft.

## 5. Smoke Checklist

- Generate an AI weekly report for a user/week/timeZone with schedules, deals, and meeting notes.
- Confirm duplicate generation while `GENERATING` is rejected and a retry creates a new version after failure.
- Confirm detail response returns report sections and `snapshot-summary` does not expose raw meeting note body.
- Connect Gmail and Microsoft 365 in `/app/settings` and verify masked connection status.
- Register and verify an SMS sender number, then confirm only masked phone data is returned.
- Create a follow-up draft from an AI `FOLLOW_UP` suggestion and edit body before send.
- Send email and SMS once each, then confirm duplicate send does not create duplicate provider attempts.
- Simulate provider rate limit/timeout/unavailable and confirm safe error and retry behavior.
- Verify history appears in AI report, deal detail, and contact detail timelines.
- Run mobile 390px/360px QA for `/app/schedules/week`, compose dialog, settings, and timeline.

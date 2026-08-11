# API Spec

상태: Confirmed
구현 상태: User API G02 Done / internal scheduling-delivery G03 Done / User Web G04 Done / QA G05 Done

## 1. 목적

이 폴더는 `02_NOTIFICATION_REMINDER`의 User Web과 Backend가 함께 보는 API 계약을 둔다.

## 2. 계약 문서

| 문서 | 계약 상태 | 소비자 | 설명 |
|---|---|---|---|
| `NOTIFICATION_API.md` | confirmed | User Web | 알림 목록, unread count, 읽음 처리, 설정, browser push subscription API |

## 3. 구현 기준

- API 구현 goal은 `COMMON/GOAL-SPECS/G02_BACKEND_NOTIFICATION_API.md`를 따른다.
- reminder 생성과 delivery 구현 goal은 `COMMON/GOAL-SPECS/G03_REMINDER_GENERATION_DELIVERY.md`를 따른다.
- User Web 구현 goal은 `COMMON/GOAL-SPECS/G04_USER_WEB_NOTIFICATION_UX.md`를 따른다.
- API 계약은 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`와 `API_CONTRACT.md` 기준을 따른다.

## 4. 주의

- 이 API는 User API이며 `/api/*` 경로만 사용한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- email body 전문, push endpoint/key, provider raw response, private memo, meeting note body, deal amount는 response/log에 원문으로 노출하지 않는다.

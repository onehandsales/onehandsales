# G10 Cross Plan Coverage

상태: confirmed
연결 Goal: G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION
작성일: 2026-08-05

## 1. 판단 기준

G10 후속 작업 여부는 아래 문서와 실제 코드 상태를 기준으로 판단한다.

- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `BE/src/modules/follow-up`
- `FE/user-web/src/features/follow-up-delivery`
- `BE/prisma/schema.prisma`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`

`TODO/DONE`은 재학습 대상에서 제외한다.

## 2. 실제 코드 대조 결과

| 영역 | 상태 | G10 판단 |
|---|---|---|
| OAuth 연결 | Gmail/Microsoft authorization URL, token exchange, profile 조회 기반 있음 | 유지하고 send scope 검증 보강 |
| Token 저장 | follow-up delivery encryption port와 `ExternalEmailConnection` 있음 | 유지 |
| Draft/send API | `/api/follow-up-messages/*` 있음 | 기존 API 유지 |
| 실제 email send | production에서 `FollowUpProviderUnavailable`로 끝남 | G10 직접 구현 대상 |
| SMS send | production provider 없음 | G10 제외 |
| User Web settings/compose | follow-up delivery feature 있음 | reconnect/safe error UX 보강 |
| Admin provider failure | 11에서 `FollowUpDeliveryAttempt` source 사용 | safe field 유지, 새 11 goal 불필요 |
| Product analytics | follow-up 세부 event는 09 scope 밖 | 새 09 goal 불필요 |

## 3. 05에 남길 후속 구현

G10으로 05에 문서화하고 구현한다.

- Gmail API 실제 email send adapter
- Microsoft Graph 실제 email send adapter
- access token refresh 후 발송
- invalid_grant/revoked/insufficient scope reconnect-required 처리
- send-only scope 검증
- smoke allowlist backend env
- smoke allowlist 차단 시 provider 호출 없이 safe failed attempt 저장
- User Web reconnect CTA와 safe failure rendering 보강
- provider raw/token/body/recipient log redaction 검증
- Gmail/Microsoft production-equivalent allowlist smoke 검증

## 4. 09에 문서화하지 않는 이유

09 Product Analytics 문서에는 Notification/Calendar/follow-up 세부 event가 09 activation/retention/AI usage/core usage 범위를 넘는다고 정리되어 있다.

G10은 신규 분석 event를 만들지 않는다. provider send 성공/실패는 `FollowUpDeliveryAttempt`와 existing Admin provider failure 계약으로 추적한다.

따라서 09 폴더에 새 goal 문서를 추가하지 않는다.

## 5. 11에 문서화하지 않는 이유

11 Admin Operation의 `ADMIN_PROVIDER_FAILURE_API.md`는 EMAIL/SMS provider failure source로 `FollowUpDeliveryAttempt`를 이미 포함한다.

G10은 해당 table의 safe field를 그대로 사용한다. provider raw response, prompt, token, body를 저장하지 않는 계약도 11과 충돌하지 않는다.

따라서 11 폴더에 새 goal 문서를 추가하지 않는다.

단, G10 구현 중 아래 중 하나가 생기면 11 문서도 같이 갱신한다.

- `FollowUpDeliveryAttempt` source field 의미 변경
- Admin provider failure에서 email provider 상세 safeContext 추가
- provider failure filter 값 추가
- provider raw 또는 recipient 원문 저장 요구 발생

## 6. 별도 후속으로 남길 기능

G10에서 하지 않는다.

| 기능 | 위치 판단 |
|---|---|
| SMS 실제 provider 구현 | 05 밖 별도 후속 또는 SMS 확장 계획 |
| B2B tenant sender 정책 | B2B 전환 계획 |
| email sequence/campaign | Growth/retention 후속 |
| unsubscribe 관리 | campaign/sequence 정책 확정 후 |
| MeetingNote follow-up 자동 발송/알림 | post-12 재검토 후보 |
| email inbox sync | 별도 privacy/API/DB 계획 필요 |
| Google/Microsoft calendar write/watch | 04 후속 또는 post-12 |
| provider smoke 운영 대시보드 확장 | 11 system gate 후속 |

## 7. 체크리스트

- [x] 05 내부 후속으로 G10을 분리했다.
- [x] 09 Product Analytics 신규 goal이 필요 없는 이유를 확인했다.
- [x] 11 Admin Operation 신규 goal이 필요 없는 이유를 확인했다.
- [x] SMS/B2B/sequence/email sync를 G10 범위에서 제외했다.
- [x] 실제 코드의 production email send 미구현 상태를 G10 직접 구현 대상으로 기록했다.

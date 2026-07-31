# Planning Review

상태: Reviewed
검토일: 2026-07-31

## 1. 검토 범위

- 11 Admin Operation 전체 문서 구조
- G01~G10 goal spec 필수 섹션
- API-TODO와 API-SPEC path 일치
- DB schema 후보의 Prisma 구현 가능성
- 11/12 결제·구독 범위 분리
- Trash soft delete 정책 반영 여부
- UXUI/SOFTWARE_AGENT 참조 여부

## 2. 발견 및 수정

| 항목 | 조치 |
|---|---|
| Trash recovery status 후보에 결제 의미가 섞여 있었음 | recovery 정책 의미의 status로 변경 |
| Admin analytics response에 제외 항목 객체가 있었음 | 11 response field에서 제거하고 제외 정책은 문서 설명으로만 유지 |
| `GET /api/users/me/data-export-requests/:requestId`가 API-TODO에는 있으나 API-SPEC 상세 계약에 없었음 | `ACCOUNT_DATA_REQUEST_API.md`에 상태 조회 계약 추가 |
| `ACCOUNT_DATA_REQUEST_API.md` heading 번호가 삽입 과정에서 중복됨 | 1~6 순서로 정리 |
| DB schema 초안이 target user FK로 계정 실제 삭제를 막을 수 있었음 | target user는 UUID snapshot으로 두고 FK를 만들지 않는 기준 추가 |
| 사용자 소유 request table이 `onDelete: Restrict` 후보였음 | 계정 실제 삭제 시 함께 제거될 수 있도록 `onDelete: Cascade` 후보로 수정 |
| `AdminSensitiveAccessLog.auditLogId`가 1:1 의도와 다르게 unique가 없었음 | `@unique` 추가 |
| Admin Web API client 참조가 상대 경로라 애매했음 | `FE/admin-web/src/lib/admin-api-client.ts`로 명시 |

## 3. 재검토 결과

- G01~G10 모든 goal spec에 Request, Response, Business Logic, User Flow, DB/Prisma 영향, 주석 기준, Goal 체크리스트가 있다.
- BE-TODO의 API path는 모두 `COMMON/API-SPEC`에 상세 계약이 있다.
- 결제/구독/plan 상태를 실행 response field로 제공하는 계약은 없다.
- 결제/구독 관련 문구는 제외/금지/12 이관 설명으로만 남아 있다.
- Trash 정책은 hard delete/purge가 아니라 soft delete 보존 기준으로 정리되어 있다.
- Admin Web은 `AGENT/UXUI_AGENT`, Backend/Frontend/DB 작업은 `AGENT/SOFTWARE_AGENT`를 필수 참조로 둔다.

## 4. 남은 검토 사항

초기 계획 검토 기준으로 추가 수정 필요 사항 없음.

## 5. 10 Mobile/PWA 완료 후 재검토

검토일: 2026-07-31

`10_MOBILE_PWA_FIELD_USE` 완료 문서와 실제 schema/code 기준으로 11 반영 여부를 재검토했다.

| 항목 | 판단 | 조치 |
|---|---|---|
| BusinessCard OCR safe failure | 이미 G06에 반영됨 | 유지 |
| Notification/browser push permission UX | G03 사용자 상세 운영 요약에 명시가 부족했음 | `notificationSummary`, endpoint/key/userAgent 원문 금지 체크 추가 |
| Mobile field-use analytics event | G07 Admin analytics에서 10 이벤트 집계가 명시적으로 부족했음 | `mobileFieldUse` aggregate 계약 추가 |
| Push permission result bucket | `permissionState`만 예시에 있고 `browserPushEnabled` bucket이 빠져 있었음 | `browserPushEnabledTrue/False` aggregate 추가 |
| 기존 `BrowserPushSubscription.userAgent` field | Admin 문서가 userAgent 저장 금지처럼 읽힐 수 있었음 | Admin select/response/log 원문 금지로 표현을 좁힘 |
| Local draft | client-local 기능이므로 Admin 직접 관리 대상 아님 | scope 제외 유지, event count만 G07 집계 가능 |
| PWA install/offline shell/native app | 10 1차 제외 및 후속 roadmap | 11에 추가하지 않음 |

재검토 결과 새 goal은 필요 없고, G03/G06/G07/G10과 공통 체크리스트 보강으로 충분하다.

## 6. 최종 확인

10번 완료 반영 후 현재 11 문서 기준으로 추가 수정 필요 사항 없음.

# Release Scope Check

상태: Done
완료일: 2026-07-21

## 1. 목적

이 문서는 `01_IMPORT_JOB_PERSISTENCE`가 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 출시 전 기능 판단과 어떻게 연결되는지 확인한다.

결론:

- 01은 출시까지 필요한 모든 기능을 구현하는 계획이 아니다.
- 01은 Global B2C 첫 판매 gate 중 `Data reliability`의 `Import job 유실 방지` slot을 닫는 계획이다.
- 결제, Admin 운영, 앱 다국어, 다국가 데이터 모델, 제품 분석, Notification은 01 범위에 포함하지 않는다.

## 2. NEXT_BACKEND_API_BACKLOG_PLAN 대조

| 후보 | 01 포함 여부 | 판단 |
|---|---:|---|
| `NBA-001` Deal list `products` summary | No | 딜 목록 제품 summary는 release follow-up이다. 01 Import persistence와 직접 관련 없다. |
| `NBA-002` Contact list `dealCount` | No | 담당자 목록 summary 후보이며 01 범위가 아니다. |
| `NBA-003` latest memo/activity/next action summary | No | core record activity 설계가 필요하다. 01에서 FE가 summary를 꾸미지 않는 원칙만 반영한다. |
| `NBA-004` MeetingNote next/latest summary | No | 회의록 summary/AI 정책 후보이며 01 범위가 아니다. |
| `NBA-005` BusinessCard provider failure contract | No | OCR provider failure 계약이며 import file/parser 오류와 분리한다. |
| `NBA-006` ImportJob persistence/resume API | Yes | 01의 직접 대상이며 구현 및 QA closeout 완료 상태다. |
| `NBA-007` Trash private memo restriction | No | Trash response 보안 정책이며 01 범위가 아니다. |
| `NBA-008` Page size 15 contract cleanup | No | 목록 pagination 계약 정리이며 01 범위가 아니다. |
| `NBA-009` Schedule week report | No | 일정 주간 보고서 후보이며 01 범위가 아니다. |
| `NBA-010` Notification | No | retention 후보이며 01에서 route/sidebar를 노출하지 않는다. |
| `NBA-011` MeetingNote transcript/provider call log | No | provider audit/retention 정책 후보이며 01 범위가 아니다. |
| `NBA-012` Trash 7일 이후 복구 정책 | No | 휴지통 운영/복구 정책 후보이며 01 범위가 아니다. |
| `NBA-013` Admin 운영 UX/API | No | 첫 판매 전 별도 큰 계획이 필요하다. 01은 Admin API를 만들지 않는다. |
| `NBA-014` DB/Prisma migration 운영 gate closeout | Partial | 01에서 신규 migration 검증 기준을 적지만, 전체 DB 운영 gate closeout은 별도 goal이다. |

## 3. USER_WEB_PRODUCTIZATION_GAP_PLAN 대조

| Gate/Gap | 01 포함 여부 | 판단 |
|---|---:|---|
| Product UX의 Import 흐름 | Yes | `/app/import`의 upload, mapping, row edit, confirm, resume UX를 다룬다. |
| Data reliability의 import job 유실 방지 | Yes | DB persistence, TTL, cleanup, refresh/server restart 복구를 다룬다. |
| Trust/policy의 import 데이터 보관 기간 | Partial | 7일 TTL, confirm/cancel/expire file delete 정책은 포함한다. 전체 개인정보/약관 정책은 별도 계획이다. |
| Admin/support | No | ImportJobError는 redacted 이력만 남긴다. 운영 Admin 화면/API는 별도 계획이다. |
| Global UX/localization | No | 01은 한국어 User Web 문구 기준으로 작성한다. `/app` 다국어는 별도 첫 판매 계획이다. |
| Pricing/plan, Billing | No | 결제/구독/entitlement는 01 범위가 아니다. |
| Product analytics | No | import analytics event taxonomy는 01 범위가 아니다. log event key만 정의한다. |
| Retention/Notification | No | Notification은 01 범위가 아니다. |
| 다국가 데이터 모델 | No | phone/currency/address 글로벌 모델 확장은 01 범위가 아니다. import validation은 기존 template/domain 기준을 따른다. |

## 4. 01에서 반드시 닫아야 하는 출시 신뢰 항목

- 새로고침 후 작업 복구
- 탭 이동 후 작업 복구
- 서버 재시작 후 7일 내 작업 복구
- 배포 중 in-memory job 유실 제거
- 다른 사용자 job 접근 차단
- confirm 전 실제 도메인 데이터 미생성
- confirm transaction 전체 rollback
- 원본 파일 binary DB 저장 금지
- 원본 파일 confirm/cancel/expire 이후 삭제 추적
- raw row, provider raw response, phone/email logging 금지
- 사용자는 단순한 `파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료` 흐름만 본다.

## 5. 01 밖으로 유지해야 하는 출시 항목

- 결제/구독, 가격/플랜, entitlement
- 세금/컴플라이언스, 환불, 인보이스
- Admin 운영 API/화면, 민감정보 원문 조회 사유, audit log 운영
- 앱 내부 다국어와 국가별 UX writing
- 다국가 전화번호/통화/주소 모델
- 제품 분석 event taxonomy와 analytics pipeline
- Notification과 reminder delivery
- Schedule week report
- MeetingNote provider audit/transcript retention
- Trash 7일 이후 복구/영구삭제 정책
- 범용 ExportJob

## 6. 완료 판정

01은 `NBA-006` 구현 및 QA closeout까지 완료했다.

완료 goal은 아래 순서로 진행했다.

```text
G01_DB_PERSISTENCE_FOUNDATION -> G02_BACKEND_IMPORT_JOB_API -> G03_USER_WEB_RESUME_UX -> G04_QA_CLEANUP
```

Global B2C 첫 판매 전체 구현은 이 계획 하나로 착수하면 안 된다. 첫 판매 전체는 결제, Admin, 현지화, 분석, 정책을 포함하는 별도 계획 bundle로 나누어야 한다.

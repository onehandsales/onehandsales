# Scope

상태: Confirmed

## 1. 포함 범위

| 항목 | 내용 |
|---|---|
| Admin shell | `FE/admin-web` 운영 콘솔 shell, sidebar, topbar, protected route |
| 사용자 목록/상세 | 사용자 검색, 상태, 가입/최근 로그인, locale/timezone/country, 도메인 count, 활동 summary, notification/browser push safe summary |
| 사용자 활동 | 09 analytics/server event와 핵심 domain created/updated 시각 기반 최근 활동 timeline |
| 도메인 read-only | 회사/담당자/제품/딜/일정/회의록/명함/import/export 요약 탭 |
| 민감정보 마스킹 | email, phone, OAuth provider email, meeting note body, memo, private memo, token, provider metadata redaction |
| 원문 접근 사유 | 민감 원문 조회 시 reason 필수, 별도 API, audit log |
| 감사 로그 | Admin login/access, 사용자 상세 조회, raw access, provider failure detail, Trash 만료 목록, account/data request, system gate action |
| Trash/삭제 | 사용자 7일 무료 복구, 7일 이후 사용자 복구 제한, Admin 삭제 데이터 목록, 복구 문의 queue |
| Trash private memo 제한 | Trash list/detail/restore response에서 private memo 원문 제외 |
| Provider failure | AI/OCR/STT/Calendar/Push/Email/SMS safe failure 조회 |
| Product analytics Admin summary | 09 foundation의 activation, retention, event count, AI usage/cost와 10 mobile field-use event summary |
| 계정 삭제 요청 | User Web 요청, 30일 유예, Admin 상태 조회, 실제 삭제/익명화 job 후보 |
| 데이터 export 요청 | User Web 요청, Admin 상태 조회, 민감 export 옵션, 파일 만료 |
| DB/migration gate | migration status, generate/validate, seed 금지, target 분류, 운영 적용 checklist |
| Backup/restore gate | backup 확인, restore dry-run 기록, 장애 대응 checklist |

## 2. 제외 범위

| 항목 | 이유 |
|---|---|
| 결제/구독/plan/entitlement | 12번 전용 범위 |
| invoice/refund/failed payment recovery | 12번 전용 범위 |
| paid conversion/churn/ARPU/LTV/CAC | 12 billing source 연결 후 판단 |
| Admin 직접 복구 실행/비용 처리 | 12 또는 후속 recovery 정책과 연결되는 범위 |
| Admin 직접 도메인 데이터 수정 | 11 1차는 read-only |
| Customer/B2B tenant admin | 현재 Admin은 내부 최종 관리자 전용 |
| provider raw response 저장 | 보안/개인정보 리스크로 금지 |
| prompt 전문/STT transcript 전문 저장 | provider log와 Admin 화면 모두 금지 |
| DB hard delete/purge for Trash | 사용자 의도와 맞지 않음. Trash는 soft delete 보존 |

## 3. 1차 추천 범위

1차는 운영자가 사용자 상태와 장애를 판단할 수 있는 수준으로 좁힌다.

- G01 문서/계약 sync
- G02 Admin audit/security foundation
- G03 사용자 목록/상세/활동 summary
- G05 Trash 7일 이후 정책과 복구 문의
- G06 provider failure 운영 조회
- G07 09/10 기반 Admin analytics summary
- G09 DB/migration/backup operation gate
- G10 QA closeout

## 4. 보류 또는 후속

- G04 도메인 상세 탭은 사용자 상세 summary 이후 진행한다.
- G08 계정 삭제/데이터 export 요청은 privacy/legal wording과 연결되므로 별도 goal로 실행한다.
- Admin 직접 복구 실행과 비용 처리는 12 또는 후속 recovery goal에서 다룬다.

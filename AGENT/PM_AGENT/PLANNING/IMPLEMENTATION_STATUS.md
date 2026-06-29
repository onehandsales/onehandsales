# Implementation Status

이 문서는 현재 `BE`, `FE/user-web`, `FE/admin-web` 기준 구현 완료/부분 완료/후속 범위를 정리하는 AGENT 정본 문서다.

외부 보조 문서나 `UX Design` 아래 현황 문서가 이 문서와 충돌하면 이 문서를 우선한다. 구현 상태가 바뀌면 이 문서를 먼저 갱신하고, 필요한 경우 `MVP_SCOPE.md`, `PRD.md`, Software/UXUI 문서를 함께 갱신한다.

기준일: 2026-06-29

## 1. 완료 기준

이 문서에서 완료는 Backend API가 있고 Frontend가 실제 API와 연결된 상태를 의미한다.

부분 완료는 화면, route, type, API client, placeholder가 있으나 Backend API가 없거나 제품 정본 흐름이 아닌 상태를 의미한다.

후속은 현재 MVP 정본 범위 밖이거나 별도 계획이 필요한 기능을 의미한다.

## 2. 완료된 기능

| 기능 | Backend | Frontend | 현재 상태 |
| --- | --- | --- | --- |
| Auth/User | 완료 | 완료 | 로그인 provider, token exchange/refresh/logout, `/api/me`, 내 프로필, 기기 목록, settings 흐름 |
| Admin auth | 완료 | 부분 완료 | `GET /admin/api/me`, AdminGuard, Admin Web admin/non-admin 보호 route smoke |
| Home | 완료 API 조합 | 완료 | Schedule/Deal/MeetingNote 데이터를 조합한 `/` 대시보드 |
| Company | 완료 | 완료 | 목록/검색/필터/정렬/page, 생성/상세/수정/삭제, 분야/지역 taxonomy, 메모/개인 메모, Trash 복구, xlsx export |
| Contact | 완료 | 완료 | 목록/검색/필터/정렬/page, 생성/상세/수정/삭제, 부서 taxonomy, 회사 연결, Trash 복구, xlsx export |
| Product | 완료 | 완료 | 목록/검색/필터/정렬/page, 생성/상세/수정/삭제, 카테고리/상태 taxonomy, Trash 복구, xlsx export |
| Deal | 완료 | 완료 | 파이프라인/목록/상세, 생성/수정/삭제, 6단계 stage, 회사/담당자/제품 연결, stage counts, 활동 로그, Trash 복구, xlsx export |
| Schedule | 완료 | 완료 | 일정 목록/캘린더, 생성/상세/수정/삭제. Schedule은 Trash 대상이 아니며 hard delete |
| MeetingNote | 완료 | 완료 | 수동 CRUD, AI draft, STT draft, 저장 후 딜 연동, 삭제/Trash 복구 |
| Search | 완료 | 완료 | Backend `GET /api/search`와 User Web GlobalSearch 연결 |
| Trash | 완료 | 완료 | `/api/trash` 목록, 상세, 복구. Company/Contact/Product/Deal/MeetingNote와 지원 로그의 7일 이내 복구 |
| Domain export | 완료 | 완료 | Company/Contact/Product/Deal 각 도메인별 xlsx 다운로드 |

## 3. Domain Export 정본

Export는 범용 `/api/exports` job이나 `ExportJob` table로 처리하지 않는다. 현재 정본은 각 도메인 목록 화면의 동기 xlsx 다운로드다.

| 도메인 | API | User Web 표시 문구 |
| --- | --- | --- |
| Company | `GET /api/companies/export/xlsx` | `엑셀 다운로드` |
| Contact | `GET /api/contacts/export/xlsx` | `엑셀 다운로드` |
| Product | `GET /api/products/export/xlsx` | `엑셀 다운로드` |
| Deal | `GET /api/deals/export/xlsx` | `엑셀 다운로드` |

도메인 구분은 버튼 문구가 아니라 사용자가 보고 있는 목록 화면과 호출 API로 판단한다. FE icon action의 tooltip/aria-label은 공통 `엑셀 다운로드`를 사용한다.

## 4. 부분 완료 또는 주의 필요

| 기능 | 현재 상태 | 판단 |
| --- | --- | --- |
| Admin Web | FE route와 admin-query placeholder component는 있으나 Backend는 `/admin/api/me`만 제공 | 관리자 페이지와 운영 조회 API는 후속 |
| Generic Export route | User Web `/export` route와 `features/import-export`는 남아 있음 | 현재 제품 정본이 아니며 신규 확장 금지 |
| `/schedules/week` | route는 현재 `/schedules`로 redirect | 별도 주간 보고서 화면은 후속 |

## 5. 미완성 또는 후속 기능

| 기능 | 현재 상태 | 후속 작업 |
| --- | --- | --- |
| BusinessCard OCR | FE `/business-cards`, `/contacts/scan`과 feature는 있으나 Backend OCR module/API 없음 | OCR 업로드, 후보 추출, 확정 API 설계 및 구현 |
| Import | FE `/import`와 feature는 있으나 범용 Import job Backend 없음 | ImportJob, mapping, validation, confirm 흐름 설계 및 구현 |
| Notification | FE notification feature/page는 있으나 Backend notification module/API 없음 | 알림 목록, 읽음 처리, unread count, 설정 API 설계 및 구현 |
| Tag | FE feature 흔적은 있으나 route/API/domain 기준 완료 아님 | 제품 범위 재확정 후 도메인 설계 |
| Admin pages | dashboard, users, companies, contacts, products, deals, audit logs, sensitive raw access API 없음 | Admin query API, 마스킹, 원문 조회 사유, 감사 로그와 함께 구현 |
| MeetingNote Admin | 관리자용 회의록 조회/감사/민감 원문 API 없음 | Admin API 범위 확정 후 구현 |
| Generic ExportJob | 현재 제품 방향에서 제외 | 신규 구현하지 않음. 필요 시 별도 결정 필요 |
| Generic DealActivity table | 현재는 도메인별 로그/활동 흐름 중심 | 범용 activity table과 activity type 관리는 후속 |
| 7일 이후 복구 | 7일 이내 Trash 복구는 완료. 7일 이후 복구 없음 | 유료 복구/운영 복구 정책 확정 후 구현 |
| Permanent delete 운영 API | 사용자/Admin 즉시 완전 삭제 API 없음 | 보존 정책, 감사 로그, 권한 정책 확정 후 구현 |
| Weekly report | 주간 일정 보고서 PDF/Excel 없음 | 주간 보고서 화면과 export 요구사항 확정 후 구현 |
| Sensitive export | 민감 데이터 포함 export 없음 | 마스킹, 경고, 감사 로그, 권한 정책과 함께 구현 |
| Payment/operation | 계좌이체 입금 확인, 유료 상태/권한 관리 없음 | Admin 운영 기능으로 후속 구현 |

## 6. Admin 정본 상태

관리자 페이지는 후속 단계에서 만든다.

현재 완료된 Admin 범위:

- Backend `GET /admin/api/me`
- AdminGuard 기반 관리자 권한 확인
- `FE/admin-web` login/protected route/mock token 검증
- admin-query placeholder route/component

후속 Admin 범위:

- Dashboard
- User list/detail
- Company/Contact/Product/Deal 운영 조회
- 사용자별 도메인 데이터 조회
- Audit log
- Sensitive raw access
- 민감정보 기본 마스킹
- 원문 조회 사유 입력과 감사 로그
- 계좌이체 입금 확인
- 유료 상태/권한 관리

## 7. 관련 정본 문서

- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`

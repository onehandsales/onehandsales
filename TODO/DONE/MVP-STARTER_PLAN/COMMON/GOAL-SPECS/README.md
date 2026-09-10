# Goal 상세 명세 인덱스

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 1. 목적

이 폴더는 `MVP-STARTER_PLAN`의 각 `/goal`별 구현 직전 상세 명세를 관리한다.

`COMMON/GOAL-WORK-ORDER.md`가 작업 순서를 정한다면, 이 폴더는 각 goal을 실제로 구현할 때 필요한 화면 명세, API 연결, DB 연결, 상태, validation, 테스트 기준을 설명한다.

## 2. 문서 목록

| 우선순위 | 문서 | 포함 goal |
|---|---|---|
| P0 | `P0-G00-G04-FOUNDATION.md` | G00-G04 |
| P1 | `P1-G05-G11-CORE-DATA.md` | G05-G11 |
| P2 | `P2-G12-G16-DEAL-LOOP.md` | G12-G16 |
| P3 | `P3-G17-G20-SCHEDULE-MEETING.md` | G17-G20 |
| P4 | `P4-G21-G29-AUTOMATION.md` | G21-G29 |
| P5 | `P5-G30-G32-ADMIN-AUDIT.md` | G30-G32 |
| P6 | `P6-G33-G36-TEST-RELEASE.md` | G33-G36 |

## 3. 사용 방식

- `/goal`을 실행하기 전 해당 goal이 포함된 문서를 먼저 확인한다.
- 화면이 있는 goal은 `화면 명세`와 `상태/validation`을 구현 기준으로 삼는다.
- Backend API가 있는 goal은 `COMMON/API-SPEC`의 해당 문서를 함께 확인한다.
- DB 변경이 있는 goal은 `BE-TODO/DB-SCHEMA.md`의 연결 모델을 함께 확인한다.
- 완료 기준은 `GOAL-WORK-ORDER.md`와 이 폴더의 상세 명세를 모두 만족해야 한다.

## 4. Goal별 구현 전 확인 매트릭스

각 `/goal`을 실행하기 전에는 아래 문서 연결을 먼저 확인한다. 화면 구현 goal은 화면 명세와 API 계약을 함께 보고, Backend 구현 goal은 API 계약과 DB 스키마를 함께 본다.

| Goal | 구현 관점 | 화면/상태 기준 | API 계약 기준 | DB 기준 |
|---|---|---|---|---|
| G00 | 운영/API/DB 정책 결정 | `P0-G00-G04-FOUNDATION.md`의 G00 화면 명세 | 없음 | `G00-DECISIONS.md` 기준 package manager, Node, local DB, Supabase, auth/session, 삭제/복구, 민감정보, Import/Export, 외부 provider 실제 연동, `.env.example` 결정 |
| G01 | Backend 기반 | health 응답 확인 수준 | `API-SPEC/G01-G05-FOUNDATION-AUTH-API.md` | DB 연결 전 단계 또는 Prisma 연결 준비 |
| G02 | User Web 기반 | `/login`, `/` shell, 인증 상태 | `API-SPEC/G01-G05-FOUNDATION-AUTH-API.md` | `User`, `UserSetting` 조회 전제 |
| G03 | Admin Web 기반 | `/login`, `/` admin shell, admin 권한 상태 | `API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`, `API-SPEC/G30-G32-ENDPOINT-CONTRACT.md` | `User.role`, `User.status` |
| G04 | DB 기반 | 화면 영향 없음 | health/auth DB 연결 확인 | `BE-TODO/DB-SCHEMA.md` 전체 1차 반영 |
| G05 | Supabase Auth/User Backend | Supabase 로그인, Backend App Token 발급/검증, local User/AuthDevice/AuthSession 동기화, 내 정보/설정 화면 상태 | `API-SPEC/G01-G05-FOUNDATION-AUTH-API.md` | `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`, `UserSetting` |
| G17-G18 | Schedule | 월간 기본 캘린더, 주간 보기 전환, 생성 form, 주간 보고서 | `API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`, `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md` | `Schedule`, `ScheduleReminder`, `ExternalCalendarConnection` |
| G19-G20 | MeetingNote | 회의록 목록, 생성, AI 결과, 딜 연결 | `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`의 MeetingNote 계약 | `MeetingNote`, `AiJob`, `DealActivity` |
| G21-G22 | BusinessCard OCR | 명함 업로드, OCR 결과 확인, 확정 저장 | `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`의 BusinessCard 계약 | `BusinessCardScanLog`, `Company`, `Contact` |
| G23-G24 | Import | 파일 업로드, 매핑 확인, 실행 결과 | `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`의 Import 계약 | `ImportJob`, `ImportJobRow`, 대상 도메인 모델 |
| G25-G26 | Export | Export 생성, 상태, 다운로드 | `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`의 Export 계약 | `ExportJob`, 대상 도메인 모델 |
| G27 | Notification | 알림 목록, 읽음 처리, 알림 설정 | `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`의 Notification 계약 | `Notification`, `UserSetting` |
| G29 | Search | 통합검색 입력, 그룹 결과, 빈 상태 | `API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`의 Search 계약 | `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote` |
| G30-G31 | Admin 조회/Admin Web | Admin dashboard, 사용자/도메인 테이블 | `API-SPEC/G30-G32-ADMIN-AUDIT-API.md`, `API-SPEC/G30-G32-ENDPOINT-CONTRACT.md` | `User`, 도메인 모델, `AuditLog` |
| G33-G36 | 테스트/릴리즈 | User/Admin smoke 시나리오, 통합 점검 | 모든 `API-SPEC`과 `ENDPOINT-CONTRACT` | 전체 DB 스키마와 seed |

## 5. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/README.md`

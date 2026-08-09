# Planning Review

상태: 통과 / pre-12 closeout 완료
작성일: 2026-08-06
최종 업데이트: 2026-08-09
기준: `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`

## 1. 결론

- 판정: 통과
- 이유: 이 폴더는 구현 계획이 아니라 pre-12 후속 후보를 분류하고 closeout하기 위한 문서화 계획으로 충분하다. 2026-08-07 `FINAL-CLASSIFICATION.md`에서 12 전에 할 것 / post-12 / billing 충돌을 분리했고, 2026-08-09 선택된 12 전 처리 대상 5개를 BEFORE_12에서 모두 닫았다.
- 최종 분류: PRE12에는 confirmed API, confirmed migration, confirmed User Web/Admin Web 구현 작업, 남은 pre-12 closeout이 없다.

## 2. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/CANDIDATE-MATRIX.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/GOAL-SPECS/*`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/ADMIN-WEB-TODO.md`
- `FE-TODO/USER-WEB-TODO.md`

## 3. 핵심 발견 사항

| 등급 | 문서 | 문제 | 영향 | 권장 조치 |
| --- | --- | --- | --- | --- |
| Major | API-SPEC | confirmed API가 없다. | 구현 goal로 바로 들어가면 범위를 임의 해석할 위험이 있다. | G00 이후 필요한 후보만 contract 문서로 승격한다. |
| Major | Candidate Matrix | 다음 행동 reminder와 회의록 follow-up reminder는 제품 정책 결정이 필요하다. | 06 작업 범위가 커질 수 있다. | 06에서는 DealActivity event까지만 다룬다. G02/G03 후보는 12 전 구현하지 않고 post-12로 보낸다. |
| Minor | 06 DealActivity | 수동 activity 삭제/retention/audit, memo 통합, 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단은 06 완료 범위 밖이다. | 06을 불필요하게 재오픈하거나 policy 없이 activity lifecycle 기능을 추가할 수 있다. | `PRE12-F39`로 분리하고, 삭제/보존/감사/search/score/AI 계약 전에는 구현하지 않는다. |
| Minor | 07 MeetingNote AI | 목록 summary, follow-up reminder/자동 발송, AI data cleanup, raw/transcript 저장, AI 후보 자동 업무 mutation이 07 완료 범위와 섞일 수 있다. | 07을 불필요하게 재오픈하거나 사용자 확인/감사/rollback 정책 없이 AI 자동 적용 기능을 추가할 수 있다. | G08에서 `PRE12-F02`/`PRE12-F03`/`PRE12-F08`/`PRE12-F14`/`PRE12-F15`/`PRE12-F40`로 분리하고, Admin audit는 11 완료 범위를 참조한다. |
| Minor | 08 Global Data I18N | `/app` locale, 국가/통화/전화번호, 금액 정밀도, 주소/세금/약관, auth provider 확장 후보가 08 완료 범위와 섞일 수 있다. | 08을 불필요하게 재오픈하거나 12 Billing 전제 작업을 앞당길 수 있다. | G09에서 `PRE12-F17`~`PRE12-F25`로 분리하고, market/auth/billing 정책 결정 전에는 구현 goal로 승격하지 않는다. |
| Minor | 09 Product Analytics | account deletion 실제 처리, 세부 event, external provider, UTM/experiment, marketing opt-in, PWA/native attribution 후보가 09 완료 범위와 섞일 수 있다. | 09를 불필요하게 재오픈하거나 12 Billing/marketing/trust 정책을 앞당길 수 있다. | G10에서 `PRE12-F26`~`PRE12-F30` 및 `PRE12-F41`로 분리하고, 12/정책/analytics taxonomy 결정 전에는 구현 goal로 승격하지 않는다. |
| Minor | 10 Mobile PWA Field Use | 10 FE/BE TODO 체크리스트 미체크, FE generic ExportJob 잔여 코드, FE architecture stale route 설명, custom camera preview/crop, server draft/media raw storage가 10 미완성으로 오해될 수 있다. | 10을 불필요하게 재오픈하거나 `/app/export`/`/api/exports`, PWA/offline/native, `getUserMedia` camera/crop, `UserDraft`/raw storage를 12 전 구현할 위험이 있다. | G11에서 `PRE12-F09`, `PRE12-F30`, `PRE12-F31`, `PRE12-F32`, `PRE12-F42`, `PRE12-F43`으로 분리하고, 문서 정리 외 기능 구현은 금지한다. |
| Minor | 11 Admin Operation | 11 문서 체크리스트/goal index와 Admin Web architecture stale, Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지, Admin 직접 도메인 데이터 mutation, Customer/B2B tenant admin 후보가 11 미완성으로 오해될 수 있다. | 11을 불필요하게 재오픈하거나 12 Billing/Trust/ExportJob/Recovery/ops policy/B2B strategy를 앞당길 수 있다. | G12에서 `PRE12-F33`~`PRE12-F37`, `PRE12-F44`, `PRE12-F45`로 분리하고, ImportJob cleanup failure gate는 `PRE12-F13`에 연결한다. 문서 정리 외 기능 구현은 금지한다. |
| Minor | 상위 문서 | 이 새 폴더를 상위 roadmap에 연결해야 한다. | 다음 작업자가 폴더를 놓칠 수 있다. | G99 또는 현재 문서 작성 작업에서 상위 README/overview를 갱신한다. |

## 4. 구현 가능 여부

- 바로 구현 가능 여부: 아니오
- 바로 실행 가능한 PRE12 goal: 없음. `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`는 BEFORE_12에서 닫혔다.
- 구현 전 반드시 필요한 것:
  - `FINAL-CLASSIFICATION.md`의 12 전 처리 대상 5개 외 기능 착수 금지
  - 후보 상태 확정
  - API 계약 confirmed 승격
  - DB 영향 확정
  - FE 표시 위치와 상태 정의
  - 08 후속 후보의 market/auth/billing 정책 결정
  - 09 후속 후보의 privacy/trust/analytics taxonomy/growth/billing/mobile roadmap 결정
  - 10 후속 후보의 PWA/offline/native mobile roadmap, advanced camera capture, server draft/media raw storage 정책 결정
  - 10 문서 체크리스트와 FE architecture route 설명의 정합성 정리
  - 11 문서 체크리스트와 Admin Web architecture route/API 설명의 정합성 정리
  - 11 밖의 Trash recovery 실행, export artifact/download, 자동 민감정보 감지, Admin direct domain mutation, Customer/B2B tenant admin 정책/전략 결정
  - DealActivity 삭제/보존/감사, memo 통합, 공통 activity bus, 검색/필터, score, AI 판단 정책 결정
  - MeetingNote AI 후보 자동 업무 mutation의 사용자 확인, audit, rollback, confidence 기준 결정

## 5. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`

# Implementation Status

> 기존 소스 확인 기준: 2026-11-15. 목표·참조 갱신: 2026-11-17. 아래 구현 기록은 이번 문서 변경에서 코드·DB·런타임으로 재검증하지 않았다.

Status: Current source baseline
Checked: 2026-11-15

현재 실행 코드와 Bonsai 전환 목표를 분리한다. 이번 변경은 문서 정비이며 DB/API/FE 전환 완료를 뜻하지 않는다. 원격 DB 적용 상태와 배포 사이트는 이번 조사에서 확인하지 않았다.

## Backend

단일 NestJS modular monolith + Clean Architecture다. 소스 모듈은 `auth`, `user`, `workspace`, `object-definition`, `list-definition`, `view-definition`, `attribute-definition`, `record-definition`, `error-report`, `support-request`, `public-contact-request`, `health`가 있다.

- 로그인 provider·교환·갱신·로그아웃, 사용자/관리자 권한 확인, 프로필·기기 관리.
- 온보딩 완료 처리와 OWNER Workspace 보장, Workspace 생성·사이드바·기본 Workspace 조회.
- Object/List 생성·사이드바 조회·순서 변경.
- Attribute 생성·조회·수정·순서 변경.
- Record 생성 폼·목록·생성·인라인 값 변경.
- View 헤더·메뉴·TABLE/KANBAN/LIST 데이터, 설정 options/configuration/preview/save.
- 컬럼 설정, 즐겨찾기 및 순서 변경.
- 오류·지원·공개 문의 접수와 Health.

다섯 CRM 정의 모듈의 HTTP handler는 Object 3 / List 3 / Attribute 5 / Record 4 / View 18개다. API 수는 제품 흐름 완성도를 의미하지 않는다.

## DB

[schema.prisma](../../../BE/prisma/schema.prisma)에는 **32개 model, 25개 enum**이 있다. Workspace/Team/Actor와 Object/Attribute/Record/List/Entry/View는 이미 존재한다. Kit 모델은 없다.

현재 구조는 범용 정의·값 모델이다. Bonsai의 고객·거래·견적·문서·프로젝트·청구 기능으로 전환한 상태가 아니다. 전체 모델별 설명과 전환 후보는 [BONSAI_SCHEMA_PLAN](../../SOFTWARE_AGENT/DB_SCHEMA/BONSAI_SCHEMA_PLAN.md)에 있다.

ViewType은 11종이지만 본문은 TABLE/KANBAN/LIST에 구현이 집중되어 있다. CHART/DASHBOARD enum과 Widget 테이블만으로 대시보드 기능이 완료됐다고 볼 수 없다.

## User Web

2026-11-22 최신 추가: G30 커밋 12b20736 이후 G31 템플릿 적용·독립 복사·실패/취소·이력 누락을 보완하고 두 차례 검토와 G30 연결 회귀를 수행했다. 단위100/100, 개발 영향57/58 후 수정 대상9/9, 빌드 전체160/161 후 최신 빌드 대상9/9 통과. 최초 hash 복귀 실패와 수정 후 통과를 구분한다. 원본7상태 비교·자료/시각/환경 대기는 유지하며 G32 이후는 미착수다. [G31 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G31_RESULT.md). Backend/DB/Admin 재검증 아님.

2026-11-22 이전 추가: G30 작업 템플릿 작성의 목 구현·누락 보완·두 차례 검토·12상태 비교를 수행했다. 단위97/97, 개발 영향48/49 후 수정 대상5/5, 빌드 전체156/157 후 최신 빌드 영향10/10 통과. 최초 실패와 수정 후 재실행을 구분한다. G31 적용·독립성 연결은 G30 커밋 이후 진행하며 자료·시각·환경 대기를 유지한다. [G30 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G30_RESULT.md). Backend/DB/Admin 재검증 아님.

2026-11-22 이전 추가: G29 보관·삭제의 관찰 범위 목 구현·두 차례 검토·연결 회귀를 수행했다. 단위93/93·개발 영향 범위58/58·빌드 전체152/152 통과. G28 dc631acf 이후 별도 진행했으며 초기 실패·재실행과 자료·시각·환경 대기를 구분한다. [G29 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G29_RESULT.md). Backend/DB/Admin은 이번에 재검증하지 않았다.


2026-11-22 추가: G28 상태 정의·완료 표시의 관찰 범위 목 구현·두 차례 검토·비교를 수행했다. 단위90/90·빌드 E2E147/147, 개발 전체140/147 뒤 시간 초과/시험 준비 문제 보완 대상11/11 통과. 최초 실패와 재실행을 구분하며 자료·시각·환경 대기는 유지한다. [G28 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G28_RESULT.md). Backend/DB/Admin의 아래 과거 상태는 이번에 재검증하지 않았다.


이전 FE 상태(2026-11-21): G01~G15 관찰 범위 목 구현 후 감사 결함 5건·G13 복귀 정책·문서를 보완했다. 타입/lint/build·unit42/42·개발/빌드 Chromium90/90씩 통과, 실제 API/외부 요청0. [재점검 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_G15_RECHECK_RESULT.md). 원본/시각/환경·R 전체 대기를 유지한다. 아래 표는 2026-11-15의 이전 실행 구조이며 현재 목 화면 목록은 [User Web README](../../../FE/user-web/README.md)를 따른다. Backend/DB/Admin 상태는 이번에 재검증하지 않았다.

| route | 현재 역할 |
| --- | --- |
| `/app` | 기본 Workspace로 이동 |
| `/app/workspaces/:workspaceId` | Workspace 홈; 업무 대시보드는 미완성 |
| `/app/workspaces/:workspaceId/objects/:objectDefinitionId` | Object 소스의 View 화면 |
| `/app/workspaces/:workspaceId/lists/:listDefinitionId` | List 소스의 View 화면 |
| `/app/workspaces/:workspaceId/view-definitions/:viewDefinitionId` | 특정 View 화면 |
| `/app/more` | 기존 더보기 |
| `/:locale/onboarding` | 직업 선택 UI·완료 처리; 직업 기반 Kit 생성은 없음 |

계정 설정, 도움말, 지원/오류 접수, locale 공개 사이트가 있다. `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 과거 경로의 redirect다.

View 설정은 임시 편집 → 미리보기 → 저장/되돌리기이며 낙관적 버전 충돌을 처리한다. Bonsai 화면별로 조사할 저장 방식과 구분한다. `schedule`, `meeting-note`, `trash`는 업무 기능 완성의 증거가 아닌 잔여 feature 경계다.

## Admin Web

`/login`, `/`와 `GET /admin/api/me` 권한 확인이 중심이다. 운영 CRM 관리 화면 전체가 구현된 상태는 아니다.

## 미완성 / 새로 필요한 범위

Bonsai의 고객·거래·견적·합의 문서·프로젝트·작업·시간·청구·수금·포털·인력·보고서·자동화·연동·설정 등의 전체 목표는 [기능 대응표](BONSAI_FEATURE_PARITY_MATRIX.md)로 관리한다.

과거 고정형 Company/Contact/Product/Deal 구현은 제거된 이력이 있다. 그 사실이 새 Bonsai 연락처 모델 도입 금지를 의미하지 않는다. [당시 제거 기록](../../SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md), [2026-11-14 회고](PROJECT_RETROSPECTIVE.md)는 역사 자료다.

## 검증 범위 표시

이 문서는 소스, Prisma, controller, route와 문서를 대조한 결과다. 이전 날짜의 테스트 통과를 이번 실행 결과로 재사용하지 않는다. 이번 문서 작업의 검증은 [검토 기록](../../SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261115.md)에 기록한다.

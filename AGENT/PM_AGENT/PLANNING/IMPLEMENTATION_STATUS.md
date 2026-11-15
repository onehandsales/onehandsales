# Implementation Status

Status: Current source baseline
Checked: 2026-11-15

현재 실행 코드와 folk 전환 목표를 분리한다. 이번 변경은 문서 정비이며 DB/API/FE 전환 완료를 뜻하지 않는다. 원격 DB 적용 상태와 배포 사이트는 이번 조사에서 확인하지 않았다.

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

현재 구조는 범용 정의·값 모델이다. folk 전용 Person/Company/Group 모델은 없다. 전체 모델별 설명과 전환 후보는 [FOLK_SCHEMA_PLAN](../../SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)에 있다.

ViewType은 11종이지만 본문은 TABLE/KANBAN/LIST에 구현이 집중되어 있다. CHART/DASHBOARD enum과 Widget 테이블만으로 대시보드 기능이 완료됐다고 볼 수 없다.

## User Web

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

View 설정은 임시 편집 → 미리보기 → 저장/되돌리기이며 낙관적 버전 충돌을 처리한다. folk의 자동 저장 목표와 구분한다. `schedule`, `meeting-note`, `trash`는 업무 기능 완성의 증거가 아닌 잔여 feature 경계다.

## Admin Web

`/login`, `/`와 `GET /admin/api/me` 권한 확인이 중심이다. 운영 CRM 관리 화면 전체가 구현된 상태는 아니다.

## 미완성 / 새로 필요한 범위

folk Group/People/Companies, 그룹별 필드·권한, 상세 흐름, 완전한 Group 멤버십 조작, Pipeline 카드 이동, view 생성·삭제 전체 흐름, 업무 메모·작업·상호작용, 가져오기/내보내기, 캠페인·연동·AI·대시보드 등은 [기능 대응표](FOLK_FEATURE_PARITY_MATRIX.md)로 관리한다.

과거 고정형 Company/Contact/Product/Deal 구현은 제거된 이력이 있다. 그 사실이 새 folk 연락처 모델 도입 금지를 의미하지 않는다. [당시 제거 기록](../../SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md), [2026-11-14 회고](PROJECT_RETROSPECTIVE.md)는 역사 자료다.

## 검증 범위 표시

이 문서는 소스, Prisma, controller, route와 문서를 대조한 결과다. 이전 날짜의 테스트 통과를 이번 실행 결과로 재사용하지 않는다. 이번 문서 작업의 검증은 [검토 기록](../../SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261115.md)에 기록한다.

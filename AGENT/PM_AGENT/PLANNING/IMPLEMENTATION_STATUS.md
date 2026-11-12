# Implementation Status

Status: Current Runtime Baseline
Date: 2026-11-12 (아래 초기 foundation 기록은 2026-09-12)

2026-11-12 현재 코드에는 Workspace, Object/Attribute/Record, List/Entry/View와 TABLE/KANBAN/LIST 본문이 존재한다. 이번 작업으로 필터·정렬·표시 설정·컬럼 표시명을 같은 임시 상태에서 편집하고 미리보기/저장/되돌리기를 연결했다. 설정 저장은 View 공통이며 낙관적 버전 충돌을 확인한다. 회사 연결 이름은 Object 대표 이름 속성을 사용한다. [구현 및 검증 범위](../../../TODO/VIEW_CONFIGURATION_SAVE_PLAN/README.md)를 따른다. 아래 2~3절의 “미구현” 항목은 초기 기록이며 이 추가 기록과 현재 코드가 우선한다. Kit 자동 구성·나머지8개 View 본문·대표 이름 속성 변경 UI까지 구현했다는 의미는 아니다.

## 1. 목적

이 문서는 현재 코드에 실제로 존재하는 활성 구현 범위를 기록한다.

PM 문서에서 제품 방향을 설명하더라도, 현재 구현 상태를 과장해서 쓰지 않는다. OneHand CRM의 No Setup CRM 방향은 현재 제품 방향이고, CRM Core와 Kit 기반 업무 화면은 아직 후속 구현 대상이다.

## 2. 현재 활성 범위

- Backend: Auth/User, Error Report, Support Request, Public Contact Request, Health, `GET /admin/api/me`
- Frontend User Web: `/app` 빈 홈, `/app/more`, 계정 설정 모달, 도움말 접수, 공개 문의, locale 공개 사이트
- Frontend Admin Web: access token 입력 후 관리자 권한 확인
- Prisma: User/Auth session, ErrorReport, SupportRequest, PublicContactRequest 모델만 유지

## 3. 아직 구현되지 않은 제품 핵심 범위

- Workspace
- Kit
- Object/Attribute/Relationship
- Record
- List/View
- 직군별 CRM 생성 흐름
- 첫 기록 생성 흐름
- Kit 기반 업무 화면
- Team/조직 권한
- Billing/Subscription

위 범위는 PM 제품 방향에서는 중요하지만 현재 런타임에 존재하지 않는다. 구현 계획을 만들 때는 TODO와 Software 문서에서 별도로 설계한다.

## 4. 제거된 런타임 범위

- 고정형 고객사 관리 도메인
- 고정형 고객사 검색 API와 화면
- 고정형 고객사 xlsx export
- 고정형 고객사 앱 화면
- 고정형 고객사/분류/지역 API
- 통합검색 API

위 범위는 현재 `BE`, `FE/user-web`, `BE/prisma/schema.prisma` 기준 런타임에 존재하지 않는다. 다음 CRM 코어는 기존 고정 테이블을 되살리지 않고 Workspace/Kit/Object/Attribute/Relationship/Record/View 계열의 유연한 모델로 별도 설계한다.

## 5. 검증 기준

- BE typecheck/lint/test/build
- FE/user-web typecheck/lint/test/build/e2e
- FE/admin-web typecheck/lint/build/e2e
- Prisma validate/generate

## 6. 문서 기준

문서는 현재 코드에 남아 있는 기능만 활성 구현 범위로 설명한다. 삭제된 고정형 고객사 도메인 문서는 활성 API, 화면, DB 모델처럼 쓰지 않는다.

공개 문의의 회사명과 회사 규모 입력 필드는 실제 `PublicContactRequest` 모델에 남아 있으므로 삭제하지 않는다. 단, 이 필드는 CRM Company record가 아니라 문의 접수 원문 필드다.

## 7. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`

# View 헤더 단건 조회 API 구현 계획 작성 로그

- 일자: 2026-10-25
- 상태: 역할별 계획 폴더 재구성·문서 검토 완료. API 구현 미착수
- 시작 상태: 변경 없는 작업 트리, HEAD `9544896a`
- 사용자 요청: 처음에는 TODO 아래 작업 문서 작성을 요청했고, 추가 요청으로 COMPANY_DOMAIN_PLAN처럼 역할별 문서를 갖춘 계획 폴더로 구성하도록 변경했다. Backend Agent 규칙과 기존 Attribute/Object/Record/View 구현을 참고하고, 향후 구현 후 규칙 준수 검토까지 계획한다.

## 범위

합의한 GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId의 계약·조회 흐름·모듈 경계·파일 범위·검증·구현 후 검토 기준을 작성하고, 추가 요청에 따라 README·COMMON·BE-TODO·FE-TODO로 분리한다. 현재 요청은 문서 작성이며 API/Frontend/DB 구현과 커밋은 포함하지 않는다.

## 최초 작성 진행 기록

- 작업 트리와 적용 지침을 확인했다.
- 기존 Attribute/Object/Record/View의 접근 검증, Query Port, Repository, Module 조립과 스키마를 대조한다.
- 단일 작업 문서는 Backend API 계약 위치 규칙에 따라 TODO/VIEW_HEADER_DETAIL_API_PLAN/COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md에 작성한다. 별도 계획 README/API 명세를 중복 생성하지 않는다.
- 이 로그는 PM 결정 022의 작업 기록이며, TODO의 실행 문서는 1개로 유지한다.
- 합의한 응답 7개 최상위 필드와 nullable 소속을 보존하고, 기존 4개 모듈에서 재사용할 검증·Port·응답 조합 패턴을 문서화했다.
- Object/List 공개 요약 Port, View Query·UseCase·Controller, provider/export, 테스트와 규칙 준수 검토의 파일·계약·완료 기준을 구체화했다.
- TODO/README.md의 과거 '활성 계획 없음' 표기를 새 계획의 confirmed/미구현 상태와 링크로 갱신했다. 새로운 실행 문서는 1개이며 README 변경은 기존 목차 갱신이다.

## 최초 작성 검증·검토

- 단일 실행 문서 개수, 상대 참조 40개, JSON 예시 2개와 합의한 응답 필드, 스키마 View 타입 11개, 문서 공백 검사: 통과.
- 최종 Python 문서 검사(필수 계약 항목·스키마 필드·실행 문서 1개·활성 목차 링크·변경 범위)와 `git diff --check`: 통과.
- API 계약 필수 항목, 공개 Port 소유권과 export, Workspace/멤버/View/부모 범위, null 소속, 오류 변환, transaction·observability와 구현 후 검토표를 대조했다.
- 실제 인증 흐름의 InactiveUser 403도 오류 계약에 포함했다. 읽기에 Actor를 강제하거나 소속 XOR·즐겨찾기 중복 정책을 추가하지 않았다.
- 문서만 변경하므로 BE/FE 실행 테스트는 이번 작업에 필요하지 않다. 구현·실제 DB 테스트를 실행한 것으로 기록하지 않는다.

## 남은 작업

작성한 계획을 기준으로 후속 구현 요청 시 API 1개와 내부 요약 Port를 구현하고 실제 검증·Backend 규칙 검토를 수행한다. 현재는 실행 코드·스키마·환경·Frontend 변경과 커밋이 없다. 실제 DB 검증 환경과 결과는 구현 시 확인한다.

## 추가 요청: COMPANY_DOMAIN_PLAN 형식으로 재구성

- 사용자가 단일 문서 대신 TODO/DONE/COMPANY_DOMAIN_PLAN처럼 README·COMMON·BE-TODO·FE-TODO로 나눈 계획 폴더를 요청했다. 앞선 단일 실행 문서 제한은 이 요청으로 변경됐다.
- 예시의 폴더와 역할별 문서를 확인했다. Company의 과거 도메인/API 내용은 가져오지 않고 문서 구조를 참고한다.
- 합의한 View 헤더 API 경로·응답·조회 로직을 유지하면서 계약, 사용자 흐름, 작업 분담·순서, Backend 구현, DB 범위, 테스트, 최종 규칙 검토를 분리한다.
- Frontend 구현은 기존과 같이 후속 범위다. FE-TODO에는 소비 계약과 보류 범위를 명시하고 활성 Frontend 구현 작업을 추가하지 않는다.
- 재구성 후 문서 간 링크·필수 계약 보존·범위와 상태 일치를 다시 확인한다.
- 계획을 13개 문서로 나눴다. 루트/공통 README, USER-FLOW, WORK-SPLIT, GOAL-WORK-ORDER, PLANNING-REVIEW, API-SPEC, Backend README·DB-SCHEMA·G01·TEST-PLAN·G99, Frontend 후속 README로 구성했다.
- 기존 API 경로와 Response·내부 조회·DB/transaction/로그 계약은 API-SPEC에 유지하고, 구현·테스트·검토의 정본과 상호 링크를 분리했다.
- TODO/README.md의 진입 링크를 계획 README로 바꾸고 단일 문서 표기를 역할별 폴더 구조로 갱신했다.
- 재구성 후 Python 검사: 문서 13개·상대 참조 134개·코드 블록/공백·계약 필수 항목·JSON 예시·스키마 View 타입 11개·역할별 파일 확인 통과.
- API 정본의 HTTP 계약·내부 조회·DB/transaction/observability 3개 절을 원본과 절 번호를 제외하고 비교해 내용 보존을 확인했다.
- `git diff --check`: 통과. BE/FE 실행 코드·스키마·환경·예시 Company 계획은 변경하지 않았다. 실제 API 테스트도 실행하지 않았다.
- 현재 진입 문서는 TODO/VIEW_HEADER_DETAIL_API_PLAN/README.md이며, 첫 후속 구현 단위는 BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md, 필수 구현 후 검토는 BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md다.

## 추가 요청: 문서 변경 커밋

- 사용자가 Git 커밋을 명시적으로 요청했다.
- 커밋 대상은 역할별 계획 문서 13개, TODO/README.md와 이 작업 로그다. API/Frontend/DB 실행 코드는 포함하지 않는다.
- 커밋 전 문서 검사 재실행: 상대 링크 134개, JSON 예시 2개, 합의한 응답 필드, View 타입 11개, 계약 상태와 활성 목차 확인 통과.
- `git diff --check`: 통과. 문서 전용 변경이므로 BE/FE 런타임 테스트는 실행하지 않았다.

## 후속 구현 완료 포인터

위 내용은 계획 작성 당시의 이력이다. 이후 사용자 요청에 따라 Object/List 대상 ID 기반 ③ 헤더 GET으로 계약을 갱신하고 Backend 구현·검증·G99를 완료했다. 현재 계획은 [DONE 보관](../../../TODO/DONE/VIEW_HEADER_DETAIL_API_PLAN/README.md), 실제 실행 결과는 [후속 구현 로그](../VIEW_HEADER_TARGET_GET/WORK_LOG.md)를 참고한다.

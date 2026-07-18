# AGENT Usage Rules

## 1. 목적

이 문서는 사용자가 `AGENT` 폴더를 기준으로 작업을 요청할 때 AI 작업자가 반드시 따를 전역 규칙을 정의한다.

역할별 상세 기준은 각 역할 폴더의 문서를 따른다.

- 제품/문서 운영: `PM_AGENT`
- UX/UI: `UXUI_AGENT`
- 소프트웨어 구현: `SOFTWARE_AGENT`

## 2. `AGENT 학습해줘` 요청 처리 규칙

사용자가 다음과 같이 요청하면 AI 작업자는 `AGENT` 폴더의 모든 문서를 학습 대상으로 본다.

예:

- `AGENT 학습해줘`
- `AGENT 폴더 학습해줘`
- `D:\workspace_repository\sales_b2c_platform\Sales_b2c\AGENT 여기를 학습해줘`

처리 규칙:

1. `AGENT` 아래의 모든 Markdown 문서 경로를 먼저 수집한다.
2. 루트 `AGENT/README.md`를 먼저 읽는다.
3. 그 다음 역할별 README를 읽는다.
4. `PM_AGENT`, `UXUI_AGENT`, `SOFTWARE_AGENT`의 문서를 빠짐없이 읽는다.
5. 읽은 문서 목록과 핵심 학습 내용을 사용자에게 요약한다.
6. 문서 간 충돌이 있으면 `AGENT/README.md`의 충돌 처리 기준에 따라 어느 문서를 우선할지 밝힌다.

중요:

- 일부 문서만 읽고 전체 AGENT를 학습했다고 말하지 않는다.
- 특정 작업에 필요한 문서만 선별해서 읽는 것은 `AGENT 학습`이 아니라 일반 작업 컨텍스트 수집이다.
- 파일이 너무 많아 한 번에 처리하기 어렵다면 먼저 전체 목록을 만들고, 역할별로 순차 학습을 진행한다.

## 3. 문서 검토 기준

문서를 검토할 때는 문서 성격에 맞는 검토 기준을 사용한다.

| 검토 대상 | 기준 문서 |
|---|---|
| TODO 계획, API 명세, DB 스키마, FE/BE 작업 문서 | `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md` |
| 문서 작성 품질, 문서 구조, 관련 문서 연결 | `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md` |
| Backend 구현 구조, API, API 계약, transaction, observability, 배포, 보안 | `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` |
| Frontend 구현 구조, 화면 상태, E2E, 프론트 배포 | `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` |
| UX/UI 화면, 흐름, 정보 우선순위 | `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md` |

사용자가 단순히 `문서 검토해줘`라고 말하면 기본적으로 `PLANNING_REVIEW_CHECKLIST.md`와 `DOCUMENTATION.md`를 함께 적용한다.

## 3A. 전역 UX/UI reference 확인 규칙

모든 작업자는 작업을 시작할 때 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`와 충돌하는 결과가 생기는지 확인한다.

특히 아래 범위가 포함되면 해당 문서를 반드시 먼저 읽고, 관련 UXUI/FRONT_AGENT 문서와 함께 적용한다.

- 화면 설계 또는 Frontend 구현
- 사용자 노출 문구, route, navigation, sidebar, top bar
- 목록, 상세, 생성, 수정, 삭제, 복구, 검색, 필터, pagination
- 회사/담당자/제품/딜/일정/회의록의 linked record와 activity/Memo 기록 흐름
- API request/response가 화면의 record 관계나 상세 표시 방식에 영향을 주는 작업
- DB schema 변경이 화면의 record 관계, 상세 속성, activity/Memo 흐름에 영향을 주는 작업

이 기준은 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`를 제품의 선호 방향으로 고정한다. 단, reference 제품의 brand, copy, visual asset, pixel-level layout은 복제하지 않는다.

## 4. 활성 TODO 재검토 요청 처리 규칙

사용자가 `TODO를 재검토해줘`, `백엔드 API가 다 구성되어 있는지 봐줘`, `프론트에서 무엇을 작업해야 하는지 정리해줘`처럼 요청하면 AI 작업자는 `TODO/DONE`을 제외한 활성 TODO만 검토 대상으로 본다.

처리 규칙:

1. `TODO` 아래 Markdown 문서 목록을 수집하되 `TODO/DONE/**`은 제외한다.
2. 각 활성 계획의 `README.md`, `COMMON/API-SPEC/*`, `FE-TODO/*`, `BE-TODO/*`를 함께 본다.
3. Backend API 구현 여부를 묻는 요청이면 실제 Backend controller, service, Prisma schema와 API 계약 문서를 대조한다.
4. API 명세서는 request 형태, response 형태, 내부 비즈니스 로직, 연결 DB, transaction, observability, 에러 응답, FE/BE 처리 기준이 있는지 확인한다.
5. Frontend 남은 작업은 화면 목적, 사용 API, 검색/필터/페이지네이션/다운로드 같은 주요 사용자 행동, 성공/실패 상태 처리 기준으로 정리한다.
6. 검토 결과는 활성 TODO 문서에 반영한다. 단순 답변으로 끝내지 말고, 다음 작업자가 문서만 보고 FE 또는 BE 작업을 시작할 수 있게 남긴다.
7. 이미 완료 보관된 `TODO/DONE` 문서는 참고 근거가 필요할 때만 읽고, 활성 계획 상태나 남은 작업 판정에는 포함하지 않는다.

## 5. TODO `/goal` 구현 요청 처리 규칙

사용자가 `TODO` 내부 폴더 또는 goal 문서를 지정해 구현을 요청하면 AI 작업자는 다음 순서를 기본으로 따른다.

1. 지정된 TODO 폴더의 `README.md`, `COMMON/API-SPEC/*`, `COMMON/WORK-SPLIT.md`, `BE-TODO/*`, `FE-TODO/*`를 먼저 확인한다.
2. TODO 문서가 지정한 `AGENT` 선행 문서를 함께 읽고 구현 기준으로 삼는다.
3. 구현 범위와 제외 범위를 분리해 Schedule, Admin, 삭제/복구 등 범위 밖 작업을 임의로 추가하지 않는다.
4. 구현 완료 후 해당 `AGENT` review checklist와 TODO goal checklist를 다시 대조한다.
5. 검증 명령을 실행하고, 통과/경고/실패 결과를 TODO goal 문서 또는 완료 보고에 남긴다.
6. 커밋 요청이 포함된 경우 관련 변경만 stage하고, 작업 전부터 있던 미추적/무관 파일은 포함하지 않는다.

## 6. 관련 문서

- `AGENT/README.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

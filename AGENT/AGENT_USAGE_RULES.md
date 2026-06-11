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
| Backend 구현 구조, API, 테스트, 배포, 보안 | `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` |
| Frontend 구현 구조, 화면 상태, E2E, 프론트 배포 | `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` |
| UX/UI 화면, 흐름, 정보 우선순위 | `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md` |

사용자가 단순히 `문서 검토해줘`라고 말하면 기본적으로 `PLANNING_REVIEW_CHECKLIST.md`와 `DOCUMENTATION.md`를 함께 적용한다.

## 4. 관련 문서

- `AGENT/README.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

# 11개 View 주 화면 조회 설계와 검토

- 작성·검토 기준일: 2026-10-30
- 상태: **설계 문서 작성 및 자체 검토 완료 / API 계약 draft / 구현 전**
- 대상: User Web, Backend, 현재 Supabase의 영업 목 데이터
- 방향: **Attio의 데이터 모델·업무 의미 + Notion 스타일의 화면 표현**
- 현재 구현 대상: **Backend 주 화면 조회 endpoint 1개와 11개 타입의 응답·처리**. 프론트 11개 컴포넌트 설계는 후속 연결 참고다.
- 사용자 확정: 필터·정렬 저장 API는 후속. 현재 GET은 DB의 저장 설정을 실행한다. List 집계는 Entry 기준, 종료일 없는 표시는 앞선 A안을 따른다.

## 읽는 순서

| 문서 | 확인할 내용 |
| --- | --- |
| [현재 범위·후속 저장 API·착수 조건](COMMON/SCOPE_AND_DEFERRED_WORK.md) | 조회 API만 진행하는 결정, 사용자 선택, 후속 저장→재조회 흐름 |
| [사용자 흐름과 타입별 텍스트 UX](COMMON/USER-FLOW.md) | 선택한 보기에서 본문까지의 흐름, 11개 화면의 조회 범위 |
| [API 명세](COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md) | API 명·요청·공통 응답·타입별 데이터 계약·오류 |
| [11개 타입별 처리 설계](BE-TODO/VIEW_TYPE_BUSINESS_LOGIC.md) | 각 화면이 읽는 설정·값, 처리 순서, 예외, 실제 데이터 기대값 |
| [백엔드 구조와 공통 조회 의미](BE-TODO/ARCHITECTURE_AND_QUERY_RULES.md) | 공개 Port, 값 해석, 필터·정렬·집계, 일관성·성능 |
| [프론트 컴포넌트와 API 연결](FE-TODO/COMPONENT_AND_QUERY_DESIGN.md) | 11개 컴포넌트, 기존 코드 연결 지점, 캐시·반응형·표시 규칙 |
| [현재 코드·실제 DB 조사](COMMON/CURRENT_STATE_AND_DATA_AUDIT.md) | 구현 사실, Supabase 조회 결과, 목 데이터의 범위와 한계 |
| [설계 검토와 검증 계획](COMMON/PLANNING-REVIEW.md) | 발견한 문제·반영 결과, 미확정 결정, 구현 후 검증 기준 |
| [후속 구현 순서와 완료 기준](COMMON/GOAL-WORK-ORDER.md) | 공통 기반부터 11개 타입 구현·연결·통합 검토까지의 실행 단위 |
| [공식 참고 자료](COMMON/REFERENCES.md) | Attio에서 확인한 동작과 우리 서비스 확장 설계의 경계 |

API 명세에 연결된 `COMMON/API-SPEC/examples/*.json`은 11개 타입의 **제안 응답 전문**이다. API 실행 결과가 아니다. 실제 목 데이터에서 검증한 건수·금액은 DB 조사 문서에 별도로 기록했다.

## 완료 기준과 작업 순서

1. 현재 범위 문서와 DB 조사·검토 결과를 읽는다. P09 저장 기능은 후속이며 GET 착수를 막는 항목에서 제외한다.
2. 이번 GET에 필요한 지원 범위·계산 의미·조회 한도·실패 처리를 확정해 API 계약을 `confirmed`로 만든다. 미지원 확장은 명시적으로 후속 분리한다.
3. 공통 인증·설정·조회 기반과 11개 타입의 조회기·응답 변환을 구현한다. 내부 개발 순서는 나눌 수 있으나 타입 대상은 11개 전체다.
4. Backend 계약·권한·데이터·경계·성능 검증 결과를 기록하고 완료된 GET 계약만 `implemented`로 변경한다.
5. FE 11개 본문 연결과 필터·정렬 저장 API/저장 후 재조회는 후속 작업으로 진행한다. 이 항목의 미구현을 Backend GET 미완료와 혼동하지 않는다.

현재 완료는 **설계·근거·검토 자료 작성 및 조회 범위/후속 작업 구분**이다. 코드, schema, migration, 실제 업무 데이터, 환경 파일은 이번 문서 작업에서 변경하지 않았다. 필터·정렬 저장, 보기 설정 저장, 생성·수정·삭제, 차트/피벗 원본 드릴다운, 대시보드 편집 API는 후속 범위다. 기존 생성·셀 편집 기능을 변경하는 작업도 이번 범위에 포함하지 않는다.

## 반드시 먼저 읽을 기준

- [TODO 작성과 Software Agent 참조 규칙](../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [원본 텍스트 UX](../VIEW_TWO_AREA_TEXT_UX.md)
- [Backend 지침](../../BE/AGENTS.md), [Backend 규칙](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)
- [모듈 경계](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md), [공통 HTTP 계층](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/SHARED_PRESENTATION.md)
- [API 계약](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md), [DB 기준](../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md)
- [Front 규칙](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [UX 참고 기준](../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md)

오래된 아키텍처 문서의 “CRM module 없음” 같은 구현 현황은 현재 코드와 일치하지 않는다. 계층·책임 규칙은 따르고, 구현 유무는 현재 등록된 controller/module과 FE 호출부로 판단했다.

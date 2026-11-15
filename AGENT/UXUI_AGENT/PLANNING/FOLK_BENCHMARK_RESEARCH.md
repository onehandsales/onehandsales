# folk 근거와 화면 조사

Status: Active research baseline — 공식 문서 확인 / 실제 화면 검증 대기
Checked: 2026-11-15

## 근거 구분

- **공식 확인**: 아래 링크의 공개 제품 동작 또는 API 계약.
- **화면 확인**: Nicelydone 출처 또는 실제 계정에서 관찰한 결과. 현재 수집된 folk 화면은 없다.
- **설계 제안**: OneHand CRM에서 재현하기 위한 구현안. folk 내부 DB의 사실로 표현하지 않는다.

## 공식 자료 목록

| ID | 자료 | 확인한 범위 |
| --- | --- | --- |
| F01 | [Data model](https://help.folk.app/en/articles/9790806-folk-data-model) | 연락처·필드·그룹·보기의 개념과 소유 범위 |
| F02 | [Create views](https://help.folk.app/en/articles/4998224-create-views) | 그룹 안의 객체별 탭, Table/Pipeline, 필터·정렬·컬럼 변경 자동 저장 |
| F03 | [Pipeline views](https://help.folk.app/en/articles/6044821-create-custom-pipeline-views) | 선택 필드에 따른 열 분류와 카드 이동, 카드 표시 설정 |
| F04 | [Track deals](https://help.folk.app/en/articles/9552366-track-deals) | 여러 연락처에 연결되는 거래, 사용자 필드·메모·작업 |
| F05 | [Dashboards](https://help.folk.app/en/articles/9867508-dashboards) | 그룹 데이터를 사용하는 별도 대시보드와 차트 |
| F06 | [Adding notes](https://help.folk.app/en/articles/5007332-adding-notes) | 레코드 메모, 그룹 간 공유, 공개/비공개, 댓글·첨부 |
| F07 | [High-level permission](https://help.folk.app/en/articles/14470925-high-level-permission), [Group permissions](https://help.folk.app/en/articles/10230887-group-sharing-permissions) | Workspace 역할과 Group 접근 범위 |
| F08 | [Export data](https://help.folk.app/en/articles/5007388-export-data) | 그룹·보기 CSV 범위와 제외 데이터 |
| F09 | [Hard limits](https://help.folk.app/en/articles/8632488-what-are-folk-hard-limits) | 그룹·연락처·필드 등 제품 한도 |
| F10 | [API index](https://developer.folk.app/llms.txt) | People/Companies/Groups/Custom objects/Notes/Tasks/API 표면 |
| F11 | [Custom objects](https://developer.folk.app/core-concepts/custom-objects.md), [Custom fields](https://developer.folk.app/core-concepts/custom-fields) | 그룹 내 사용자 정의 객체와 필드의 공개 계약 |
| F12 | [Collaboration](https://help.folk.app/en/collections/3260255-collaborating-with-your-team) | 작업, 상호작용, 알림의 세부 조사 진입점 |
| F13 | [Nicelydone MCP](https://nicelydone.club/mcp) | 화면·flow·component 조회 및 계정 연결 방식 |
| F14 | [API Views](https://developer.folk.app/core-concepts/views.md) | 색인에서 발견했으나 본문 조회 실패 — 지원 범위 미확인 |
| F15 | [Reminders → Tasks](https://developer.folk.app/migrations/reminders-to-tasks) | 예전 Reminder 용어·계약과 현재 Tasks의 차이 |

F10은 조사 색인이다. 색인에 열거된 모든 endpoint와 도움말 전체를 읽었다는 의미가 아니다. 기능별 상세 계약은 구현 전에 해당 원문과 실제 화면을 추가 확인한다.

추가 확인: [F16 Tasks](https://help.folk.app/en/articles/15869200-tasks) — 레코드 연결, 담당자·기한·완료·반복, 전용 작업 화면. 기한 분류에 Workspace timezone을 사용하는 설명이 있어 현재 사용자 timezone 정책과 구분해야 한다.

## 확인한 개념과 설계상 의미

People와 Companies는 Workspace 연락처 기반이고, 동일 연락처가 여러 Group에 들어갈 수 있다. 기본 정보와 Group별 추가 필드를 구분해야 한다. 따라서 현재 List의 별도 행 값 모델을 이름만 Group으로 바꾸는 것으로 끝나지 않는다. 제품 개념의 출처는 F01이며, 테이블 설계는 별도 제안이다.

F02의 현재 설명은 Group → 객체별 탭 → 여러 Table/Pipeline view다. 필터·정렬·컬럼 설정의 자동 저장은 현재 코드의 preview/save/undo 방식과 다르므로 API 저장 단위를 다시 검토해야 한다. F05의 Dashboard를 “Table/Pipeline 두 종류만 있다”는 이유로 범위에서 제거하지 않는다.

## 충돌·미확인 목록

| 항목 | 문제 | 확정 방법 |
| --- | --- | --- |
| 그룹 삭제와 메모/작업 | F01의 삭제 설명과 F06의 레코드 메모 유지 설명이 일치하지 않는 부분이 있음 | 테스트 연락처로 그룹 제거/삭제/연락처 삭제를 각각 관찰; cascade 미확정 |
| 그룹 생성 기본 화면 | 최신 도움말의 탭 설명과 API 그룹 생성의 기본 view 설명이 다름 | 같은 계정에서 UI 생성과 API 결과를 대조 |
| Deals 생성 진입 | F04의 컬럼 중심 설명과 F02의 객체 탭 설명의 버전 차이 | 실제 흐름·캡처 날짜를 고정 |
| 권한 상세 표 | F07의 두 문서에서 일부 필드 설정 권한 표현이 다름 | 역할별 계정으로 조회·편집·공유 검증 |
| 최대 데이터 수 | 개념 설명의 “unlimited”와 F09의 수치 제한 | 요금제·현행 제한 문서 우선, 무제한 DB 정책으로 추론하지 않음 |
| Tasks 공개 범위·알림 시간대 | F16 내부에 레코드 접근자/Workspace 전체, 사용자/Workspace 시간대 표현이 함께 있음 | 역할·시간대별 실제 표시/알림을 확인하고 정책 고정 |
| View API와 UI | API가 UI의 모든 생성·편집 기능을 노출한다고 볼 수 없음 | 공개 API 계약과 재현할 내부 API를 분리 |
| 모바일·온보딩·연동 | 이번에 folk 계정 화면을 조작하지 않음 | Nicelydone 및 실제 계정 확인 |
| 요금제·지역 차이 | 화면·기능 제공 범위가 다를 수 있음 | 조사 계정 조건을 출처와 함께 기록 |

## Nicelydone MCP 사용 준비

공식 제공 주소: `https://mcp.nicelydone.club/mcp`.
F13은 Streamable HTTP, OAuth 2.1, 유료 계정 사용을 안내한다.

이번 세션에서는 Nicelydone 도구가 발견되지 않았다. MCP 연결·로그인·화면 수집 완료로 기록하지 않는다. 문서 검토는 진행할 수 있으나 화면 재현 완료 판정은 수집 후에 한다. 연결 설정을 문서 변경 작업에 포함해 임의로 수정하지 않는다.

## 화면별 기록 형식

각 기능은 아래 정보를 한 묶음으로 남긴다.

1. 화면/flow ID, 원본 URL, 캡처 날짜, 계정 역할·플랜·기기·언어.
2. 진입 위치와 정상·빈·로딩·오류·권한 제한 상태.
3. 입력, 저장, 취소, 이동, 삭제·복구 및 성공 후 위치.
4. 화면이 읽고 쓰는 데이터와 소유 범위.
5. 기존 API/FE 재사용 여부와 새 계약.
6. 공식 문서와 불일치하는 부분, 채택 버전과 이유.
7. 실제 계정 또는 검토 결과. 관찰하지 않은 상태는 “미확인”.

[기능 대응표](../../PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)와 [DB 계획](../../SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)에 이 기록을 연결한다.

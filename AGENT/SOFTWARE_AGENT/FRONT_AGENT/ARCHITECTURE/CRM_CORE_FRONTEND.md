# CRM Core Frontend Architecture

Status: Draft Architecture
Date: 2026-09-13

## 1. 목적

이 문서는 OneHand CRM의 후속 CRM Core를 User Web에서 어떻게 화면과 feature로 나눌지 정의하는 초안이다.

현재 User Web에는 CRM Core 화면이 활성화되어 있지 않다. 이 문서는 구현 전 설계 기준이다.

## 2. 기본 원칙

- 고정형 Contact/Product/Deal navigation을 복구하지 않는다.
- Kit 선택, Workspace home, Record list/detail/create 흐름을 기준으로 feature를 설계한다.
- 사용자 화면에는 Object/Attribute/Relationship 같은 내부 용어를 노출하지 않는다.
- UXUI_AGENT의 first use flow와 record UX를 우선한다.
- API 계약이 확정되기 전 FE mock 구조를 정본처럼 만들지 않는다.

## 3. 후보 Feature

후속 User Web feature 후보는 아래와 같다.

| Feature | 책임 |
| --- | --- |
| `kit` | 업무 유형 선택, Kit 카드, Kit preview |
| `workspace` | Workspace home, 현재 Workspace 상태 |
| `crm-object` | Kit 안의 관리 대상 navigation |
| `record` | Record list/detail/create/edit |
| `record-relationship` | 연결 Record 선택/생성 |

초기 MVP에서는 feature를 너무 잘게 쪼개기보다 first use flow가 끊기지 않는 구조를 우선한다.

## 4. Route 후보

Route 후보는 확정이 아니다. 실제 구현 전 UXUI와 API 계약을 함께 확인한다.

| Route 후보 | 목적 |
| --- | --- |
| `/app` | Workspace 상태에 따라 Kit 선택 또는 Workspace home |
| `/app/setup` | 업무 유형 선택/Kit 미리보기 후보 |
| `/app/objects/:objectId` | 특정 관리 대상 Record 목록 |
| `/app/records/:recordId` | Record 상세 후보 |

현재 redirect-only route인 `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 고정형 CRM 복구 근거로 사용하지 않는다.

## 5. State / Query 기준

- TanStack Query key는 feature 단위 factory로 관리한다.
- Workspace id, object id, view id, page, search, filter, sort를 query key에 포함한다.
- mutation 성공 후 관련 list/detail/workspace summary key를 명시적으로 invalidate한다.
- FE가 API에 없는 최근 활동, 상태, 관계 값을 임의 데이터처럼 꾸미지 않는다.

## 6. Create / Detail 기준

- desktop에서는 목록 맥락을 유지하는 오른쪽 문서형 패널을 우선 검토한다.
- 모바일에서는 전체 화면 create/detail flow로 전환할 수 있다.
- 첫 Record 생성 form은 Kit별 필수 값만 받는다.
- 저장 후 사용자가 방금 만든 Record 위치를 잃지 않게 한다.

## 7. Copy / Internal Terms 기준

FE 화면 문구는 UXUI의 내부 용어 변환 기준을 따른다.

| 내부 용어 | 사용자 표현 |
| --- | --- |
| Object | 관리할 항목 또는 실제 업무명 |
| Attribute | 필요한 정보 |
| Relationship | 연결 |
| Record | 기록 |
| View | 보기 |

## 8. 구현 전 필요한 문서

- UXUI first use flow 확정
- UXUI record list/detail/create 기준
- API 계약 confirmed
- DB schema migration 계획
- Backend ownership/transaction/error 계약

## 9. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/KIT_SELECTION_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`

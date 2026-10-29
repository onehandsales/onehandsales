# View 헤더 필터·정렬·보기 설정 조회 Backend 계획

- 작성일: 2026-10-29
- 상태: 작업 문서 작성 완료 / API 계약 `draft` / Backend 구현 미착수
- 작업 대상: Backend 조회 API 3개. Frontend 구현은 별도 작업이다.
- 사용자 요청: 헤더의 필터·정렬·보기 설정 버튼을 눌렀을 때 현재 View의 저장된 설정을 조회한다.

## 1. 이번에 만드는 것

현재 선택된 `viewDefinitionId`를 받아 메뉴에 표시할 설정과 필요한 속성 정보를 반환한다.

공통 경로:

```text
/api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId
```

| 버튼 | Method / 하위 경로 | 메뉴에서 확인할 내용 |
| --- | --- | --- |
| 필터 | `GET /filters` | 저장된 AND/OR 그룹, 조건, 비교값, 속성·Select/Status 옵션 |
| 정렬 | `GET /sorts` | 저장된 정렬 조건, 조건 순서, 오름차순/내림차순, 속성 정보 |
| 보기 설정 | `GET /settings` | 표시 속성·숨김·너비·역할·형식, 그룹, 위젯, 타입별 JSON 설정 |

`[전체 업무 ▼]`는 기존 View 선택 목록이고, 이번의 `[보기 설정 ▼]`와 다르다. 기존 초기 헤더 조회·Object/List View 목록·즐겨찾기 API를 대체하지 않는다.

## 2. 정렬 메뉴의 의미

```text
[정렬 ▼]
  1. 마감일       [오름차순 ↑]
  2. 예상 금액    [내림차순 ↓]
```

- `sortOrder`: 메뉴에 정렬 조건을 표시할 순서이자 저장된 조건의 적용 우선순위.
- `sortDirection`: 각 조건의 현재 선택 상태인 `ASC` / `DESC`.
- 정렬 설정 목록은 `sortOrder ASC, createdAt ASC, id ASC`로 반환한다. `sortDirection` 값은 바꾸지 않는다.
- 실제 Record/ListEntry 값에 정렬을 적용하는 주 화면 조회는 후속 작업이다.

## 3. 범위

포함:

- 현재 View에 저장된 필터·정렬·보기 설정의 조회 계약과 Backend 구현 계획.
- 현재 저장 설정이 참조하는 Attribute 및 Select/Status 옵션 메타데이터.
- 11개 View 타입의 보기 설정 데이터 출처와 현재 더미 JSON 예시.
- 인증, Workspace 소속, 참조 무결성, 안정적인 목록 순서, 에러·로그·검증 기준.
- 숨겨진 속성·그룹·위젯도 설정 메뉴에서 확인할 수 있도록 포함한다.

후속 범위:

- 조건 추가용 전체 속성 탐색, 속성별 지원 연산자·정렬 가능 여부 목록, 관계 경로 탐색 API.
- 조건·방향·숨김·배치의 변경/저장, 생성/삭제/순서 이동 API.
- 주 화면 Record/ListEntry 조회, 필터 평가, 실제 데이터 정렬, 집계·차트·지도·위젯 결과 계산.
- Frontend 메뉴 연결, 타입별 렌더러, 사이드바/초기 헤더 계약 변경.
- DB 컬럼·제약·인덱스·migration 변경, Supabase 더미 추가/갱신, ENV 변경, Docker 실행, 배포.

따라서 이 세 조회 API만으로 `+ 필터 추가`, `+ 정렬 추가`, 새 표시 속성 선택의 전체 후보 탐색과 저장까지 완료되는 것은 아니다. 이번 조회는 저장 상태를 읽는 단계다.

## 4. 문서 순서

1. [API 계약](COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md): Request/Response, DB 출처, 정렬, 타입별 설정, 오류·transaction·observability.
2. [Backend 작업 순서](BE-TODO/IMPLEMENTATION.md): 실제 코드 기준, 공개 Port, 내부 로직, 단계별 완료 조건, 검증.
3. [작업 기록](../../TODO_LOG/2026-10-29/VIEW_HEADER_MENU_QUERY_PLAN/WORK_LOG.md): 이번 문서 작성의 변경·검토 결과.

## 5. 현재 구현과 근거

- 초기 헤더는 `GET /api/users/me/workspaces/:workspaceId/view-header`이며, 현재 응답 필드는 `viewId`다. 후속 소비자는 현재 선택 ID를 이 계획의 `viewDefinitionId` 경로에 전달한다. 기존 응답 이름 변경은 이번 범위가 아니다.
- View 선택/즐겨찾기는 [기존 경로·식별자 계약](../VIEW_HEADER_API_NAMESPACE_PLAN/COMMON/API-SPEC/VIEW_HEADER_API_NAMESPACE.md)을 따른다.
- 현재 `view-definition` controller/module에는 이번 `/filters`, `/sorts`, `/settings` API가 없다.
- `BE/prisma/schema.prisma`에 View 설정 테이블이 존재한다. 테이블 존재는 조회 API 구현 완료를 뜻하지 않는다.
- `BE/prisma/VIEW_DEMO_SETTINGS.md`와 fixture는 저장 예시다. 이번 문서 작성에서 실제 Supabase 값을 재조회하거나 변경하지 않았다.
- 오래된 아키텍처 문서의 활성 모듈 목록과 현재 코드는 차이가 있다. 계층 규칙은 정본을 따르고, 구현 여부는 현재 소스로 판정한다.

## 6. Attio 근거와 우리 설계

| 구분 | 근거 또는 판단 |
| --- | --- |
| 공식 확인 | View별 필터·정렬 저장, AND/OR 필터 그룹, 다중 정렬의 우선순위·방향: [Filter and sort views](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views) |
| 공식 확인 | 표 View의 표시 속성, 열 순서·너비, 형식 설정: [Create and manage table views](https://attio.com/help/reference/managing-your-data/views/create-and-manage-table-views) |
| 공식 확인 | 공개 데이터 조회 API의 `sorts[].direction`과 속성/관계 경로 정렬: [Filtering and sorting](https://docs.attio.com/rest-api/guides/filtering-and-sorting#sorting) |
| 우리 설계 | 현재 View ID로 세 메뉴 설정을 따로 조회하는 경로, 응답 DTO와 테이블별 배열 구성 |
| 우리 확장 | 11개 View 타입과 `configJson` 저장 방식. Attio 내부 구현·DB가 동일하다고 단정하지 않는다. |

공식 문서 확인일은 2026-10-29다. 공식 UX 동작과 공개 API를 참고하되 공개되지 않은 내부 메뉴 API는 우리 서비스용 설계로 명시한다.

## 7. 반드시 먼저 읽을 문서

- [TODO Software Agent Reference](../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [BE 작업 규칙](../../BE/AGENTS.md)
- [Software Agent](../../AGENT/SOFTWARE_AGENT/README.md)
- [Backend Agent](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)의 CONVENTION / ARCHITECTURE / DECISIONS
- [API 계약 규칙](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md)
- [모듈 경계](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md)
- [DB 기준](../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [Prisma 스키마](../../BE/prisma/schema.prisma)
- [View 제약 검토](../VIEW_인덱스관련검토문서.md): 현재 기본 ID FK와 후속 복합 소속 FK·CHECK 후보의 차이.
- [11개 View 텍스트 UX](../VIEW_TWO_AREA_TEXT_UX.md)
- [Notion·Attio 적용 기준](../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md)

## 8. 완료 구분

- 문서 완료: API 초안과 Backend 작업·검증 순서가 연결되어 있다.
- 구현 착수: Backend 작업 문서 G00에서 남은 계약 항목을 검토하고 `confirmed`로 갱신한다.
- Backend 완료: 세 API 구현과 관련 검증 결과가 기록되어 있다. 문서만 작성한 상태를 `implemented`로 표시하지 않는다.

## 9. 스키마 재검토와 보완 결과

- 검토일: 2026-10-29.
- 근거: 현재 `schema.prisma`의 View 관련 모델, Attribute/SelectOption/StatusOption/List 관계, 현재 `view-definition`과 공개 query Port.
- 판정: 문서 보완 완료 / 계약 `draft` 유지. G00 계약 검토에 착수할 수 있으며 G01 구현은 `confirmed` 전환 후 진행한다.
- 이유: 읽기 흐름은 현재 구조에 맞지만, 같은 Workspace의 다른 Object/List 속성을 SourceScope별로 어디까지 거부할지는 스키마만으로 확정할 수 없다. 새 도메인 제약을 임의 도입하지 않는다.

| 검토에서 확인한 빈틈 | 보완한 기준 / 후속 확인 |
| --- | --- |
| ID FK만으로 소속 일치를 보장한다고 오해할 수 있음 | API 계약 7.2절에 Application의 검증 조건을 연결별로 명시 |
| GroupSetting과 부모 그룹/옵션이 같은 속성인지 불명확 | 부모 그룹 존재, 그룹과 설정의 Attribute 일치, 명시 옵션의 Workspace·Attribute 일치 확인 |
| 범위 밖 행 제외와 저장 설정 오류의 구분 부족 | 7.3절에 스코프 밖 행은 제외, 조회된 행의 필수 참조 오류는 500으로 구분. 전체 DB 진단 보장 없음 |
| 경로 JSON·그룹 순환의 구체적인 실패 기준 부족 | UUID 배열·모든 참조 ID 존재, 모든 그룹의 부모/순환 검사, 여러 루트 보존 기준 추가 |
| SourceScope 소속 검증과 전체 실행 가능성의 경계 불명확 | 7.4절에 직접 속성 판정안을 사례별로 작성. G00에서 포함/후속 분리 여부를 확인하고 전체 경로 실행기와 구분 |
| batch Port가 실제로 어떤 소속 정보를 제공해야 하는지 부족 | Backend 문서 4.1~4.3절에 입력/결과, 명시 옵션 조회, 호출 수 기준, 검증 순서 추가 |

이번 보완은 저장 메뉴 상태의 안전한 읽기를 구체화한 것이다. 실제 필터 평가·다중값 처리·정렬·집계 로직, View 원본 XOR, 옵션 식별 방식 XOR, 위젯 소유 타입·중첩 허용 정책을 확정하지 않는다. 문서 정적 대조만 수행했으며 코드 구현·실제 DB 데이터 정상 여부·실행 테스트 통과는 보장하지 않는다.

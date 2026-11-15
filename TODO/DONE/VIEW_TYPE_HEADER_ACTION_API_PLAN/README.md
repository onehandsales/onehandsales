# View 타입별 헤더 작업 API 설계

- 작성·검토일: 2026-10-29
- 상태: 설계 초안 `draft`. 신규 API 구현·배포 완료를 뜻하지 않는다.
- 대상: User Web의 `원본 데이터`, `목록 정렬`, `대시보드 편집`.
- 사용자 요청: 현재 Prisma와 실제 구현을 기준으로 API 명, 응답 형태, 내부 비즈니스 로직, 목적과 재검토 결과를 문서화한다.
- 이번 산출물: 문서만 작성한다. Backend/Frontend 구현, DB·환경 변경, 커밋은 포함하지 않는다.

## 1. 목적과 현재 판단

세 버튼은 서로 다른 역할을 갖는다. 버튼 노출, 저장 설정 조회, 실제 데이터 조회, 설정 저장을 구분해 불필요한 API를 만들거나 미구현 로직을 완료된 기능으로 오해하지 않도록 한다.

| 버튼 | 표시할 View Type | 역할 | 현재 구현과 후속 작업 |
| --- | --- | --- | --- |
| 원본 데이터 | `CHART`, `PIVOT` | 집계를 구성하는 실제 Record/ListEntry 확인 | View 조건 실행·원본 조회는 신규 설계 필요 |
| 목록 정렬 | `MAP` | 지도 옆 기록 목록의 정렬 기준 확인·변경 | 기존 `GET /sorts`와 메뉴 재사용. 실제 목록 정렬은 주 화면 조회에서 구현 |
| 대시보드 편집 | `DASHBOARD` | 기존 위젯 구성의 편집 모드 진입 | 기존 `GET /settings`로 구성 조회 가능. 후보 조회·저장·위젯 결과는 후속 |

View Type에 따라 버튼을 표시하는 것은 Frontend 소비 규칙이다. 기존 메뉴 GET은 11개 타입의 저장 상태를 읽으며, 버튼이 없는 타입이라는 이유로 새로운 거부 정책을 적용하지 않는다.

`대시보드 편집` 클릭 자체는 화면 상태 전환이다. 이 버튼만을 위해 별도의 편집 시작 API를 만드는 것으로 확정하지 않는다.

## 2. 문서 읽는 순서

1. [API 명세](COMMON/API-SPEC/VIEW_TYPE_HEADER_ACTION_API.md): 기존 API 재사용과 신규 API 후보, 요청·응답·오류·DB·transaction·관측성.
2. [비즈니스 로직 검토와 결정 항목](COMMON/PLANNING-REVIEW.md): 확정 근거, 미확정 정책, 반례, 작업 순서.
3. [Backend 작업·검증 기준](BE-TODO/IMPLEMENTATION.md): 실행기, 소유 모듈의 공개 Port, 저장 원자성, 테스트.
4. [Frontend 작업·검증 기준](FE-TODO/IMPLEMENTATION.md): 기존 UX 보존, 타입별 버튼, 조회·초안·저장 상태.

API 필드의 정본은 `COMMON/API-SPEC`이다. FE/BE 문서에서 별도 계약을 만들지 않는다. 미확정 제품 정책은 검토 문서의 `D01~D14`에 연결한다.

## 3. 텍스트 UX

### CHART / PIVOT

```text
[보기 선택 ▼] [즐겨찾기]                    [필터] [원본 데이터] [보기 설정]

원본 데이터 클릭 → 현재 View 기준의 원본 행 목록
차트 구간 클릭   → 해당 그룹·계열을 구성한 원본 행
피벗 셀 클릭     → 해당 행·열 조합을 구성한 원본 행
```

원본 목록을 오른쪽 패널로 제공하는 것은 제안이다. 실제 패널 배치는 주 화면 작업에서 확정한다. 원본 값 변경은 기록 상세/업무값 편집 흐름이며 집계 숫자를 직접 수정하지 않는다.

### MAP

```text
[보기 선택 ▼] [즐겨찾기]          [검색] [필터] [목록 정렬] [기록 추가] [보기 설정]

[목록 정렬]
1. 최근 연락일  [내림차순]
2. 회사명       [오름차순]

지도: 핀의 지리적 위치 유지
옆 목록: 위 기준으로 정렬
```

거리순 정렬·방문 경로 최적화는 이 버튼의 기본 기능으로 확정하지 않는다. 좌표가 없거나 확인되지 않는 기록은 목록에 남기는 기존 UX 기준을 따른다.

### DASHBOARD

```text
조회: [보기 선택 ▼] [즐겨찾기]                  [대시보드 편집] [보기 설정]
편집: [보기 선택 ▼] [즐겨찾기]        [+ 위젯 추가] [취소] [저장] [보기 설정]

편집 진입 → 저장 구성을 초안으로 복사
위젯 추가 → 기존 View 후보 선택
이동·크기 변경 → 초안 변경
취소 → 초안 폐기
저장 → 확정된 저장 계약에 따라 구성 반영
```

한 줄 헤더와 기존 보기 설정 팝업의 스타일·조작 방식을 유지한다. 미정인 `추가 도구`의 역할을 이 계획에서 만들지 않는다.

## 4. 범위와 우선순위

| 단계 | 포함 | 완료 의미 |
| --- | --- | --- |
| 현재 문서 작업 | API 후보, 현재 사실, 미확정 정책, 검토·검증 기준 | 설계 자료 작성 완료 |
| GET 우선 단계 | 기존 메뉴 조회 재사용, 원본 조회 계약, 필요 시 위젯 후보 조회 | 각 조회의 계약 확정 및 별도 구현·검증 |
| 주 화면 연계 | 필터·정렬 실행, 집계·원본·지도 목록의 공통 조회 기준 | 실제 결과와 사용자 행동 연결 |
| 후속 저장 단계 | 대시보드 구성 저장, 충돌·중복 요청 처리 | 별도 확정 계약과 쓰기 검증 |

지도 제공자·주소 변환, 모든 View 렌더러, Record/ListEntry CRUD, 전역 대시보드 필터, 개인/공유 View 권한 도입, 다른 이름으로 저장 등은 이 문서로 구현 범위를 확정하지 않는다.

원본 조회는 헤더에서 시작하지만 본문 데이터 실행에 속한다. 모든 주 화면 구현을 끝내야만 설계할 수 있는 것은 아니며, 공통 실행 계약을 먼저 정의해 함께 개발할 수 있다.

## 5. 먼저 확인할 정본과 현재 근거

- [TODO Software Agent Reference](../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [BE 작업 규칙](../../BE/AGENTS.md), [Software Agent](../../AGENT/SOFTWARE_AGENT/README.md)
- [Backend Agent](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)의 CONVENTION / ARCHITECTURE / DECISIONS
- [API 계약 규칙](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md), [트랜잭션 규칙](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md)
- [모듈 경계](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md), [Shared Presentation](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/SHARED_PRESENTATION.md)
- [Front Agent](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [User Web 구조](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md)
- [DB 문서](../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [시간 정책](../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md)
- [Prisma 스키마](../../BE/prisma/schema.prisma), [View migration](../../BE/prisma/migrations/20261017050000_rebuild_view_tables_from_current_schema/migration.sql)
- [저장 메뉴 확정 API](../DONE/VIEW_HEADER_MENU_QUERY_PLAN/COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md)
- [헤더 경로·식별자 계약](../DONE/VIEW_HEADER_API_NAMESPACE_PLAN/COMMON/API-SPEC/VIEW_HEADER_API_NAMESPACE.md)
- [View 텍스트 UX](../VIEW_TWO_AREA_TEXT_UX.md), [UX 참고 기준](../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md)
- [현재 메뉴 조회 구현](../../BE/src/modules/view-definition/application/view-header-menu-reader.ts)
- [현재 FE 메뉴 타입](../../FE/user-web/src/features/crm-view/types/view-menu.ts)
- [더미 설정 설명](../../BE/prisma/VIEW_DEMO_SETTINGS.md): 저장 예시이며 전체 실행 규격이 아니다.

오래된 문서의 활성 모듈 목록과 현재 소스가 다르면 구현 여부는 현재 Controller·module 조립·schema로 확인한다. 초기 헤더 응답 `viewId`와 선택 모델 `viewDefinitionId`의 기존 변환은 유지한다.

## 6. 검증 이력과 완료 경계

2026-10-29 문서 작성 직전 비즈니스 로직 재검토에서 다음 테스트를 실행했다.

```powershell
pnpm.cmd -C BE exec jest --runInBand --runTestsByPath src/modules/view-definition/application/view-header-menu-reader.spec.ts src/modules/view-definition/presentation/http/user-workspace-view-header-menus.controller.spec.ts
```

- 결과: 2 suites / 64 tests 통과.
- 실제 메뉴 application/HTTP 연결을 검증하되 DB와 인증 provider는 대체했다.
- 신규 원본 조회·집계·대시보드 저장의 검증 결과가 아니다.
- 실제 DB 조회·migration·배포 검증을 수행했다는 의미가 아니다.

신규 API의 `draft`를 문서 작성 요청만으로 `confirmed`나 `implemented`로 바꾸지 않는다. 구현 전 관련 결정 항목과 요청·응답·오류 계약을 채운 뒤 상태를 갱신한다.

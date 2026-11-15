# folk 전환 — DB / API / FE 의존

Status: Plan / 실행 코드 미변경
Date: 2026-11-15

[현재 구현](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)과 [DB 계획](../DB_SCHEMA/FOLK_SCHEMA_PLAN.md)을 연결하는 문서다. 이름 변경만으로 전환하지 않는다.

## 영향 범위

| 현재 경계 | 실행 코드 위치 | 전환 방향 |
| --- | --- | --- |
| Workspace·온보딩 | BE `workspace`, `user`; FE `workspace`, `auth` | 기존 기반 유지; folk 진입·초대·공유 계약 대조 |
| Object / Attribute / Record | BE `object-definition`, `attribute-definition`, `record-definition`; FE `crm-object` | 고정 연락처·그룹 필드·커스텀 객체로 책임 분리 |
| List / Entry | BE `list-definition`; FE `crm-list` | Group 포함 관계·그룹별 값·권한 도입 |
| View 정의·설정·본문 | BE `view-definition`; FE `crm-view` | Group 객체 탭과 Table/Pipeline, 자동 저장·기본 view 정책 |
| 사이드바·즐겨찾기 | 각 sidebar controller; FE `sidebar-order`, `view-favorite` | folk 탐색 구조·개인화 범위 조사 |
| TABLE/KANBAN/LIST renderer | FE `crm-view` | Table/Pipeline 중심으로 재편; LIST 폐기 여부 실측 후 판단 |
| Widget / WorkDependency | Prisma, seed·테스트·View 계약 | Dashboard 재설계 / 대응 없는 의존성 제거 후보 |
| Auth·지원·공개 문의·운영 | 기존 모듈·shared·admin-web | 기술 기반 보존; folk 화면/권한 영향만 별도 검토 |

현재 Object 3, List 3, Attribute 5, Record 4, View 18개로 총 33개 controller API가 있다. 이 수는 다섯 모듈의 HTTP handler 기준이고 전체 서비스 endpoint 수가 아니다.

Object/List/View URL이 실제 FE router와 API client에서 쓰이므로 Prisma만 먼저 삭제하면 현재 화면과 테스트가 깨진다. API 폐기는 DTO, 공개 port, repository, 모듈 DI, client, query key, route, seed, fixture, 테스트와 함께 다룬다.

## 단계

1. **근거 고정**: Nicelydone/실계정에서 화면·상태 수집, 공식 동작 대조.
2. **흐름 프로토타입**: mock으로 탐색·표·파이프라인·상세를 확인. 미구현/가짜 저장 상태를 명확히 표시.
3. **계약 설계**: 화면 이벤트→API→DB 소유 범위·권한·오류·삭제 영향 정리.
4. **수직 구현**: 작은 업무 흐름마다 schema/API/FE/필요한 검증을 함께 완성.
5. **데이터 전환**: 실제 보존 요구에 맞춰 이전 또는 승인된 초기화 절차 적용.
6. **기존 구조 제거**: 참조가 사라진 API·테이블·enum·fixture만 제거.
7. **전체 대응 검수**: [기능 대응표](../../PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)에서 누락과 차이 확인.

전체 화면 개발이 끝날 때까지 데이터 의미를 미루지 않는다. 동시에 현행 schema를 먼저 DROP하는 순서도 채택하지 않는다.

## 검증 관점

- 같은 연락처가 두 그룹에 있을 때 기본 정보는 공유되고 사용자 필드는 분리되는가.
- 그룹에서 제거와 Workspace에서 삭제가 구분되는가.
- 권한 없는 그룹·메모·작업·연동 데이터가 응답에 섞이지 않는가.
- 필터·정렬·열 설정이 자동 저장되고 새로고침 후 유지되는가.
- Pipeline 이동과 선택 필드 값이 일치하는가.
- 필드/옵션/객체 타입 삭제가 view와 연결 데이터에 미치는 영향이 처리되는가.
- 기존 로그인·Workspace 접근·지원 접수는 유지되는가.

현재 구현의 명시적 save/undo 및 optimistic version 계약은 전환 전까지 실제 동작이다. 문서만 자동 저장으로 바꾸었다고 기존 코드가 바뀐 것은 아니다.

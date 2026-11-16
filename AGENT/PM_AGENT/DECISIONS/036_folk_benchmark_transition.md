# 036 — folk 제품·UX 벤치마킹 전환

Status: Accepted
Date: 2026-11-15
Updated: 2026-11-16
Origin: 사용자 결정

## 결정

OneHand CRM은 folk의 제품 기능, 정보 구조, 화면과 상호작용을 재현하는 방향으로 전환한다. UX 조사에는 Nicelydone MCP를 사용하고, 동작·권한·데이터 의미는 folk 공식 도움말 및 API 문서와 대조한다. 특정 직군, 개인 전용 CRM, 직군별 Kit을 새 전제로 확정하지 않는다.

전체 기능·UX 대응이 최종 목표다. 구현 순서는 나누되 나중 단계의 기능을 제품에서 제외했다고 표현하지 않는다. 기존 제품명과 저장소 이름 변경은 이번 결정에 포함하지 않는다.

## 대체하는 이전 결정

| 이전 기준 | 변경 |
| --- | --- |
| PM 032의 No Setup CRM / Kit 중심 제품 | folk 제품 구조로 대체 |
| PM 033의 개인 우선·팀 협업 후속 제한 | Workspace와 공유·권한을 folk 조사 범위에 포함 |
| PM 034의 첫 Kit 선택 선행 조건 | 삭제. 첫 작업은 folk 흐름·상태 조사 |
| PM 035의 개발 보류·포트폴리오 보존 | 이번 문서 정비와 folk 전환 준비는 재개. 당시 회고는 보존 |
| UX 020의 이전 혼합 참고 기준 | UX 025의 folk 단일 기준으로 대체 |
| UX 021~024의 Kit 온보딩·용어 정책 | folk 흐름·용어 조사 결과로 대체 |

이전 결정 파일은 삭제하지 않고 적용 상태를 표시한다. 보안, 아키텍처, 시간대, 문서 운영 등 충돌하지 않는 기존 기준은 유지한다.

2026-11-16 사용자 보충: 제품·UX 문서에는 folk만 참고 제품으로 남긴다. 이전 참고 제품의 이름·세부 지침·파일명·참조는 정리하며, 필요한 과거 본문은 Git 이력에 남긴다. 이전 지침을 folk에서 확인한 동작으로 바꾸어 기록하지 않는다.

## 데이터 방향

공식 문서에서 확인한 제품 개념은 People, Companies, Groups, 그룹별 필드, Views, Custom objects/Deals, Notes, Tasks, Interactions 등이다. 이는 folk의 비공개 DB 테이블 구조를 확인했다는 뜻이 아니다.

현재 범용 Object/List/Attribute/View 구현을 그대로 확장하는 것을 기본값으로 삼지 않는다. 고정된 연락처 기반과 필요한 동적 필드·커스텀 객체를 조합하는 구조를 검토한다. “folk니까 모든 데이터가 고정형”, “Object/Attribute/View가 필요 없다”는 결론도 내리지 않는다.

2026-11-16 사용자 방향은 인증·사용자·Workspace를 유지 검토의 출발점으로 두고, 그 아래 기존 CRM 정의·값·관계·보기 테이블을 전면 교체하는 안이다. 현재 엔진 보존 자체를 목표로 삼지 않는다. Nicelydone의 folk 화면 조사와 작은 mock UX를 먼저 진행하고, 공식 동작·실계정 관찰을 대조해 새 테이블·컬럼·API를 설계한다. Workspace의 관계·권한 필드도 새 구조에 맞게 조정할 수 있다. 제거 목록·데이터 이전·실행 환경은 아직 확정하지 않았다.

## 이번 작업과 후속 작업의 경계

이번 작업은 문서 갱신과 검토다. 현재 schema, migration, API, FE 실행 코드는 변경하지 않는다.

사용자는 불필요한 DB 구조 제거 의향을 밝혔다. 구체적인 제거 대상은 화면·계약·데이터 보존 여부를 연결해 정한다. 삭제 계획 작성 자체가 원격 DB 초기화나 모든 기존 테이블 삭제를 실행하라는 지시는 아니다.

## 정본

- [제품 방향](../PLANNING/PRODUCT_DIRECTION.md)
- [기능 대응표](../PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)
- [현재 구현](../PLANNING/IMPLEMENTATION_STATUS.md)
- [UX 결정](../../UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md)
- [근거 및 화면 조사](../../UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md)
- [DB 전환 설계안](../../SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)

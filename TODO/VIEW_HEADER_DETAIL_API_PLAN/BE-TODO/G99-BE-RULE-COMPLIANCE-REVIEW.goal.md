# G99 Backend 규칙 준수 최종 검토

- 상태: 미착수
- 의존성: [G01](G01-BE-VIEW-HEADER-DETAIL.goal.md) 구현 결과와 [TEST-PLAN](TEST-PLAN.md)의 실제 실행 증거
- 기준: [Backend Agent 체크리스트](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md), [TODO Software 정본 참조](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

## 1. 목적

실제 구현이 Backend Agent 규칙과 합의한 API를 준수하는지 검토하고 발견한 문제를 수정·재검증한다. 기획 문서 검토와 실제 구현 검토를 구분하며, 아직 작성되지 않은 코드를 통과 처리하지 않는다.

## 2. 검토 절차

1. 사용자 요청·[공통 범위](../COMMON/README.md)·[API 정본](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)과 실제 diff를 대조한다.
2. G01 변경 파일·검증 결과와 Workspace/부모/개인 Favorite 경계, Port/DI/타입/주석·로그를 추적한다.
3. 발견한 문제에 심각도·위치·영향·수정 내용을 기록하고 해결한다.
4. 수정 영향에 맞는 검증만 재실행하고 이전 결과와 구분한다.
5. 미확인 항목과 완료 가능 여부를 판정한 뒤 계약·계획·DB 현황·작업 로그를 갱신한다.

## 3. Backend Agent 대조 체크리스트

사용자가 요청한 구현 후 검토는 필수 작업이다. 단순 테스트 통과나 "규칙 준수" 한 줄로 대체하지 않고 각 항목에 `준수 / 수정 후 준수 / 미확인 / 해당 없음`과 파일·검증 근거를 남긴다.

- [ ] 단일 NestJS modular monolith의 domain/application/infrastructure/presentation 책임과 의존 방향을 지켰다.
- [ ] Controller는 인증·path 검증 후 UseCase만 호출한다. application/domain에 ORM·Provider·HTTP·구체 logger 타입이 노출되지 않는다.
- [ ] 다른 모듈 데이터는 Workspace/Object/List 공개 Port로 조회한다. 다른 모듈 Repository를 직접 import/주입하거나 조회 구현체를 export하지 않는다.
- [ ] 사용자/Workspace/View/각 부모/Favorite 개인 경계를 빠짐없이 제한하고 Actor 없는 읽기를 허용한다.
- [ ] 현재 Workspace 공용 View와 개인 즐겨찾기 범위를 구분하고, 미정인 역할·공유·생성자 제약을 새로 만들지 않았다.
- [ ] 응답 7개 최상위 필드와 두 부모의 id/name/icon, 타입·null·오류·메시지가 API 정본의 Response·오류 절과 일치한다. null 소속과 조회 실패를 구분한다.
- [ ] 계약은 구현 전 confirmed였고, 읽기 transaction 없음·idempotency/outbox 해당 없음·request id·redaction 판단이 문서와 코드에서 일치한다.
- [ ] class/interface에 역할 주석, Controller API method에 API 주석, 내부 method/helper에 기능 주석과 주요 단계에 번호 주석을 적용했다.
- [ ] 새 이름이 책임을 설명하며 레거시 CRM 도메인/화면을 복구하지 않는다. User API와 Admin API 경계를 유지했다.
- [ ] schema/migration/index/seed/환경/본문·Frontend와 기존 Sidebar 응답을 변경하지 않았다. 예외 변경이 있다면 계약 영향과 근거를 명시했다.
- [ ] 모듈 DI, 인증/UUID/404, 데이터 격리·응답·기존 흐름 회귀와 실제 DB 테스트 결과를 확인했다. 실패·skip을 성공으로 합산하지 않았다.
- [ ] API/DB 현황, API 정본·계획 문서와 구현 로그의 상태가 실제 결과와 일치한다. 남은 위험과 후속 범위가 기록돼 있다.

필수 검증·검토가 완료되면 계약을 implemented로 바꾼다. DB 격리 검증 등 필수 항목이 환경 문제로 미확인이라면 `구현 완료 / 검증 미완`으로 구분하고 confirmed 상태와 활성 계획을 유지한다. 미확인 항목을 둔 채 "완벽 준수"라고 보고하지 않는다. 필요한 검증·검토가 모두 끝난 뒤 TODO/DONE 보관과 참조 갱신을 수행한다. 커밋은 별도 사용자 요청이 있을 때만 한다.

## 4. 구현 후 결과 기록란

현재는 API 미구현이므로 아래 판정은 미실행이다.

| 검토 축 | 판정 | 파일·명령·검증 근거 | 발견 사항·수정·남은 위험 |
| --- | --- | --- | --- |
| 계층·타입 의존·모듈 경계 | 미실행 | 구현 후 기록 | 구현 후 기록 |
| 인증·UUID·멤버십·Actor 없는 읽기 | 미실행 | 구현 후 기록 | 구현 후 기록 |
| View·각 부모·개인 Favorite 격리 | 미실행 | 구현 후 기록 | 구현 후 기록 |
| 요청·응답·오류·null 계약 | 미실행 | 구현 후 기록 | 구현 후 기록 |
| transaction·observability·주석 | 미실행 | 구현 후 기록 | 구현 후 기록 |
| DB·DI·회귀 검증과 범위 보존 | 미실행 | 구현 후 기록 | 구현 후 기록 |
| 문서·로그·상태 정합성 | 미실행 | 구현 후 기록 | 구현 후 기록 |

최종 판정은 준수 / 수정 후 준수 / 미확인 / 해당 없음과 근거로 남긴다. 필수 미확인이 있으면 구현 완료와 검증 미완을 구분하고 활성 계획을 유지한다.

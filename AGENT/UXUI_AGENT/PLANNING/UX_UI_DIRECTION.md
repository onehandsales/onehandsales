# UX/UI Direction

Status: UX Direction Baseline
Date: 2026-09-12

## 1. Product UX Principle

OneHand CRM은 사용자가 CRM을 배우거나 설계하지 않아도 자기 일에 맞는 CRM을 바로 쓰게 하는 제품이다.

화면은 조용하고 밀도 있게 구성하되, 첫 사용자는 "빈 builder"가 아니라 "내 일을 알고 준비된 CRM"에 들어왔다고 느껴야 한다.

## 2. Visual Tone

- Notion처럼 화이트/그레이 기반의 조용한 작업도구 톤을 우선한다.
- Attio처럼 Record 속성과 연결 관계가 명확히 보이게 한다.
- 과한 hero, 장식 카드, 대형 그래픽보다 실제 업무 화면을 우선한다.
- 파랑/보라 같은 강한 색은 주요 CTA, focus, status 의미에 제한적으로 쓴다.
- 베이지/크림, 다크 네이비, 과한 그라데이션이 화면을 지배하지 않게 한다.

## 3. First Screen

현재 구현 상태에서 로그인 이후 첫 화면은 `/app` foundation home이다.

후속 CRM Core가 붙으면 첫 화면은 사용자 상태에 따라 달라진다.

- Kit 미선택 사용자: 업무 유형 선택
- Kit 선택 완료, 첫 Record 없음: Workspace home + 첫 Record CTA
- 기존 사용자: Workspace home + 최근/예정/다음 행동

## 4. Navigation Direction

전역 navigation은 기능 나열보다 업무 흐름을 우선한다.

후속 Workspace navigation은 Kit의 관리 대상 중심으로 구성한다.

예:

- 부동산 중개: 고객, 매물, 방문, 계약
- 헤드헌팅: 후보자, 회사, 공고, 인터뷰
- 교육/코칭: 수강생, 상담, 과정, 세션

모든 사용자에게 Contact/Product/Deal 구조를 기본 navigation으로 고정하지 않는다.

## 5. List Direction

Record 목록은 반복 사용을 위한 업무 화면이다.

- desktop은 dense row/list/table을 우선한다.
- 모바일은 compact row/list로 재구성한다.
- 목록에서 상태, 연결 Record, 다음 행동이 빠르게 읽혀야 한다.
- 빈 상태는 설정 안내보다 첫 행동 안내를 우선한다.
- 고급 view builder보다 Kit별 기본 보기를 먼저 제공한다.

## 6. Detail Direction

Record 상세는 업무 판단과 다음 행동을 돕는 화면이다.

- 핵심 식별 정보와 상태를 위에 둔다.
- 연결된 Record를 중요한 정보로 다룬다.
- 상세 정보는 섹션으로 정리한다.
- 활동/메모는 후속 범위가 확정될 때 실제 데이터 계약에 맞춰 노출한다.

## 7. Create / Edit Direction

Record 생성은 목록 맥락을 유지하는 오른쪽 문서형 패널을 우선한다.

- 첫 생성 필드는 최소화한다.
- 저장 후 방금 만든 Record 위치를 잃지 않게 한다.
- 상세 입력은 생성 이후 이어서 채울 수 있게 한다.
- 설정 화면처럼 보이는 생성 form은 피한다.

## 8. Mobile Direction

- 주요 CTA는 엄지 조작 범위 안에 둔다.
- 하단 navigation은 현재 사용 맥락에서 가장 중요한 진입점만 담는다.
- desktop table을 억지로 유지하지 않는다.
- 모달, 패널, form은 작은 화면에서 겹치거나 잘리지 않아야 한다.
- 첫 Record 생성까지 이동 단계를 최소화한다.

## 9. Writing Direction

- 사용자 노출 문구는 해요체를 기본으로 한다.
- 버튼은 짧은 행동형으로 쓴다.
- 내부 용어보다 업무 언어를 쓴다.
- 실패 메시지는 문제와 다음 행동을 함께 말한다.
- 빈 상태는 사용자가 지금 할 수 있는 행동을 안내한다.

## 10. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/KIT_SELECTION_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

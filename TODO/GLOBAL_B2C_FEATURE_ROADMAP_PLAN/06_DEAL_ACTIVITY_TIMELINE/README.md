# 06 Deal Activity Timeline

상태: Draft Slot
순서: 06
성격: 기능 구현 전 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

딜 단계 변경, 다음 행동, 메모, 일정, 회의록 연결을 하나의 timeline으로 묶어 딜의 영업 맥락을 한 화면에서 볼 수 있게 한다. 이 슬롯은 DealActivity뿐 아니라 검색/필터, 목록 summary, pagination/page size, 딜 가능성/확률 고도화 같은 핵심 record 탐색 품질도 함께 다룬다.

## 2. 현재 상태

- Deal CRUD, following action log, memo log는 구현되어 있다.
- 회의록 저장 후 딜 연결은 구현되어 있다.
- 범용 `DealActivity` table/API는 현재 코드에는 없다.
- MVP 문서에는 `DealActivity`가 계획되어 있었다.
- Deal list products summary, Contact dealCount, latest activity/next action summary, page size 계약 정리는 `NEXT_BACKEND_API_BACKLOG_PLAN` 후보로 남아 있다.
- 검색/필터 고도화와 딜 가능성/확률 고도화는 후속 기능 후보로 남아 있다.

## 3. 착수 전 해야 할 일

추천 결정:

- `DealActivity`를 별도 모델로 만든다.
- 단계 변경, 회의록 연결, 일정 연결, 다음 행동을 timeline에 자동 기록한다.
- 기존 memo/following action log는 즉시 폐기하지 않고 연결 또는 점진 통합한다.
- private memo는 timeline summary와 목록 summary에서 제외한다.
- list summary/count는 FE에서 꾸미지 않고 API 계약으로 제공한다.

1. 기존 following action/memo log와 범용 activity의 관계를 정한다.
2. 자동 생성 activity와 사용자 작성 activity를 구분한다.
3. 단계 변경/회의록 연결/일정 연결 이벤트를 어디까지 기록할지 정한다.
4. 목록 summary API와의 관계를 정한다.
5. 검색/필터 고도화, list summary, pagination 계약을 이 슬롯 안에서 어떤 순서로 처리할지 정한다.
6. 딜 가능성/확률과 다음 행동 완료/미루기 flow를 현재 Deal 모델과 어떻게 맞출지 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-003

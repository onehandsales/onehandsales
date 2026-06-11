# UX/UI Mobile Pipeline Decision

## 결정

모바일 딜 파이프라인은 단계 탭 + 카드형 리스트로 간다.

## 이유

모바일에서는 테이블과 칸반 모두 가로폭 제약이 크다.

영업자는 이동 중에 어떤 딜인지, 다음에 무엇을 해야 하는지 빠르게 확인해야 한다.

따라서 단계는 상단 탭으로 두고, 딜은 카드형 리스트로 보여준다.

## 구조

상단 단계 탭:

- 전체
- 초기 접촉
- 협의중
- 성사
- 실패

카드 표시 우선순위:

1. 딜명
2. 회사/담당자
3. 단계 · 금액 · 가능성
4. 다음 행동
5. 마감일

## 금지

- 모바일 기본 UI를 테이블로 만들지 않는다.
- 모바일 기본 UI를 가로 스크롤 칸반으로 만들지 않는다.

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`




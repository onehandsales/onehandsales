# UX/UI Search Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM의 검색은 Kit에 적용된 Record를 사용자의 업무 언어로 찾는 경험이어야 한다.

고정형 고객사 검색, 상품 검색, 딜 검색을 전역 기본으로 되살리지 않는다.

## 2. 검색 범위

후속 CRM Core에서 검색은 아래 범위를 단계적으로 검토한다.

- 현재 Workspace 안의 Record
- Kit의 주요 관리 대상
- 연결된 Record
- 상태와 다음 행동
- 공개 문의/계정 설정 등 현재 foundation 기능의 보조 검색은 별도 범위

## 3. UX 기준

- 검색 입력은 현재 Workspace 맥락을 먼저 따른다.
- 결과는 Kit의 관리 대상별로 묶을 수 있다.
- 결과 row에는 이름, 상태, 연결된 핵심 Record, 최근 변경 또는 다음 행동을 보여준다.
- 검색 결과가 없으면 검색어 조정 또는 첫 Record 생성으로 이어지게 한다.

## 4. 사용자-facing 표현

예:

```text
기록 검색
고객, 매물, 방문을 검색해요.
```

```text
검색 결과가 없어요.
검색어를 바꾸거나 새 기록을 추가해 보세요.
```

## 5. 제외

- 모든 테이블을 대상으로 하는 schema-level 검색 UI
- 첫 MVP에서 고급 query builder 제공
- API에 없는 최근 활동 값을 FE가 임의로 만들어 표시하는 것

## 6. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`

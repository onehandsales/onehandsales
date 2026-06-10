# UXUI_AGENT

## 1. 목적

`UXUI_AGENT`는 사용자 흐름과 화면 경험을 책임지는 문서 영역이다.

이 폴더는 사용자가 어떤 순서로 문제를 해결하는지, 화면에서 어떤 정보가 먼저 보여야 하는지, 데스크톱과 모바일에서 어떤 UI 패턴을 사용할지 관리한다.

## 2. 관리 범위

- 사용자 흐름
- 화면 목록
- 홈 딜 파이프라인 방향
- 검색 UX
- 빠른 등록과 inline creation
- 딜 상세 UX
- 일정/회의록 연결 UX
- 다음 행동과 알림 UX
- Admin UI 톤
- 모바일 화면 패턴
- 외부 UX reference 적용 규칙
- UX/UI 리뷰 체크리스트

## 3. 폴더 구조

```text
UXUI_AGENT/
  README.md
  UX_REVIEW_CHECKLIST.md
  PLANNING/
  DECISIONS/
```

## 4. 우선 확인 문서

1. `PLANNING/USER_FLOW_AND_SCREENS.md`
2. `PLANNING/UX_UI_DIRECTION.md`
3. `DECISIONS/005_uxui_home_screen.md`
4. `DECISIONS/006_uxui_reference_style.md`
5. `UX_REVIEW_CHECKLIST.md`

## 5. 협업 원칙

- 새 기능은 먼저 사용자 의도와 흐름을 정의한다.
- 화면 작업은 PM의 MVP 범위와 Software의 API/DB 가능성을 함께 확인한다.
- UI는 장식보다 업무 흐름과 정보 인식 속도를 우선한다.
- 모바일과 데스크톱의 기본 패턴이 다를 수 있음을 문서에 명시한다.
- 외부 UX reference는 패턴만 참고하고 brand, copy, visual asset, layout을 그대로 복제하지 않는다.

## 6. 관련 문서

- `AGENT/README.md`
- `AGENT/PM_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/README.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/README.md`



# UX/UI 기획 문서

## 1. 목적

이 폴더는 OneHand CRM의 사용자 흐름, 화면 구조, UX/UI 방향, 문구 기준을 관리한다.

PM_AGENT의 제품 방향을 화면 경험으로 바꾸는 곳이며, SOFTWARE_AGENT가 구현을 시작하기 전에 사용자 관점의 기준을 제공한다.

## 2. 현재 문서

| 문서 | 목적 |
| --- | --- |
| `FIRST_USE_FLOW.md` | 가입 후 첫 10분 안에 Kit 적용, 첫 Record 생성, 기본 보기 확인까지 이어지는 흐름 |
| `KIT_SELECTION_UX.md` | 업무 유형 선택, Kit 카드, Kit 미리보기, 기타/직접 설명 UX |
| `WORKSPACE_HOME_UX.md` | Kit이 적용된 Workspace home의 정보 우선순위와 빈 상태 기준 |
| `RECORD_LIST_DETAIL_UX.md` | Record 목록, 상세, 생성, 연결, 모바일 전환 기준 |
| `CRM_CORE_INTERACTION_MODEL.md` | Workspace, Kit, Object, Attribute, Relationship, Record, List, View의 화면 표현 방식 |
| `USER_FLOW_AND_SCREENS.md` | User Web/Admin Web 화면 목록과 흐름 지도 |
| `UX_UI_DIRECTION.md` | 전역 UX/UI 원칙, navigation, list/detail/create, mobile 방향 |
| `UX_WRITING_GUIDE.md` | 사용자 노출 문구, 해요체, 상태/오류/validation 문구 기준 |

## 3. 작성 원칙

- 사용자가 CRM 용어를 배우지 않아도 되는 흐름으로 쓴다.
- PM의 MVP 범위와 Kit 전략을 화면 단위로 풀어 쓴다.
- Software 구현 세부가 아니라 사용자 행동과 화면 결과를 먼저 설명한다.
- 현재 구현된 화면과 후속 CRM Core 화면을 구분한다.
- 데스크톱과 모바일의 패턴이 다르면 명시적으로 나눈다.

## 4. 제외 범위

UXUI_AGENT planning 문서에서 직접 확정하지 않는 것:

- Prisma schema
- API request/response DTO
- repository, adapter, transaction 구조
- 테스트 코드 구조
- 배포 설정
- 결제/Team/권한 정책의 제품 범위

## 5. 관련 문서

- `README.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`

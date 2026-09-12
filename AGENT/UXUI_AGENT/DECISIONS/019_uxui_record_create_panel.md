# UX/UI Record Create Panel Decision

Date: 2026-09-12

## 1. 결정

Record 생성은 목록 맥락이 중요한 경우 오른쪽 문서형 패널을 우선한다.

이 패턴은 사용자가 목록에서 비교하고 판단하던 맥락을 유지한 채 새 Record를 만들게 하기 위한 것이다.

## 2. 적용 기준

오른쪽 생성 패널을 우선하는 경우:

- Record 목록에서 바로 새 Record를 만든다.
- 생성 후 목록과 상세를 함께 확인해야 한다.
- 관련 Record를 보며 새 Record를 추가해야 한다.
- modal이 사용자의 업무 맥락을 끊을 위험이 있다.

modal/dialog를 사용할 수 있는 경우:

- 짧은 확인
- 위험 액션 확인
- 보조 입력
- 모바일에서 전체 화면 전환이 더 명확한 경우

## 3. 패널 기준

- 패널은 생성 form과 기본 상세 preview를 함께 담을 수 있다.
- desktop에서는 목록과 패널이 함께 보이는 폭을 우선한다.
- 모바일에서는 전체 화면 생성 flow로 전환할 수 있다.
- 저장 후 생성한 Record 상세를 같은 패널에서 이어서 보여줄 수 있다.

## 4. 입력 기준

- 첫 생성 필드는 최소화한다.
- Kit별로 첫 입력 항목을 다르게 둘 수 있다.
- 고급 정보는 접거나 생성 후 상세에서 채우게 한다.
- 내부 용어가 아니라 업무 언어를 쓴다.

## 5. 제외

- schema builder처럼 보이는 생성 form
- 생성 전 전체 필드 설정 요구
- 모든 상황에 패널을 강제하는 것

## 6. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/007_uxui_record_create_flow.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

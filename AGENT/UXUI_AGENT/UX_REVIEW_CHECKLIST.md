# UX/UI 리뷰 체크리스트

## 1. 목적

이 문서는 화면 설계나 Frontend 구현 결과를 검토할 때 사용하는 UX/UI 기준이다.

`한손에 영업 / onehand.sales`는 개인 영업자의 실무 도구이므로, 화면은 빠른 확인, 빠른 입력, 명확한 다음 행동을 우선해야 한다.

현재 UX/UI 1차 reference는 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`다. 모든 화면은 Notion의 workspace/page/database/detail 문법과 Attio의 CRM record/linked record/activity 문법을 함께 기준으로 검토한다.

단, Notion과 Attio의 브랜드, 문구, 고유 화면, 시각 자산, pixel-level layout은 그대로 복제하지 않는다. 자세한 기준은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.

## 2. 공통 체크리스트

- `/` 공개 진입면이 실제 제품 진입을 방해하지 않는가?
- `/app`이 현재 빈 홈 상태와 맞게 존재하지 않는 업무 데이터를 암시하지 않는가?
- `/app/more`에서 계정 설정 진입이 명확한가?
- 계정 설정 모달에서 프로필, 환경설정, 기기 정보가 구분되는가?
- 도움말 모달에서 지원 문의와 오류 신고 흐름이 구분되는가?
- 공개 문의 form에서 회사명과 회사 규모 입력이 유지되는가?
- 현재 비활성인 Memo/활동 로그가 활성 화면처럼 노출되지 않는가?
- `오프더레코드`, `상품`, `Customer`처럼 정본에서 제외된 표현을 쓰지 않는가?
- 외부 UX reference를 패턴으로만 참고하고, brand/copy/visual asset/layout을 그대로 복제하지 않았는가?
- Notion식 sidebar/page/database/detail 구조를 기준으로 화면이 정돈되어 있는가?
- Attio식 CRM record 맥락이 상세 화면에 분명히 드러나는가?
- row/card가 열 수 있는 record처럼 동작하고, 상세는 page 또는 peek/detail panel처럼 구성되어 있는가?
- 후속 record 목록을 만들 때는 row density와 linked record/업무 판단 정보를 함께 검토했는가?
- page size를 바꾸려는 경우 Backend 상수, 응답 `pageSize`, API/DB 문서, 테스트 계약까지 함께 확인했는가?
- 최근 활동 summary가 현재 list response에 없으면 FE에서 임의 값처럼 꾸미지 않고 BE/API 후속으로 기록했는가?
- 목록에서 새 record를 생성할 때 목록 맥락을 유지해야 한다면 오른쪽 문서형 패널을 우선 검토했는가?
- 문서형 생성 패널이 열려도 목록의 비교 컬럼을 숨기거나 합치지 않는가?
- 화면이 custom CRM builder처럼 과도한 설정 자유도를 노출하지 않고, 고정된 개인 영업 workflow를 빠르게 처리하게 하는가?

## 2A. UX 라이팅 체크리스트

- 사용자에게 보이는 문구가 해요체인가?
- `입니다/습니다/합니다/없습니다/하지 않습니다/수 없습니다/못했습니다/필요합니다/되었습니다` 체가 남아 있지 않은가?
- 저장, 등록, 삭제, 복구 같은 결과 문구가 `저장되었습니다`가 아니라 `저장했어요`처럼 능동형인가?
- empty state가 `없습니다`로 끝나지 않고 사용자가 다음에 할 수 있는 행동을 알려주는가?
- error state가 문제를 짧게 말한 뒤 재시도, 수정, 로그인 같은 다음 행동을 알려주는가?
- validation message가 짧고 구체적이며 `해주세요`는 `해 주세요`로 띄어 쓰는가?
- `~시겠어요?`, `시나요?`, `께`, `계시다`, `여쭈다`처럼 과한 경어를 피했는가?
- 버튼은 짧은 행동형이고, dialog 왼쪽 버튼은 `닫기`로 통일했는가?

## 3. 현재 앱 화면 체크리스트

- 홈은 빈 foundation 화면으로 안정적으로 렌더링되는가?
- 더보기 화면의 사용자 정보와 설정 진입 row가 모바일/데스크톱에서 겹치지 않는가?
- 계정 설정 모달은 프로필, 환경설정, 기기 탭을 명확히 구분하는가?
- 도움말 모달은 지원 문의와 오류 신고 접수 완료/실패 상태를 명확히 보여주는가?
- Contact/Product/Deal/고정형 고객사 정보가 현재 활성 화면처럼 노출되지 않는가?

## 4. 입력 UX 체크리스트

- 공개 문의 form은 실제 필수 입력과 API 검증 기준이 일치하는가?
- 계정 설정 form은 저장 가능한 값만 선택하게 하는가?
- 사용자가 입력을 중단하거나 실패했을 때 복구 가능한 상태인가?

## 5. 시각 톤 체크리스트

- Notion처럼 화이트/그레이 기반의 조용한 작업도구 톤을 유지하는가?
- hover/선택/navigation 상태가 회색 중심으로 정돈되고, 파랑이 기본 active identity처럼 보이지 않는가?
- 아이콘 컬러는 메뉴/도메인 인식에 도움 되는 곳에만 일관되게 쓰이고, 화면이 무지개처럼 보이지 않는가?
- 주요 CTA, focus, status color는 의미가 분명한가?
- 베이지/크림, 다크 네이비, 과한 그라데이션이 화면을 지배하지 않는가?
- 30~50대 사용자가 반복해서 읽기 편한 글자 크기와 대비인가?
- 카드가 중첩되어 있지 않은가?
- 중요한 값이 낮은 대비의 보조 텍스트로 밀려나지 않았는가?
- 과한 hero, 장식 카드, 마케팅형 섹션보다 page/database 같은 실무 구조가 우선인가?

## 6. Admin UX 체크리스트

- Admin Web은 현재 `/login`과 보호 route `/`만 제공하는가?
- 관리자 권한 확인 실패 상태가 짧고 명확하게 보이는가?
- User Web의 도메인 화면이나 사용자 데이터를 암시하는 UI가 남아 있지 않은가?

## 7. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

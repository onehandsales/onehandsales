# UX/UI 리뷰 체크리스트

## 1. 목적

이 문서는 화면 설계나 Frontend 구현 결과를 검토할 때 사용하는 UX/UI 기준이다.

`한손에 영업 / onehand.sales`는 개인 영업자의 실무 도구이므로, 화면은 빠른 확인, 빠른 입력, 명확한 다음 행동을 우선해야 한다.

현재 UX/UI 1차 reference는 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`다. 모든 화면은 Notion의 workspace/page/database/detail 문법과 Attio의 CRM record/linked record/activity 문법을 함께 기준으로 검토한다.

단, Notion과 Attio의 브랜드, 문구, 고유 화면, 시각 자산, pixel-level layout은 그대로 복제하지 않는다. 자세한 기준은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.

## 2. 공통 체크리스트

- `/` 공개 진입면이 실제 제품 진입을 방해하지 않는가?
- `/app` 홈에서 오늘 일정, 진행 딜, 마감 임박 딜, 최근 회의록이 빠르게 보이는가?
- `/app/deals`에서 현재 진행 중인 딜, 금액, 단계, 다음 행동, 마감일을 빠르게 비교할 수 있는가?
- 가능성/likelihood는 현재 Deal API와 FE 입력에 없는 후속 범위로 분리되어 있는가?
- 회사/담당자/제품/딜 등록이 빠른 등록 흐름으로 가능하다면 최소 필드만 요구하는가?
- 복잡한 편집은 상세 페이지로 보내고 있는가?
- 화면별 검색/필터와 상단 통합검색의 역할이 구분되는가?
- Memo 기록은 Log/활동 로그와 구분되고 민감 가능 입력으로 시각적으로 구분되는가?
- `오프더레코드`, `상품`, `Customer`처럼 정본에서 제외된 표현을 쓰지 않는가?
- 외부 UX reference를 패턴으로만 참고하고, brand/copy/visual asset/layout을 그대로 복제하지 않았는가?
- Notion식 sidebar/page/database/detail 구조를 기준으로 화면이 정돈되어 있는가?
- Attio식 CRM record 관계, linked record, activity/Memo 맥락이 상세 화면에 분명히 드러나는가?
- row/card가 열 수 있는 record처럼 동작하고, 상세는 page 또는 peek/detail panel처럼 구성되어 있는가?
- 기존 목록이 이미 record table 구조라면 새 구조로 갈아엎지 않고, row density와 linked record/업무 판단 정보만 강화했는가?
- 데스크톱 목록 row가 약 52~56px 수준의 업무용 밀도를 갖고, 10개 고정 + 큰 row + 약한 업무 맥락 조합으로 보이지 않는가?
- page size를 15개 기본으로 바꾸려는 경우 Backend 상수, 응답 `pageSize`, API/DB 문서, 테스트 계약까지 함께 확인했는가?
- 모바일에서는 15~20개 desktop table을 억지로 보여주지 않고 10개 내외 card/list로 유지했는가?
- 최근 활동 또는 다음 행동 summary가 현재 list response에 없으면 FE에서 임의 값처럼 꾸미지 않고 BE/API 후속으로 기록했는가?
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

## 3. 딜 화면 체크리스트

- 딜 row/card 정보 순서가 정본 기준을 따르는가?
- 데스크톱은 단계 탭 + 리스트/테이블 + 우측 상세 패널 구조인가?
- 모바일은 단계 탭 + 카드형 리스트 구조인가?
- 모바일 기본 UI에 테이블이나 가로 칸반을 사용하지 않았는가?
- Pipedrive의 pipeline 중심성은 참고하되 desktop 기본을 pure Kanban으로 고정하지 않았는가?
- 다음 행동이 목록, 상세, 홈에서 1급 정보로 보이는가?
- 등록일보다 마감일, 다음 행동, 현재 응답에서 가능한 최근 활동, 연결 회사/담당자/제품 맥락이 우선 보이는가?
- 단계 변경 자동 활동 로그가 현재 범위에 없다면 UX에서 필수 피드백으로 요구하지 않는가?

## 4. 입력 UX 체크리스트

- 빠른 등록 modal은 최소 필드만 요구하는가?
- 목록 기반 생성 패널은 현재 목록 맥락을 유지하고, 데스크톱에서 resize 가능하며, 작은 화면에서는 overlay/mobile layout으로 전환되는가?
- 생성 패널이 열려도 목록 컬럼이 줄어들지 않고 가로 스크롤로 모든 정보를 확인할 수 있는가?
- 딜 생성 중 회사/담당자/제품이 없을 때 현재 구현 범위에 맞는 대체 흐름이 명확한가?
- inline creation을 구현 범위에 포함한다면 전체 상세 form이 아니라 최소 생성 form인가?
- 생성 후 새 항목이 현재 작업에 자동 선택되는가?
- 사용자가 입력을 중단하거나 실패했을 때 복구 가능한 상태인가?

## 5. 시각 톤 체크리스트

- Notion처럼 화이트/그레이 기반의 조용한 작업도구 톤을 유지하는가?
- 블루는 주요 CTA, 선택 상태, 포커스 등 필요한 곳에만 절제해서 쓰는가?
- 베이지/크림, 다크 네이비, 과한 그라데이션이 화면을 지배하지 않는가?
- 30~50대 사용자가 반복해서 읽기 편한 글자 크기와 대비인가?
- 카드가 중첩되어 있지 않은가?
- 중요한 값이 낮은 대비의 보조 텍스트로 밀려나지 않았는가?
- 과한 hero, 장식 카드, 마케팅형 섹션보다 page/database 같은 실무 구조가 우선인가?

## 6. Admin UX 체크리스트

- Admin은 데스크톱 전용 운영 콘솔로 보이는가?
- 데이터 테이블, 필터, 서버 페이지네이션이 중심인가?
- Airtable식 table/filter/detail panel 패턴은 참고하되 no-code builder처럼 화면 구성 UX가 노출되지 않았는가?
- 민감 데이터는 기본 마스킹되는가?
- 원문 조회는 사유 입력 dialog를 거치는가?
- 위험 액션은 명확한 확인 dialog를 사용하는가?

## 7. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

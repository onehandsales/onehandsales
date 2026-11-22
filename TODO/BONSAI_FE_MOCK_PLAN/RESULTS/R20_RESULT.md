# R20 소비 범위 보완 결과

상태: G20 소비 분석 수행, R20 전체 완료 아님.

## G20 소비 보완 — 고객 필드·이미지

MCP 신규조회2흐름/7단계, 두 ANALYSIS 4·5·8절과 실제 PNG7/7 확인. App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 채택 Latest/2146은 G18 앱 조회 재사용. 개별 촬영일/제품 빌드/CSS viewport/DPR 미확인. `/tmp/onehandsales-g18-g27/G20/mcp-sources.json`에 Flow/Screen/이미지 URL 기록, 구현 결과는 [G20](G20_RESULT.md)에 연결한다.

- 필드 flow `87c1f8ab-d786-4b2c-9861-d75e5813e639`: `sc_cc68ecaccb72426b8573fca9ece52fc9` → `sc_175d01279ca24ead910995ea1cc957d3` → `sc_c231351f09ab4afe865acaf6e68add0f` → `sc_3d631d315dcb40969d26412f158df64c`. 관찰: Add New Field가 첫 빈 행을 열고3→4 Fields, Email은 필드 **이름**. Done 뒤 회색 표시 행/Edit/Delete로 바뀐다. 고객 연락처 이메일과 별개다.
- 이미지 flow `44e00e8a-aa9f-41f1-b9bc-682789c80985`: `sc_b1619b6b9fc3405e8ad67fd26f405b62` → `sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e` → `sc_7a2bb697a852495e8fd9be9fe6563b0a`. 관찰: JS 이니셜, Update Image 오버레이/X, 보라색 인물 이미지와 성공 알림. 선택창/업로드/제거 과정 미수록.

| 행동 | 관찰 / 목 처리 | 실패·취소·재진입 |
| --- | --- | --- |
| 필드 추가 | workspace 정의 ID와 고객별 값 분리. 표시 개수는 저장+빈 초안, 저장 개수는 별도 접근성 설명. Done 후 저장 | 이름 공백/100자 초과/정규화 중복 거부는 목 가정. 취소/Escape/이탈은 빈 행 폐기. 실패는 초안 유지 |
| 정의 이름 수정·삭제 | Edit/Delete 진입은 관찰. 동일 정의 ID 유지·삭제 확인 Dialog와 모든 고객의 해당 값 제거는 목 가정 | 삭제된 ID의 늦은 값/이름 저장 거부, 기본 필드도 동일 목 규칙. 실제 문서의 프리필/서버 연쇄 영향은 미확인 |
| 고객별 값 편집 | G20 명세의 별도 값 입력을 inline 입력/Done/Cancel로 구현하는 목 가정. 모든 값은 선택 텍스트, Email 이름이어도 Contact.email과 무관 | 고객/field ID와 revision 검증, 빈 값 허용,1000자 제한 가정. 취소/실패/다른 고객 재진입 격리 |
| 대표 이미지 | hover 및 keyboard focus에 Update Image. 로컬 파일 선택→미리보기 Dialog→Save Image, X→제거 확인은 목 가정 | PNG/JPEG/WebP≤2MiB·실제 디코딩 검증(기존 로고의 목 한도 재사용). 실패 재시도/다른 선택/취소/이탈/지연 보호. 저장 성공 전 목록/상세 원본 유지 |

같은 고객 ID의 목록·상세가 저장된 File/Blob를 표시하며 G15 운영 회사 로고·G73 포털 헤더와 분리한다. Object URL은 표시 컴포넌트 수명에서 해제한다. 저장은 메모리이며 새로고침/새 탭/Reset 초기화, 같은 탭 재로그인 보존, workspace 격리. G19 초대 협업자 제한 유지. 원본 인물 파일 자체는 확보하지 못했으므로 검증용 로컬 이미지를 원본 파일처럼 기록하지 않는다.

R03 연락처/lifecycle, R20 저장 뷰/공유/검색·다른 객체의 필드 타입은 미수행 대기. 기존 공식 문서 기록은 과거 보완 자료이며 이번에 공식 사이트/API/계정을 조회하지 않았다. 서버 영속/미디어 압축/권한/문서 영향은 후속 메모이며 이번 FE 착수 조건이 아니다.

## G22 소비 보완 — 보드·표 조회 상태

신규 MCP2flow7screen과 두 ANALYSIS4/5/8절·PNG7개 직접 확인(21~22일 실행). App/Latest2146은 위 G18 기록 재사용, 제품 빌드/촬영일/viewport·DPR 미확인. `/tmp/onehandsales-g18-g27/G22/mcp-sources.json`.

- Projects `d1b4cb1f-9280-49ad-b60d-b10fc8bf713d`: sc_a333622d5e8c45e0b19ff4c249dc0aca → sc_da6135eadeff44e49c083b563487ddf5 → sc_6b648373d5194687be9bd43d9852a4ed → sc_b9f4747781a74fe98ded34416d1287f3. Dashboard는 진입 문맥이며 G72 전체 재구현 제외. 보드5개 관찰 열, 빈 열 유지/개수/가로 스크롤, 열 +·말줄임 관찰.
- List `c9dfa93e-36ea-436f-bdef-bc876f4897c5`: sc_3ade80505ba3458cb239c839815b3750 → sc_4ff59456df244ec089728cd491719a8e → sc_e4e08776c0b942a18b26dc14fd258318. Title/Client/Tags/Start Date/Due/Paid. Due/Paid `$0.00`, 날짜와 별도. Title/Start Date 정렬 아이콘. 행 메뉴 View Project/Mark Completed/Archive Project/Delete Project. 실행 결과·확인 폼 미수록.

목 결정: 두 뷰는 같은 ProjectStore ID/고객/태그/단계를 투영한다. G17의3개seed는 보존(원본2개와 차이 명시). 날짜는 ISO day/날짜 없음, 금액은 USD minor-unit 표시0(청구 산식 아님). Sample 태그는 프로젝트 tag ID로 분리하며 일반 고객이나 새 샘플 고객 프로젝트에 자동 부여하지 않는다. 제목·시작일 정렬은 오름/내림+ID동률 안정정렬, 날짜없음 마지막. 검색은 이름/고객/태그 부분 일치; 필터는 단계/고객 한 개씩의 명시한 목 UI, Apply/Cancel/Escape와 초기화. 검색/필터 결과의 열별 개수이며 빈 열은 남는다.

view/q/stage/client/sort/dir을 URL로 보존, 검색만replace·뷰/정렬/필터apply는push. 뒤로/앞으로 같은 조건 복원. 페이지 재진입/직접 URL은 그 URL대로, 새로고침 인증/데이터는 기존 메모리 초기화하되 URL조회조건 유지. 가로스크롤은 현재 가상 actor/workspace/revision 및 검색/필터별 탭메모리,뷰전환/상세복귀 유지,세션전환/reset초기화. 개인/공유 저장뷰·열너비영속은 만들지 않는다.

View Project는 실제상세 연결. 완료/보관/삭제/열관리의 실행 근거는 미수록이므로 현재목데이터를 바꾸지 않는 명시적 미제공 안내와 복귀를 제공하고 R05/G24 소비 검토·확장 배정으로 인계한다. 숨겨진 정책이나 실제삭제를 추정해 만들지 않는다. G23태그편집/단계변경은 이번에 시작하지 않는다. 권한은 G18배정범위 유지, 초대자는 조회만. 원본 모바일/IME/권한/필터폼/정렬수명/금액계산은 관찰확정이 아니다. R20 전체 완료 아님.

## G23 소비 보완 — 단계 이동·태그

신규 MCP3flow16screen, 세 ANALYSIS4/5/8절과 PNG16개 직접 확인. App bonsai-web c1026782-09a7-45fb-b2d0-7cc1909bf1f4, Latest/2146은 G18 앱 조회 기록 재사용. 실행21~22일, 촬영일/서비스 빌드/viewport·DPR 미확인. 신규 응답·단계 Screen ID는 `/tmp/onehandsales-g18-g27/G23/mcp-sources.json`.

- 상태 `ac1750e4-906b-47f6-ad41-18c1861d4f71`4장: New Lead→메뉴5단계→Proposal Sent. 문서 빈 상태/금액0 유지. 마지막 메뉴의 New Lead는 되돌림 조작 없이 다른 snapshot이다. Preview as Client/Collaborator, Mark Completed, Archive, Delete의 실행 결과는 미수록.
- 이동 `c5e982aa-007d-4e20-8c8b-1fe3c276acc8`3장: Consulting/Sample 카드가 In Progress에서 Contract Signed로, 양쪽 건수1→0/0→1. 실제 계약 서명은 관찰되지 않음. 같은 열 순서·실패·키보드·자동 스크롤은 미확인.
- 태그 `3aa597f9-f613-46dd-bd8c-45686e423865`9장: 카드…→Tags/Mark Completed/Archive Project/Delete Project. Tags 빈모달→Add Tag→Select/Type to create a tag→Create "Sample"→Sample/Edit/성공 안내→카드/보드 반영. Save버튼 없음, 성공이 모달 닫기 전 발생. 비어 있는 것은 프로젝트 연결이며 전체 태그0개 근거가 아니다.

목 정책: 단계 변경은 프로젝트 stage와 순서만 갱신한다. 문서·결제·서명·활동 생성 이벤트를 가짜로 만들지 않는다. 드롭은 저장 성공 후 카드/양쪽 개수 원자 반영, 실패 원위치와 Retry/Cancel. 키보드 이동 폼은 원본에 없는 접근성 보완. 같은 열은 beforeId 또는 마지막 위치로 저장, 타 workspace/잘못된 대상/오래된 revision 거부. 빠른 연속 단계 선택은 이전 요청 취소 후 마지막 의도를 적용한다. 이탈/취소/세션·workspace 변경/Reset 뒤 늦은 응답 폐기.

태그 정의 ID/revision과 프로젝트 tagIds를 분리. 생성+해당 프로젝트 연결은 원자 저장, 기존 태그는 ID로 선택. 공백 정리/대소문자 무시 동일명은 기존 정의 재사용, 1~60자 이름 한도는 목 가정. Edit는 명시적 이름 수정(같은 workspace의 모든 연결에 전파)/프로젝트 연결 해제/추가 선택으로 보완한다. 이름 충돌은 오류/초안 유지. 전역 태그 삭제·색 편집은 근거 없어 추가하지 않는다. 고객 태그/샘플 고객/문서 상태와 분리. 태그 저장은 즉시 반영이며 모달 닫기로 이미 저장한 값을 되돌리지 않고 미제출 초안만 폐기한다.

G22의 미수록 완료/보관/삭제/열설정 실행은 이번에도 실제 완료로 쓰지 않는다. 관찰 메뉴와 명확한 미제공 안내/복귀를 유지하고 R05/G24에서 lifecycle 추가 범위 배정을 검토한다. 개인/공유 저장뷰·예산/원가·수익성과 실제 포털/문서 접근 영향은 R 후속 대기다. 서버/API/DB를 조사 완료 조건으로 삼지 않는다.

G23 소비 검토/구현은 [G23 결과](G23_RESULT.md)로 연결한다. 태그 정의/연결과 순서 변경은 검증했으나 저장 뷰/공유/검색·원본 정책 미확인은 유지한다.

### G27 소비 연결 재검증

[G27 결과](G27_RESULT.md)의 실제 G18~G27 연결 시나리오와 전체 개발/빌드143개씩에서 이 R의 기존 소비 구현을 다시 확인했다. 신규 원본 조회나 R 전체 완료로 계산하지 않는다. 원본 미수록·확장 배정·서버 정책·시각·환경 대기는 유지한다.

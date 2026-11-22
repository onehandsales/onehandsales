# 원본 → ANALYSIS 전수 검토 기록

기준일: 2026-11-22 KST · R4 · 시작 Git HEAD: `ee179b9d` (G31 완료).

**134개 플로우·754단계의 전체 구성과 표시 상태 대조를 마쳤다. 기존 분석은 기능·주요 상태를 설명하지만, Bonsai 원본과 동일하게 재현할 수 있는 세부 명세가 완결되었다는 근거는 부족하다.** 이번에도 요소별 누락 0이나 픽셀 일치를 인증하지 않는다.

목표 원본은 저장된 Gummble `bonsai-web / Latest / 2146` 캡처다. 현재 운영 중인 Bonsai의 다른 버전을 섞어 목표를 바꾸지 않는다. [원본 → 분석 기준](SOURCE_ANALYSIS_STANDARD.md)과 [원본·검토 색인](SOURCE_ANALYSIS_INDEX.json)을 함께 읽는다.

## 1. 기존 ANALYSIS는 무엇을 근거로 만들었는가

각 문서의 기존 1·3·4·6·9절을 보면 다음 근거를 구분할 수 있다.

| 근거 | 분석에서 맡은 역할 | 이 근거만으로 확정할 수 없는 것 |
| --- | --- | --- |
| Gummble Flow ID·Screen ID·단계 순서·이미지 URL | 조사 범위와 화면 연결 | 캡처 사이 모든 클릭·요청·숨은 분기 |
| 실제 캡처와 로컬 PNG | 레이아웃, 입력, 버튼, 표시 상태와 단계별 변화 | 실제 DOM/CSS, 폰트 파일, 서버 저장·발송 결과 |
| 공식 도움말·공개 API | 기능 의미와 정책의 보조 설명 | 캡처 당시 UI와 같은 버전이라는 보장, 내부 API·DB 구조 |
| OneHandSales 모델링 후보 | 후속 설계 시사점 | Bonsai에서 관찰한 사실 또는 확정된 우리 구현 요구사항 |

R1은 출처·관찰·문서·설계 가정을 분리한 초기 기록이다. R2에는 642개 고유 이미지·754단계를 장당 1280×800 비교 시트로 재검토한 이력이 있다. R3는 134개 문서·MCP 목록을 대조하고 고유 이미지 15개를 선택 확인했다. 이들은 과거 수행 기록이며 R4에서 다시 실행한 MCP/웹 조회로 계산하지 않았다. 세부 내용은 [기존 R3 보고서](FE_REVIEW.md)에 남아 있다.

따라서 기존 ANALYSIS는 **화면·흐름·업무 의미 중심의 분석**이다. 모든 화면 요소의 위치·스타일·자산을 빠짐없이 대응시킨 제작 명세라는 별도 증거는 없다. 원본 수집의 완전성과 원본을 분석으로 옮긴 정확성은 서로 다른 검사다.

## 2. 이번에 직접 수행한 범위

| 검사 | 범위·방법 | 한계 |
| --- | --- | --- |
| 문서와 원본 식별 | 134개 분석, 순서가 있는 754단계, 고유 Screen ID 642개 | 로컬 기준. R4에서 Gummble 카탈로그를 다시 조회하지 않음 |
| 전체 구성·상태 시각 대조 | 754단계를 플로우 순서대로 직접 확인. F001–F003은 장당 1440×900, F004–F134는 장당 720×450 비교 시트 | 축소 시트에서 작은 글자·픽셀·전체 요소의 완전성을 인증하지 않음 |
| 선택 영역 확대 | 7개 플로우의 고유 화면 10개, 원본 1:1 좌표의 12개 영역 | 아래 표에 적은 영역만. 전체 화면을 원본 크기로 정밀 검토한 수가 아님 |
| OCR 보조 | Apple Vision accurate로 고유 642개 이미지의 문자열·잉크 경계 후보 생성 | 기계 추출이며 전체 후보를 수동 검증하지 않음. 완전한 전사·CSS 측정값으로 사용하지 않음 |
| 분석 반영 | 각 ANALYSIS의 단계별 R4 방법 기록, 4절에 재확인/보완 관찰, 8절에 남은 분석, 9절에 이력 | 기존 R1/R2/R3 보존. 새 관찰 메모 318개는 오류 318개라는 뜻이 아님 |
| 근거 보존 | JSON에 Flow ID, 단계·Screen ID·파일, 원본 SHA-256, 전후 분석 해시, 확대 좌표·판독 결과 | 해시·ID 일치는 분석 의미의 완전성을 증명하지 않음 |

PNG·FE·BE·TODO는 수정하지 않았다. 실제 계정 조작, 브라우저 동작 재현, FE 테스트, 요소별 치수·색상 전수 측정도 수행하지 않았다. 시작 작업 트리는 깨끗했으며 이 작업은 `bonsai_analysis` 문서 범위다.

## 3. 발견 사항과 반영

| 구분 | 구체적인 근거 | 반영·판정 |
| --- | --- | --- |
| 기존 표현을 관찰 범위로 좁힘 | [Clients 05](<flows/Clients/ANALYSIS.md#source-review-r4>): Client 태그에는 Edit/Delete가 보이고 Lead 태그에는 보이지 않음 | 모든 태그 행에 버튼이 보이는 것으로 읽힐 수 있는 기존 문장을 수정. hover/선택 조건은 미확인 유지 |
| 화면별 변형 보완 | [제안서 만료일 03](<flows/Creating a proposal/Setting proposal expiration date/ANALYSIS.md#source-review-r4>)은 월요일 시작, [수입 입력 08](<flows/Dashboard/Adding income manually/ANALYSIS.md#source-review-r4>)은 일요일 시작 달력 | 달력의 시작 요일·선택 표식·모달 밖 겹침을 구분. 하나의 기본 달력으로 통일할 근거 없음 |
| 오류 유지 상태 재확인 | [공개 폼 07→08](<flows/Forms/Form responses/Giving a response/ANALYSIS.md#source-review-r4>): 200 입력 뒤에도 빨간 입력 테두리·필드 오류·Submit 아래 전체 오류 유지 | 기존 4·5절의 오류 유지 설명과 일치함을 확대 확인하고 근거를 추가. 입력 즉시 오류 해제를 원본 동작으로 가정하지 않음 |
| 시각 요소 재확인·보완 | [Forms 02](<flows/Forms/ANALYSIS.md#source-review-r4>)의 정보 아이콘·Learn More, [상태 설정 04](<flows/Project detail/Adding a task/Editing status settings/ANALYSIS.md#source-review-r4>)의 8색·선택 링 | 기능 이름뿐 아니라 아이콘·표시 위치·선택 표현을 재현 대상으로 명시 |
| 기존 분석 재확인 | [온보딩](<flows/Onboarding/Completing account setup/ANALYSIS.md#source-review-r4>) 진행 표시는 5개, 팀 초대는 넷째, 목적 선택은 다섯째 | 원본 확대에서 확인. 기존 개수는 수정하지 않음. 세 번째 설문 내용은 미수록 |
| 단계 사이 과해석 방지 | [템플릿 작업 추가 06→07](<flows/Tasks/Adding a task (template)/ANALYSIS.md#source-review-r4>): No due date→Feb 09, 중간 조작 없음 | 템플릿이 기한을 자동 복사한 결과라고 확정하지 않음. 버튼 색만으로 활성 규칙도 확정하지 않음 |
| 중간 상태·저장 단위 보완 | [템플릿 작업 편집](<flows/Tasks/Editing a template task/ANALYSIS.md#source-review-r4>): 파일명/구름 아이콘→썸네일, 하위 Save와 전체 Save Task | 업로드 중간 표시, 두 저장 버튼, 긴 모달 스크롤을 별도 상태로 기록 |
| 원본의 종료 범위 재확인 | 자동 발송은 오류, Record payment는 차단 모달, CSV는 Billable 17개 오류, 고객 모드는 Business 안내, Invoice Generator는 가입 화면 | 기존에 기록된 한계도 포함한다. 플로우 이름으로 성공 화면을 만들어 원본 분석에 섞지 않음 |
| 표시 상태와 업무 상태 구분 | [프로젝트 List View](<flows/Projects/Switching to list view/ANALYSIS.md#source-review-r4>)의 Due/Paid는 금액, [시간 Insights](<flows/Time Tracking/ANALYSIS.md#source-review-r4>)의 숫자는 같은데 막대 높이는 다름 | Due를 기한 날짜로 바꾸지 않음. 그래프 변화의 원인을 임의로 설명하지 않음 |
| 근거 링크 단절 | README와 FE_REVIEW가 현재 없는 `review/2026-11-20-r3/evidence.json`을 참조 | 현재 파일 부재를 명시하고 새 로컬 원본 색인과 과거 MCP 기록을 구분. 삭제된 폴더 복원 안 함 |

모든 플로우의 개별 관찰은 각 문서 4절에, 137개 남은 분석 메모는 8절에 보존했다. 여러 메모가 같은 공통 명세를 가리키거나 여러 항목을 묶으므로, 이 숫자를 고유 누락 건수·진척률로 계산하지 않는다.

## 4. 동일 재현 기준으로 아직 부족한 것

| 기준 | 현재 확인한 범위 | 남은 분석 |
| --- | --- | --- |
| 원본 식별 | ID·순서·파일·해시 연결 | 캡처 환경·실제 CSS viewport·DPR 등 원본에 없는 조건 |
| 전체 구성 | 전 단계의 주요 영역·모달·메뉴·배경 상태 대조 | 세부 영역별 경계와 겹침 규칙 |
| 요소 목록 | 플로우별 주요 제어와 보완 관찰 | 원본의 모든 요소를 출발점으로 한 요소 ID·분석 위치 대응표 |
| 정확한 표시 | 주요 레이블·값·오류·표시 차이 | 긴 본문·푸터·작은 문구까지 검증한 전사, 줄바꿈·말줄임 명세 |
| 배치 | 좌우 구성·스크롤·겹침 관찰 | 좌표·폭·높이·간격·정렬·고정 영역의 측정과 구현 좌표계 결정 |
| 글자 | 제목/본문/보조 문구 역할 구분 | 실제 폰트 파일·크기·굵기·행간·자간 대응 |
| 색·장식 | 색상·선택 링·경고·모달 농도 차이 관찰 | 검증된 색상값·테두리·radius·shadow·opacity 명세 |
| 자산 | 로고·사진·삽화·썸네일 존재와 변형 | 원본 에셋/아이콘 파일, 표시 크기·crop·대체 여부 추적 |
| 상태 | 캡처에 있는 빈 상태·로딩·선택·입력·오류·성공 구분 | 모든 요소의 상태 대응 및 미수록 hover/focus/disabled 조사 |
| 전환 | 단계 순서와 눈에 보이는 차이 | 생략된 조작·애니메이션·응답 시간·뒤로가기 규칙 |
| 입력·저장 | 표시 값, 오류, 저장 버튼 경계 | 저장/취소/실패/재진입 정책의 확인 또는 명시적 목 가정 |
| 화면 간 연결 | 공통 Screen ID와 서로 다른 snapshot 구분 | 동일 객체 연결을 보장하는 근거, 관련 화면 수용 기준 |

**이번 검토로 동일 재현 명세 완결을 인증한 플로우는 없다.** 이것은 134개가 모두 잘못됐다는 뜻이 아니라, 위 12개 기준의 요소별 증거를 모두 갖춘 것으로 판정하지 않았다는 뜻이다. 화면 수 754/754는 단계 대조 범위이며 요소 분석 완성률이 아니다.

## 5. 후속 작업 순서

1. **지금 공통 명세를 확정한다.** 앱·인증·공개 사이트·외부 결제의 셸, 타이포그래피, 색, 버튼·입력·모달·달력 변형, 자산을 원본에서 추출하고 근거 수준을 남긴다. 기존 공통 컴포넌트가 이미 맞는지는 이 감사에서 판정하지 않았다.
2. **각 기능 착수 전 요소별 대응표를 채운다.** `Flow ID → 단계/Screen ID → 영역/요소 ID → 문구/상태/스타일/자산 → 분석 위치 → 미확인`을 역추적 가능하게 만든다. 공통 명세를 참조하되 화면별 차이를 지우지 않는다.
3. **그다음 ANALYSIS → TODO를 대조한다.** 원본에서 확인한 요소·상태·전환마다 담당 Goal과 수용 기준을 붙인다. 대응 Goal이 없는 항목과 원본 근거가 없는 작업을 각각 찾는다. 이번에는 TODO를 수정하거나 G30/G31 구현을 평가하지 않았다.
4. **각 Goal 완료 때 원본과 구현을 대조한다.** 같은 입력 데이터·상태·비교 크기를 맞춰 화면과 동작을 확인하고 차이를 기록한다. 이미 끝난 Goal도 해당 분석의 보완 사항을 기준으로 역검토한다.

공통 스타일이나 반복되는 상태 해석 오류를 80번대 Goal 종료까지 미루면 여러 화면에 같은 차이가 퍼진다. 해당 기능에 필요한 누락은 그 기능의 진행 전후에 처리하고, 전 기능 연결·회귀 검증은 마지막에도 수행한다. 원본 밖의 동작은 별도 조사/목 설계로 분류하며 캡처 재현 완료 조건에 몰래 합치지 않는다.

<a id="detail-review"></a>
## 6. 선택 확대 확인 기록

좌표는 원본 2880×1800의 왼쪽 위를 원점으로 한 `[x, y, width, height]`다. 해당 영역을 축소 없이 열었다. CSS 치수나 측정 완료한 컴포넌트 경계라는 뜻은 아니다. 정확한 Screen ID·원본 경로와 판독 내용은 [색인](SOURCE_ANALYSIS_INDEX.json)의 `native_detail_reviews`에 있다.

| 흐름·단계 | 원본 영역 | 판독 대상 |
| --- | --- | --- |
| F087 · 01 / 09 / 11 | 각 `[960, 140, 520, 100]` | 진행 표시 5개와 활성 위치 |
| F019 · 05 | `[450, 370, 2250, 1000]` | Client/Lead 행 작업 버튼 표시 차이 |
| F057 · 02 | `[450, 180, 1500, 600]` | Learn More 정보 아이콘·응답/질문 수 원문 |
| F101 · 04 | `[900, 100, 1000, 1200]` | 팔레트 8개·선택 링·이름 필드 |
| F060 · 07 / 08 | 각 `[650, 0, 1600, 600]`와 `[850, 600, 1300, 1100]` | 예산 입력 오류·Submit 아래 전체 오류 유지 |
| F037 · 03 | `[900, 130, 1000, 1200]` | 월요일 시작 달력·날짜 표시 |
| F041 · 08 | `[900, 100, 1000, 1500]` | 일요일 시작 달력·선택일 표시 |

## 7. 문서·원본 검증

최종 정적 검사 결과: **오류 0**. 검사 항목과 범위는 다음과 같다.

- 134개 분석의 1~9절, 단계표와 상세 Screen ID 순서, 754개 단계별 R4 기록, 134개 R4 관찰 앵커·이력 일치.
- 754개 원본 파일의 이름·PNG 헤더·2880×1800 크기와 SHA-256 일치. 고유 642개 ID의 해시는 작업 시작과 같고 공통 ID의 복사본도 일치.
- 318개 관찰과 137개 남은 메모가 해당 문서와 JSON에 모두 존재. 12개 확대 기록의 단계·Screen ID·좌표·판독 내용 연결 확인.
- 기존 분석 해시는 시작 커밋 `ee179b9d`와 일치. 문서의 기존 검토 이력 보존 및 수정 후 분석 해시 일치.
- `bonsai_analysis` Markdown의 로컬 파일 링크 3,972개 대상 존재, 새 R4 앵커·134행 색인 일치. 외부 URL 접속 및 과거 앵커 전체의 의미는 재검증하지 않음.
- `git diff --check` 통과. 변경 범위는 `bonsai_analysis`의 기존 문서 136개와 새 문서/색인 3개다.

검사 요약은 JSON의 `structural_validation`에도 보존한다. 작업용 검사 스크립트·비교 시트·OCR 후보는 임시 디렉터리에 있으며 영구 근거 링크로 사용하지 않는다. 영구 근거는 원본 PNG, 각 분석의 관찰, 원본 ID·해시·확대 좌표가 담긴 색인이다. **이 정적 검사는 요소별 누락 0이나 원본 내용의 의미적 완전성을 인증하지 않는다.**

<a id="flow-index"></a>
## 8. 플로우별 대조 색인

F번호는 이번 검토의 로컬 경로 정렬 번호이며 Gummble Flow ID나 TODO Goal 번호가 아니다. 모든 행은 **구성·상태 대조 완료 / 요소별 정밀 명세 미완**이다. 링크는 각 ANALYSIS의 R4 관찰로 이동한다.

| 검토 ID | 플로우·개별 관찰 | 대조 단계 | 관찰 메모 | 남은 메모 |
| --- | --- | ---: | ---: | ---: |
| F001 | [404](<flows/404/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 2 |
| F002 | [Accepting an invitation](<flows/Accepting an invitation/ANALYSIS.md#source-review-r4>) | 13/13 | 5 | 2 |
| F003 | [Adding a new client](<flows/Adding a new client/ANALYSIS.md#source-review-r4>) | 7/7 | 4 | 2 |
| F004 | [Affiliate Program](<flows/Affiliate Program/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F005 | [Blog](<flows/Blog/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F006 | [Blog/Blog detail](<flows/Blog/Blog detail/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F007 | [Blog/Searching blog](<flows/Blog/Searching blog/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F008 | [Bookkeeping](<flows/Bookkeeping/ANALYSIS.md#source-review-r4>) | 7/7 | 2 | 1 |
| F009 | [Bookkeeping/Adding a bookkeeping category](<flows/Bookkeeping/Adding a bookkeeping category/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F010 | [Bookkeeping/Adding a recurring expense](<flows/Bookkeeping/Adding a recurring expense/ANALYSIS.md#source-review-r4>) | 11/11 | 3 | 1 |
| F011 | [Bookkeeping/Adding a recurring expense/Adding an image and note](<flows/Bookkeeping/Adding a recurring expense/Adding an image and note/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F012 | [Bookkeeping/Bookkeeping overview](<flows/Bookkeeping/Bookkeeping overview/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F013 | [Bookkeeping/Bulk editing expenses](<flows/Bookkeeping/Bulk editing expenses/ANALYSIS.md#source-review-r4>) | 7/7 | 2 | 1 |
| F014 | [Bookkeeping/Connect bank account](<flows/Bookkeeping/Connect bank account/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F015 | [Bookkeeping/Deleting an income](<flows/Bookkeeping/Deleting an income/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F016 | [Bookkeeping/Downloading expenses](<flows/Bookkeeping/Downloading expenses/ANALYSIS.md#source-review-r4>) | 4/4 | 1 | 1 |
| F017 | [Bookkeeping/Filtering expenses](<flows/Bookkeeping/Filtering expenses/ANALYSIS.md#source-review-r4>) | 10/10 | 2 | 1 |
| F018 | [Careers](<flows/Careers/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F019 | [Clients](<flows/Clients/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F020 | [Clients/Adding a client field](<flows/Clients/Adding a client field/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F021 | [Clients/Adding a new project (Clients)](<flows/Clients/Adding a new project (Clients)/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F022 | [Clients/Enabling portal access](<flows/Clients/Enabling portal access/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F023 | [Clients/Uploading a client image](<flows/Clients/Uploading a client image/ANALYSIS.md#source-review-r4>) | 3/3 | 1 | 1 |
| F024 | [Contact Us](<flows/Contact Us/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F025 | [Copying referral link](<flows/Copying referral link/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F026 | [Creating a new contract](<flows/Creating a new contract/ANALYSIS.md#source-review-r4>) | 19/19 | 4 | 1 |
| F027 | [Creating a new contract/Contract guide tour](<flows/Creating a new contract/Contract guide tour/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F028 | [Creating a new contract/Converting contract type](<flows/Creating a new contract/Converting contract type/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F029 | [Creating a new contract/Signing a contract](<flows/Creating a new contract/Signing a contract/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F030 | [Creating a proposal](<flows/Creating a proposal/ANALYSIS.md#source-review-r4>) | 12/12 | 3 | 1 |
| F031 | [Creating a proposal/Archiving a proposal](<flows/Creating a proposal/Archiving a proposal/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F032 | [Creating a proposal/Changing theme](<flows/Creating a proposal/Changing theme/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F033 | [Creating a proposal/Creating a new automation](<flows/Creating a proposal/Creating a new automation/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F034 | [Creating a proposal/Editing header style](<flows/Creating a proposal/Editing header style/ANALYSIS.md#source-review-r4>) | 7/7 | 2 | 1 |
| F035 | [Creating a proposal/Marking as accepted](<flows/Creating a proposal/Marking as accepted/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F036 | [Creating a proposal/Sending a proposal](<flows/Creating a proposal/Sending a proposal/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F037 | [Creating a proposal/Setting proposal expiration date](<flows/Creating a proposal/Setting proposal expiration date/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F038 | [Dashboard](<flows/Dashboard/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F039 | [Dashboard/Adding company details](<flows/Dashboard/Adding company details/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F040 | [Dashboard/Adding company details/Uploading company logo](<flows/Dashboard/Adding company details/Uploading company logo/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F041 | [Dashboard/Adding income manually](<flows/Dashboard/Adding income manually/ANALYSIS.md#source-review-r4>) | 11/11 | 3 | 1 |
| F042 | [Dashboard/Connecting to Google Calendar](<flows/Dashboard/Connecting to Google Calendar/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F043 | [Dashboard/Connecting to Google Calendar/Adding event details](<flows/Dashboard/Connecting to Google Calendar/Adding event details/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F044 | [Dashboard/Connecting to Google Calendar/Editing advanced settings](<flows/Dashboard/Connecting to Google Calendar/Editing advanced settings/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F045 | [Dashboard/Connecting to Google Calendar/Editing an event type](<flows/Dashboard/Connecting to Google Calendar/Editing an event type/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F046 | [Dashboard/Connecting to Google Calendar/Editing branding & design](<flows/Dashboard/Connecting to Google Calendar/Editing branding & design/ANALYSIS.md#source-review-r4>) | 10/10 | 2 | 1 |
| F047 | [Dashboard/Connecting to Google Calendar/Setting up availability](<flows/Dashboard/Connecting to Google Calendar/Setting up availability/ANALYSIS.md#source-review-r4>) | 8/8 | 2 | 1 |
| F048 | [Dashboard/Connecting to Google Calendar/View booking page](<flows/Dashboard/Connecting to Google Calendar/View booking page/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F049 | [Dashboard/Create a contact form (template)](<flows/Dashboard/Create a contact form (template)/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F050 | [Dashboard/Create a contact form (template)/Filtering contact templates](<flows/Dashboard/Create a contact form (template)/Filtering contact templates/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F051 | [Dashboard/Create a contact form (template)/Searching templates](<flows/Dashboard/Create a contact form (template)/Searching templates/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F052 | [Dashboard/Create a contact form (template)/Using a template](<flows/Dashboard/Create a contact form (template)/Using a template/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F053 | [Dashboard/Hiding sidebar](<flows/Dashboard/Hiding sidebar/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F054 | [Dashboard/Marking a task as complete](<flows/Dashboard/Marking a task as complete/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F055 | [Filtering all templates](<flows/Filtering all templates/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F056 | [Filtering all templates/Template detail](<flows/Filtering all templates/Template detail/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F057 | [Forms](<flows/Forms/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F058 | [Forms/Adding questions to a form](<flows/Forms/Adding questions to a form/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F059 | [Forms/Form responses](<flows/Forms/Form responses/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F060 | [Forms/Form responses/Giving a response](<flows/Forms/Form responses/Giving a response/ANALYSIS.md#source-review-r4>) | 9/9 | 4 | 1 |
| F061 | [Forms/Form responses/Response detail](<flows/Forms/Form responses/Response detail/ANALYSIS.md#source-review-r4>) | 4/4 | 3 | 1 |
| F062 | [Forms/Reordering questions](<flows/Forms/Reordering questions/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F063 | [Forms/Sharing a form](<flows/Forms/Sharing a form/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F064 | [Freelancers](<flows/Freelancers/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F065 | [Help Center](<flows/Help Center/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F066 | [Help Center/Help article detail](<flows/Help Center/Help article detail/ANALYSIS.md#source-review-r4>) | 4/4 | 3 | 1 |
| F067 | [Industries (Consulting)](<flows/Industries (Consulting)/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F068 | [Inviting a member](<flows/Inviting a member/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F069 | [Invoice templates](<flows/Invoice templates/ANALYSIS.md#source-review-r4>) | 11/11 | 3 | 1 |
| F070 | [Invoices](<flows/Invoices/ANALYSIS.md#source-review-r4>) | 4/4 | 3 | 1 |
| F071 | [Invoices/Adding a new invoice](<flows/Invoices/Adding a new invoice/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F072 | [Invoices/Adding a new invoice/Adding unbilled time](<flows/Invoices/Adding a new invoice/Adding unbilled time/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F073 | [Invoices/Adding a new invoice/Editing an item](<flows/Invoices/Adding a new invoice/Editing an item/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F074 | [Invoices/Adding a new invoice/Editing invoice header](<flows/Invoices/Adding a new invoice/Editing invoice header/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F075 | [Invoices/Adding a new invoice/Enable auto-sending](<flows/Invoices/Adding a new invoice/Enable auto-sending/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F076 | [Invoices/Adding a new invoice/Preview invoice](<flows/Invoices/Adding a new invoice/Preview invoice/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F077 | [Invoices/Adding a new invoice/Record payment](<flows/Invoices/Adding a new invoice/Record payment/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F078 | [Invoices/Connecting to Stripe](<flows/Invoices/Connecting to Stripe/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F079 | [Invoices/Connecting to Stripe/Turning off card payments](<flows/Invoices/Connecting to Stripe/Turning off card payments/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F080 | [Invoices/Editing default values (Invoices)](<flows/Invoices/Editing default values (Invoices)/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F081 | [Invoices/Updating invoice settings](<flows/Invoices/Updating invoice settings/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F082 | [Landing page](<flows/Landing page/ANALYSIS.md#source-review-r4>) | 11/11 | 3 | 1 |
| F083 | [Logging in](<flows/Logging in/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F084 | [Logging in/Resetting password](<flows/Logging in/Resetting password/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F085 | [Logging out](<flows/Logging out/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F086 | [Onboarding](<flows/Onboarding/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F087 | [Onboarding/Completing account setup](<flows/Onboarding/Completing account setup/ANALYSIS.md#source-review-r4>) | 16/16 | 3 | 1 |
| F088 | [Perks](<flows/Perks/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F089 | [Pricing](<flows/Pricing/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F090 | [Privacy](<flows/Privacy/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F091 | [Products (CRM)](<flows/Products (CRM)/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F092 | [Project detail](<flows/Project detail/ANALYSIS.md#source-review-r4>) | 6/6 | 3 | 1 |
| F093 | [Project detail/Adding a task](<flows/Project detail/Adding a task/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F094 | [Project detail/Adding a task/Adding a comment](<flows/Project detail/Adding a task/Adding a comment/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F095 | [Project detail/Adding a task/Adding a time entry](<flows/Project detail/Adding a task/Adding a time entry/ANALYSIS.md#source-review-r4>) | 6/6 | 2 | 1 |
| F096 | [Project detail/Adding a task/Adding subtasks](<flows/Project detail/Adding a task/Adding subtasks/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F097 | [Project detail/Adding a task/Archiving a task](<flows/Project detail/Adding a task/Archiving a task/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F098 | [Project detail/Adding a task/Continue tracking time](<flows/Project detail/Adding a task/Continue tracking time/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F099 | [Project detail/Adding a task/Deleting a task](<flows/Project detail/Adding a task/Deleting a task/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F100 | [Project detail/Adding a task/Editing a subtask](<flows/Project detail/Adding a task/Editing a subtask/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F101 | [Project detail/Adding a task/Editing status settings](<flows/Project detail/Adding a task/Editing status settings/ANALYSIS.md#source-review-r4>) | 6/6 | 3 | 1 |
| F102 | [Project detail/Editing project name](<flows/Project detail/Editing project name/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F103 | [Project detail/Editing project settings](<flows/Project detail/Editing project settings/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F104 | [Project detail/Updating project status](<flows/Project detail/Updating project status/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F105 | [Projects](<flows/Projects/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F106 | [Projects/Adding a tag](<flows/Projects/Adding a tag/ANALYSIS.md#source-review-r4>) | 9/9 | 2 | 1 |
| F107 | [Projects/Creating a project (Projects)](<flows/Projects/Creating a project (Projects)/ANALYSIS.md#source-review-r4>) | 6/6 | 3 | 1 |
| F108 | [Projects/Reordering projects](<flows/Projects/Reordering projects/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F109 | [Projects/Switching to list view](<flows/Projects/Switching to list view/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F110 | [Reviews](<flows/Reviews/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F111 | [Scheduling](<flows/Scheduling/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F112 | [Scheduling/Copying a booking page](<flows/Scheduling/Copying a booking page/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F113 | [Searching Bonsai](<flows/Searching Bonsai/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F114 | [Services](<flows/Services/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F115 | [Services/Adding a service to library](<flows/Services/Adding a service to library/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |
| F116 | [Settings](<flows/Settings/ANALYSIS.md#source-review-r4>) | 12/12 | 3 | 1 |
| F117 | [Settings/Deleting account](<flows/Settings/Deleting account/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F118 | [Settings/Disabling public profile](<flows/Settings/Disabling public profile/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F119 | [Settings/Editing branding settings](<flows/Settings/Editing branding settings/ANALYSIS.md#source-review-r4>) | 6/6 | 3 | 1 |
| F120 | [Settings/Editing notification settings](<flows/Settings/Editing notification settings/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F121 | [Settings/Enable client mode](<flows/Settings/Enable client mode/ANALYSIS.md#source-review-r4>) | 2/2 | 2 | 1 |
| F122 | [Settings/Importing a CSV](<flows/Settings/Importing a CSV/ANALYSIS.md#source-review-r4>) | 11/11 | 3 | 1 |
| F123 | [Settings/Removing a user](<flows/Settings/Removing a user/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F124 | [Settings/Uploading profile picture](<flows/Settings/Uploading profile picture/ANALYSIS.md#source-review-r4>) | 5/5 | 2 | 1 |
| F125 | [Starting time tracking](<flows/Starting time tracking/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F126 | [Subscribing to Starter plan](<flows/Subscribing to Starter plan/ANALYSIS.md#source-review-r4>) | 12/12 | 4 | 1 |
| F127 | [Subscribing to Starter plan/Canceling subscription](<flows/Subscribing to Starter plan/Canceling subscription/ANALYSIS.md#source-review-r4>) | 10/10 | 3 | 1 |
| F128 | [Tasks](<flows/Tasks/ANALYSIS.md#source-review-r4>) | 3/3 | 2 | 1 |
| F129 | [Tasks/Adding a task (template)](<flows/Tasks/Adding a task (template)/ANALYSIS.md#source-review-r4>) | 7/7 | 3 | 1 |
| F130 | [Tasks/Creating a task template](<flows/Tasks/Creating a task template/ANALYSIS.md#source-review-r4>) | 4/4 | 2 | 1 |
| F131 | [Tasks/Editing a template task](<flows/Tasks/Editing a template task/ANALYSIS.md#source-review-r4>) | 8/8 | 3 | 1 |
| F132 | [Terms & Conditions](<flows/Terms & Conditions/ANALYSIS.md#source-review-r4>) | 1/1 | 2 | 1 |
| F133 | [Time Tracking](<flows/Time Tracking/ANALYSIS.md#source-review-r4>) | 6/6 | 3 | 1 |
| F134 | [Using invoice generator](<flows/Using invoice generator/ANALYSIS.md#source-review-r4>) | 5/5 | 3 | 1 |

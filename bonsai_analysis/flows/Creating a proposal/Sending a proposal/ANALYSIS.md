# Sending a proposal 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `21548d39-a3a9-4f72-883d-250c6a60c774` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=21548d39-a3a9-4f72-883d-250c6a60c774) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 8개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

메일 내용과 제안서 유효기간을 확인해 고객에게 제안서를 발송한다.

- 스타일 편집을 마친 Drafted 제안서에서 시작한다.
- 이메일 방식으로 발송하며 URL 방식은 버튼만 보인다.
- 결과는 Sent이고 고객 수신/열람/수락은 확인하지 않았다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal/Sending a proposal`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_cbb5f16996764c49a4df94659a235efa`](https://gummble.com/screens/sc_cbb5f16996764c49a4df94659a235efa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제목·텍스트색 저장 표시](<screens/01_sc_cbb5f16996764c49a4df94659a235efa.png>) | Send Proposal 모달의 이메일 작성 화면을 연다. |
| 02 | [`sc_25be5f0267d34951a96f4cc4ea57539c`](https://gummble.com/screens/sc_25be5f0267d34951a96f4cc4ea57539c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 이메일 발송 작성](<screens/02_sc_25be5f0267d34951a96f4cc4ea57539c.png>) | 유효기간 드롭다운 옵션을 확인한다. |
| 03 | [`sc_c3e9aa3ec98d48189179b818f948fadb`](https://gummble.com/screens/sc_c3e9aa3ec98d48189179b818f948fadb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [발송 시 유효기간 선택](<screens/03_sc_c3e9aa3ec98d48189179b818f948fadb.png>) | 14일에서7일로 바꾼다. |
| 04 | [`sc_c4435e5491e54179984f717b2df15785`](https://gummble.com/screens/sc_c4435e5491e54179984f717b2df15785?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 유효기간7일](<screens/04_sc_c4435e5491e54179984f717b2df15785.png>) | Show Email Preview로 실제 메일 형태를 연다. |
| 05 | [`sc_45229441b2da4fb6aea5cfa3acfed055`](https://gummble.com/screens/sc_45229441b2da4fb6aea5cfa3acfed055?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 메일 미리보기 상단](<screens/05_sc_45229441b2da4fb6aea5cfa3acfed055.png>) | 미리보기 아래로 스크롤해 최종 발송 버튼을 확인한다. |
| 06 | [`sc_5d1663cc08974ff7869dc4a16dfa457f`](https://gummble.com/screens/sc_5d1663cc08974ff7869dc4a16dfa457f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [메일 미리보기 하단](<screens/06_sc_5d1663cc08974ff7869dc4a16dfa457f.png>) | Send Proposal 후 발송완료 메시지. |
| 07 | [`sc_8069e7c78dfb4875b30b27da72d96f3b`](https://gummble.com/screens/sc_8069e7c78dfb4875b30b27da72d96f3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 발송 완료 메시지](<screens/07_sc_8069e7c78dfb4875b30b27da72d96f3b.png>) | 상세에Sent·Feb15만료·발송 성공 토스트가 표시된다. |
| 08 | [`sc_6f751d09df314d7f94be053f43818f5f`](https://gummble.com/screens/sc_6f751d09df314d7f94be053f43818f5f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Sent 제안서 상세](<screens/08_sc_6f751d09df314d7f94be053f43818f5f.png>) | 발송성공표시로종료. 수신/열람은별도. |

## 4. 화면별 상세 분석

### 단계 01 — 제목·텍스트색 저장 표시

- Screen ID: `sc_cbb5f16996764c49a4df94659a235efa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cbb5f16996764c49a4df94659a235efa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/47c523db-2082-45b3-8120-90eb2bcd4881.png)
- 로컬 이미지: [01_sc_cbb5f16996764c49a4df94659a235efa.png](<screens/01_sc_cbb5f16996764c49a4df94659a235efa.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_25be5f0267d34951a96f4cc4ea57539c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 피커닫힘,일반패널과Changes Saved.
- 입력 항목·필수 표시·기본값: Title청록·Text회색·Cover·Brawler·Border1. Drafted5255·만료Feb22.
- 버튼·메뉴·안내 문구: Preview/Send Proposal/Automation,스타일제어.
- 확인된 상태: 스타일변경완료표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 헤더 색 변경이 유지되며 업무 값은 같음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객미리보기·PDF재현은별도검토.

#### 모델링 영향

- 후보와 근거: 콘텐츠/스타일분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 제안서 이메일 발송 작성

- Screen ID: `sc_25be5f0267d34951a96f4cc4ea57539c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_25be5f0267d34951a96f4cc4ea57539c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f4dd2a12-1b91-466d-8528-32880d9a110b.png)
- 로컬 이미지: [02_sc_25be5f0267d34951a96f4cc4ea57539c.png](<screens/02_sc_25be5f0267d34951a96f4cc4ea57539c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cbb5f16996764c49a4df94659a235efa` → 현재 → `sc_c3e9aa3ec98d48189179b818f948fadb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙Send Proposal모달,상단Email/URL탭,자동청구/유효기간선택,수신/제목/본문.
- 입력 항목·필수 표시·기본값: Send Email선택,수락시자동인보이스,다음14일유효,기본수신메일·제안서제목포함Subject·인사본문.
- 버튼·메뉴·안내 문구: Send via URL,Show Email Preview,Send Proposal,X.
- 확인된 상태: 발송전작성. 본문은샘플기본문구.
- 단계 간 변화: Send Proposal 모달의 이메일 작성 화면을 연다.

#### 동작과 데이터

- 화면 관찰: 제안서내용과메일봉투/메시지가별도임을확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: To편집가능여부·CC·서식·발송권한미확인.

#### 모델링 영향

- 후보와 근거: 발송요청메타데이터·메시지템플릿 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 발송 시 유효기간 선택

- Screen ID: `sc_c3e9aa3ec98d48189179b818f948fadb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c3e9aa3ec98d48189179b818f948fadb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/56b84833-0675-489e-96e0-aa4464d34c38.png)
- 로컬 이미지: [03_sc_c3e9aa3ec98d48189179b818f948fadb.png](<screens/03_sc_c3e9aa3ec98d48189179b818f948fadb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_25be5f0267d34951a96f4cc4ea57539c` → 현재 → `sc_c4435e5491e54179984f717b2df15785`

#### 화면에서 직접 확인한 내용

- 레이아웃: 유효기간 드롭다운이 본문 위로 펼쳐짐.
- 입력 항목·필수 표시·기본값: No expiration,7/14/30/60/90days,ExpiresFeb22.14days선택.
- 버튼·메뉴·안내 문구: 유효기간메뉴·Send Proposal.
- 확인된 상태: 기간변경전.
- 단계 간 변화: 유효기간 드롭다운 옵션을 확인한다.

#### 동작과 데이터

- 화면 관찰: 상대 일수와 절대 날짜 선택을 함께 제공.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜계산기준·시간대·다른날짜직접입력미확인.

#### 모델링 영향

- 후보와 근거: 상대기간/절대만료일변환 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 제안서 유효기간7일

- Screen ID: `sc_c4435e5491e54179984f717b2df15785`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c4435e5491e54179984f717b2df15785?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1da332c3-ac24-4ac6-a528-c51aeead8614.png)
- 로컬 이미지: [04_sc_c4435e5491e54179984f717b2df15785.png](<screens/04_sc_c4435e5491e54179984f717b2df15785.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c3e9aa3ec98d48189179b818f948fadb` → 현재 → `sc_45229441b2da4fb6aea5cfa3acfed055`

#### 화면에서 직접 확인한 내용

- 레이아웃: 드롭다운닫힘,다음7일로표시.
- 입력 항목·필수 표시·기본값: 수신자/제목/본문/자동청구설정유지.
- 버튼·메뉴·안내 문구: Show Email Preview·Send Proposal·URL탭.
- 확인된 상태: 발송전기간변경.
- 단계 간 변화: 14일에서7일로 바꾼다.

#### 동작과 데이터

- 화면 관찰: 14일→7일변경이UI상확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 모달 취소 시 만료 변경 저장 여부 미확인.

#### 모델링 영향

- 후보와 근거: 발송 전 옵션 초안과 문서 설정 경계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 제안서 메일 미리보기 상단

- Screen ID: `sc_45229441b2da4fb6aea5cfa3acfed055`
- 원본: [화면 페이지](https://gummble.com/screens/sc_45229441b2da4fb6aea5cfa3acfed055?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/172990a7-32d6-4877-b5bd-4074173be5dd.png)
- 로컬 이미지: [05_sc_45229441b2da4fb6aea5cfa3acfed055.png](<screens/05_sc_45229441b2da4fb6aea5cfa3acfed055.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c4435e5491e54179984f717b2df15785` → 현재 → `sc_5d1663cc08974ff7869dc4a16dfa457f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 본문편집대신EMAIL PREVIEW구분선·메일카드,모달길이증가.
- 입력 항목·필수 표시·기본값: 메일제목·내용유지,View Proposal버튼포함.
- 버튼·메뉴·안내 문구: View Proposal미리보기,발송모달상단옵션.
- 확인된 상태: 메일렌더링미리보기.
- 단계 간 변화: Show Email Preview로 실제 메일 형태를 연다.

#### 동작과 데이터

- 화면 관찰: 제안서보기CTA가메일에포함됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미리보기링크실행·실제 메일 클라이언트 렌더링 미확인.

#### 모델링 영향

- 후보와 근거: 메일템플릿렌더링/내용분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 메일 미리보기 하단

- Screen ID: `sc_5d1663cc08974ff7869dc4a16dfa457f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5d1663cc08974ff7869dc4a16dfa457f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a906143b-495f-448f-86a8-4cd5dc70ba49.png)
- 로컬 이미지: [06_sc_5d1663cc08974ff7869dc4a16dfa457f.png](<screens/06_sc_5d1663cc08974ff7869dc4a16dfa457f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_45229441b2da4fb6aea5cfa3acfed055` → 현재 → `sc_8069e7c78dfb4875b30b27da72d96f3b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달아래쪽으로스크롤,Powered by Bonsai·메일카드·하단작업.
- 입력 항목·필수 표시·기본값: 다음7일유효/수락시자동인보이스유지.
- 버튼·메뉴·안내 문구: Hide Preview,brand settings링크,Send Proposal.
- 확인된 상태: 최종발송전미리보기.
- 단계 간 변화: 미리보기 아래로 스크롤해 최종 발송 버튼을 확인한다.

#### 동작과 데이터

- 화면 관찰: 메일 브랜딩이 문서 헤더 스타일과 다른 설정 경로임을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 브랜딩 기본값 변경의 과거 발송 영향 미확인.

#### 모델링 영향

- 후보와 근거: 메일브랜딩·발송본문스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 제안서 발송 완료 메시지

- Screen ID: `sc_8069e7c78dfb4875b30b27da72d96f3b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8069e7c78dfb4875b30b27da72d96f3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cf58af3f-3dc0-42b0-bd2b-237a1ad34ec4.png)
- 로컬 이미지: [07_sc_8069e7c78dfb4875b30b27da72d96f3b.png](<screens/07_sc_8069e7c78dfb4875b30b27da72d96f3b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5d1663cc08974ff7869dc4a16dfa457f` → 현재 → `sc_6f751d09df314d7f94be053f43818f5f`

#### 화면에서 직접 확인한 내용

- 레이아웃: Send Proposal모달 내용이 성공 문구로 대체,채널탭회색.
- 입력 항목·필수 표시·기본값: Your proposal has been sent!
- 버튼·메뉴·안내 문구: 닫기X. 추가입력없음.
- 확인된 상태: 발송처리성공표시.
- 단계 간 변화: Send Proposal 후 발송완료 메시지.

#### 동작과 데이터

- 화면 관찰: 앱이발송완료를보고.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메일실수신/배달이벤트는미확인.

#### 모델링 영향

- 후보와 근거: 발송작업응답상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Sent 제안서 상세

- Screen ID: `sc_6f751d09df314d7f94be053f43818f5f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6f751d09df314d7f94be053f43818f5f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/11ba08f7-1863-4bb4-8794-ed4b7c6c6f42.png)
- 로컬 이미지: [08_sc_6f751d09df314d7f94be053f43818f5f.png](<screens/08_sc_6f751d09df314d7f94be053f43818f5f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8069e7c78dfb4875b30b27da72d96f3b` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 편집제어사라진문서와Overview/Payments/Activity. 우하단성공토스트.
- 입력 항목·필수 표시·기본값: Sent,5255,SingleOption,ExpirationFeb15,SentFeb8·Accepted빈칸,USD.
- 버튼·메뉴·안내 문구: Send Reminder,Automation,…,Activity펼침.
- 확인된 상태: 발송후읽기상태.
- 단계 간 변화: 상세에Sent·Feb15만료·발송 성공 토스트가 표시된다.

#### 동작과 데이터

- 화면 관찰: Drafted→Sent·발송날짜·만료일변경확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객열람·거절·반송·재발송동작미수록.

#### 모델링 영향

- 후보와 근거: 문서상태전이·발송이력·유효기간 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 발송 시 선택한7일이 기존Feb22를Feb15로 바꾼다. Sent날짜Feb8과 일치하는 기간이다.
- [관찰] Auto-create invoices when accepted가 선택된 표시지만 이 시점은 아직 수락 전이므로 청구서 생성을 단정하지 않는다.
- [관찰] 발송후스타일편집제어와Preview/Send Proposal이사라지고Send Reminder가나타난다.
- [문서] 이메일과URL공유를구분하며공개API는 문서 생성 초안만 제공한다고 설명한다.

## 6. 공식 도움말과 API 대조

- [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 2026-07-27 이후 생성 계정은 통합 Document builder를 사용한다고 명시한다. 이 캡처의 기존 Proposals 편집기와 현재 API의 Docs를 같은 버전으로 간주하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.
- [URL공유 도움말](https://help.hellobonsai.com/en/articles/2704495-sending-proposals-via-url): URL공유는 사용자가 링크를 전달하는 별도 경로다. 이 자료에서는 실행하지 않았다.
- [수락 후 자동 청구서](https://help.hellobonsai.com/en/articles/2157748-automating-invoices-when-your-proposals-are-accepted): 선택된 패키지로 인보이스를 만든다고 설명한다. 발송 성공과 청구서 생성 성공은 구분한다.

## 7. 데이터 모델링 시사점

- 문서발송이벤트·수신자·메일제목/본문·발송채널·배달/열람상태분리 후보.
- 유효기간상대선택→절대만료일변환,발송버전고정·재발송·알림예약 후보.
- 수락 후 청구서 자동 생성 설정은 문서 발송 메시지와 별개 업무 정책 후보.

## 8. 미확인 사항과 검토 질문

- Send성공이메일provider접수/배달중어느상태인지,반송/실패·중복클릭·재전송을확인한다.
- 발송후문서수정/회수와기존링크무효화·알림취소정책을확인한다.
- 상대 유효기간이 발송 시점 기준인지 날짜 선택 시점 기준인지 예약/재발송으로확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

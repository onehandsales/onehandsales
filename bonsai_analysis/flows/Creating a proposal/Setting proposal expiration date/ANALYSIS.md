# Setting proposal expiration date 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b597e800-c771-4e17-8ddb-1167f2a61deb` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b597e800-c771-4e17-8ddb-1167f2a61deb) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 6개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

제안서의 승인 가능 기한을 달력으로 지정한다.

- Drafted·만료 미설정 제안서에서 시작한다.
- Feb22 2024를 지정하고 업데이트 성공까지 확인한다. 실제 만료 시간 경과는 재현하지 않았다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal/Setting proposal expiration date`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_455f71d704fd4c01b41254a6f93a21fa`](https://gummble.com/screens/sc_455f71d704fd4c01b41254a6f93a21fa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 초안 편집기](<screens/01_sc_455f71d704fd4c01b41254a6f93a21fa.png>) | Set Expiration으로 설정 모달을 연다. |
| 02 | [`sc_60580a9c725e41a9a9b11241ef607289`](https://gummble.com/screens/sc_60580a9c725e41a9a9b11241ef607289?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 만료일 설정 모달](<screens/02_sc_60580a9c725e41a9a9b11241ef607289.png>) | 날짜 입력을 열면 February2024 달력이 나타난다. |
| 03 | [`sc_4b11756b23cf4a98aa8b24a33549a7fe`](https://gummble.com/screens/sc_4b11756b23cf4a98aa8b24a33549a7fe?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [만료일 달력 열림](<screens/03_sc_4b11756b23cf4a98aa8b24a33549a7fe.png>) | 22일 선택 후 날짜값으로 표시된다. |
| 04 | [`sc_51b9ec1746a8402da2a2536d28352e76`](https://gummble.com/screens/sc_51b9ec1746a8402da2a2536d28352e76?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Feb22 만료일 선택](<screens/04_sc_51b9ec1746a8402da2a2536d28352e76.png>) | Confirm 후 Overview에Feb22가 반영된다. |
| 05 | [`sc_adaec91541ec4d51b64abcf3e5ef2d72`](https://gummble.com/screens/sc_adaec91541ec4d51b64abcf3e5ef2d72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [만료일 지정된 Classic 제안서](<screens/05_sc_adaec91541ec4d51b64abcf3e5ef2d72.png>) | 만료일 업데이트 성공 토스트가 나타난다. |
| 06 | [`sc_6c568f5b54674f34912644358146f592`](https://gummble.com/screens/sc_6c568f5b54674f34912644358146f592?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [만료일 업데이트 성공](<screens/06_sc_6c568f5b54674f34912644358146f592.png>) | 날짜 지정 완료로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 제안서 초안 편집기

- Screen ID: `sc_455f71d704fd4c01b41254a6f93a21fa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_455f71d704fd4c01b41254a6f93a21fa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c74fe7ff-870e-4986-8ebc-046f9c1c7b5a.png)
- 로컬 이미지: [01_sc_455f71d704fd4c01b41254a6f93a21fa.png](<screens/01_sc_455f71d704fd4c01b41254a6f93a21fa.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_60580a9c725e41a9a9b11241ef607289`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Proposals/프로젝트/Changes Saved, 중앙 문서, 오른쪽 Overview/Style. 이미지·로고·세리프 제목.
- 입력 항목·필수 표시·기본값: Drafted, Single Option, Amount5255, 만료 Set Expiration. Classic, Title/Text/Background/BottomBorder 색·폭1, Global Font Brawler.
- 버튼·메뉴·안내 문구: Preview, Automation, Send Proposal, …, 이미지Edit/X, 로고X, Add Recipient, Theme/색/글꼴.
- 확인된 상태: 초안 생성 및 저장 표시. Sent/Accepted 날짜 빈칸.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: Rebranding Project와 Doe Company에 연결된 문서가 생성됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 금액 산출 항목·템플릿 치환·자동저장 주기 미확인.

#### 모델링 영향

- 후보와 근거: 제안서 콘텐츠·수신자·스타일·요금 구조·상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 제안서 만료일 설정 모달

- Screen ID: `sc_60580a9c725e41a9a9b11241ef607289`
- 원본: [화면 페이지](https://gummble.com/screens/sc_60580a9c725e41a9a9b11241ef607289?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e6c25c04-7309-4fe4-b017-fea4972bc8b6.png)
- 로컬 이미지: [02_sc_60580a9c725e41a9a9b11241ef607289.png](<screens/02_sc_60580a9c725e41a9a9b11241ef607289.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_455f71d704fd4c01b41254a6f93a21fa` → 현재 → `sc_4b11756b23cf4a98aa8b24a33549a7fe`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Proposal Expiration Date 모달, 설명·알림안내·날짜입력·확정버튼.
- 입력 항목·필수 표시·기본값: No Expiration Date. 별표 없음.
- 버튼·메뉴·안내 문구: Confirm Expiration Date. 하루 전 고객메일·만료 후 사용자통지 안내.
- 확인된 상태: 미설정 상태.
- 단계 간 변화: Set Expiration으로 설정 모달을 연다.

#### 동작과 데이터

- 화면 관찰: 만료와 알림의 연결이 안내문에 명시됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 계정알림설정과의 우선순위·취소동작 미확인.

#### 모델링 영향

- 후보와 근거: 만료설정과알림예약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 만료일 달력 열림

- Screen ID: `sc_4b11756b23cf4a98aa8b24a33549a7fe`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4b11756b23cf4a98aa8b24a33549a7fe?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/331581cc-d883-4796-aad2-85688d3f6b40.png)
- 로컬 이미지: [03_sc_4b11756b23cf4a98aa8b24a33549a7fe.png](<screens/03_sc_4b11756b23cf4a98aa8b24a33549a7fe.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_60580a9c725e41a9a9b11241ef607289` → 현재 → `sc_51b9ec1746a8402da2a2536d28352e76`

#### 화면에서 직접 확인한 내용

- 레이아웃: 날짜 입력 아래 February2024 달력, 월이동 화살표·월~일 그리드.
- 입력 항목·필수 표시·기본값: 입력은아직No Expiration Date.8일과22일에다른배경표시가보임.
- 버튼·메뉴·안내 문구: 날짜셀·이전/다음월·외곽X.
- 확인된 상태: 선택중.
- 단계 간 변화: 날짜 입력을 열면 February2024 달력이 나타난다.

#### 동작과 데이터

- 화면 관찰: 달력 선택 UI와 날짜 입력의 연결 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 오늘/hover/선택 표시 의미는 정적 이미지로 완전 구분 불가. 과거날짜제한 미확인.

#### 모델링 영향

- 후보와 근거: 날짜선택상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Feb22 만료일 선택

- Screen ID: `sc_51b9ec1746a8402da2a2536d28352e76`
- 원본: [화면 페이지](https://gummble.com/screens/sc_51b9ec1746a8402da2a2536d28352e76?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1572dc62-dc56-4772-80d5-33f8a89a4d9f.png)
- 로컬 이미지: [04_sc_51b9ec1746a8402da2a2536d28352e76.png](<screens/04_sc_51b9ec1746a8402da2a2536d28352e76.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4b11756b23cf4a98aa8b24a33549a7fe` → 현재 → `sc_adaec91541ec4d51b64abcf3e5ef2d72`

#### 화면에서 직접 확인한 내용

- 레이아웃: 달력 닫힘, 날짜값과 오른쪽작은X.
- 입력 항목·필수 표시·기본값: Feb22 2024.
- 버튼·메뉴·안내 문구: Confirm Expiration Date·날짜지우기X·모달X.
- 확인된 상태: 저장 전 날짜선택 완료.
- 단계 간 변화: 22일 선택 후 날짜값으로 표시된다.

#### 동작과 데이터

- 화면 관찰: 선택한 날짜가 입력값으로 반영.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 지우기후저장·검증오류 미수록.

#### 모델링 영향

- 후보와 근거: nullable만료 날짜와 확정 전 편집 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 만료일 지정된 Classic 제안서

- Screen ID: `sc_adaec91541ec4d51b64abcf3e5ef2d72`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adaec91541ec4d51b64abcf3e5ef2d72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4a6eb2e5-2698-496d-a192-8985024d4140.png)
- 로컬 이미지: [05_sc_adaec91541ec4d51b64abcf3e5ef2d72.png](<screens/05_sc_adaec91541ec4d51b64abcf3e5ef2d72.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_51b9ec1746a8402da2a2536d28352e76` → 현재 → `sc_6c568f5b54674f34912644358146f592`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 상단 추상 배경·왼쪽 로고·제목, 우측 Overview/Style.
- 입력 항목·필수 표시·기본값: Drafted5255, Single Option, Expiration Feb22 2024, Theme Classic, Border Width1, Brawler.
- 버튼·메뉴·안내 문구: Theme,색조절,Preview/Send/Automation,이미지Edit/X.
- 확인된 상태: 테마 수정 전. Changes Saved 표시.
- 단계 간 변화: Confirm 후 Overview에Feb22가 반영된다.

#### 동작과 데이터

- 화면 관찰: 만료와 스타일이 독립 속성으로 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 만료 설정 과정은 다른 흐름,현재 이미지로 재구성하지 않음.

#### 모델링 영향

- 후보와 근거: 문서 내용·만료·표현 설정 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 만료일 업데이트 성공

- Screen ID: `sc_6c568f5b54674f34912644358146f592`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6c568f5b54674f34912644358146f592?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/27427440-f2c4-4c77-b6a6-be688b7c14e8.png)
- 로컬 이미지: [06_sc_6c568f5b54674f34912644358146f592.png](<screens/06_sc_6c568f5b54674f34912644358146f592.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_adaec91541ec4d51b64abcf3e5ef2d72` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Classic편집기와 Overview Feb22 유지, 우하단성공토스트.
- 입력 항목·필수 표시·기본값: Drafted5255·Feb22,상단Changes Saved.
- 버튼·메뉴·안내 문구: 만료일업데이트성공알림,Send Proposal/Preview/Automation.
- 확인된 상태: 설정성공.
- 단계 간 변화: 만료일 업데이트 성공 토스트가 나타난다.

#### 동작과 데이터

- 화면 관찰: 날짜 변경 성공이 직접 확인됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제만료전이·알림배달은확인안함.

#### 모델링 영향

- 후보와 근거: 만료 설정 저장과 미래 상태 전이 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 만료 하루 전 고객 알림과 만료 후 사용자 통지를 설명한다. 실제 발송은 확인하지 않았다.
- [문서] 만료 이후 고객은 Accept/Reject를 할 수 없고 재발송이 필요하다고 설명한다.
- [관찰] 날짜 지우기 X가 있으나 만료 해제 동작은 미수록.

## 6. 공식 도움말과 API 대조

- [제안서 만료 도움말](https://help.hellobonsai.com/en/articles/5258968-how-to-set-up-an-expiry-valid-till-date-on-proposals): 날짜 선택·expired 상태·고객 행동 차단을 설명한다.
- [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 2026-07-27 이후 생성 계정은 통합 Document builder를 사용한다고 명시한다. 이 캡처의 기존 Proposals 편집기와 현재 API의 Docs를 같은 버전으로 간주하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.

## 7. 데이터 모델링 시사점

- 문서 만료일·상태 전이·만료 전후 알림 후보. 캘린더 날짜와 실제 만료 timestamp의 변환 규칙 필요.
- 발송 시 상대 기간 선택이 기존 절대날짜를 변경하는 별도 경로와 연결한다.

## 8. 미확인 사항과 검토 질문

- 만료일의 어느 시각/시간대를 기준으로 승인 차단하는가? 경계 시각을 재현해야 한다.
- 만료 연장·해제·재발송이 기존 링크와 알림 예약에 어떻게 반영되는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

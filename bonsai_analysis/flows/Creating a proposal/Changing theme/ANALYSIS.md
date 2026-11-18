# Changing theme 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 6개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

제안서 헤더 테마를 비교하고 Cover로 적용한다.

- 만료 Feb22가 이미 지정된 초안에서 시작한다. 만료 설정은 별도 하위 흐름이다.
- Classic→Splash→Cover를 탐색하며 본문 하단도 확인한다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal/Changing theme`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_adaec91541ec4d51b64abcf3e5ef2d72`](https://gummble.com/screens/sc_adaec91541ec4d51b64abcf3e5ef2d72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [만료일 지정된 Classic 제안서](<screens/01_sc_adaec91541ec4d51b64abcf3e5ef2d72.png>) | Theme을 열어8개 헤더 테마 선택 패널을 표시한다. |
| 02 | [`sc_7ab5cf0d2cc94fa39517b953ea1d423d`](https://gummble.com/screens/sc_7ab5cf0d2cc94fa39517b953ea1d423d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [8개 헤더 테마 선택](<screens/02_sc_7ab5cf0d2cc94fa39517b953ea1d423d.png>) | Splash 선택으로 큰 배경과 하단 제목 카드로 바뀐다. |
| 03 | [`sc_4eae05d2299e4302a422bdd73f89ee2f`](https://gummble.com/screens/sc_4eae05d2299e4302a422bdd73f89ee2f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Splash 테마 적용 미리보기](<screens/03_sc_4eae05d2299e4302a422bdd73f89ee2f.png>) | 문서 아래로 스크롤해 본문·금액이 유지되는지 확인한다. |
| 04 | [`sc_65df6f8df3c64660bb0ed9f0712d0292`](https://gummble.com/screens/sc_65df6f8df3c64660bb0ed9f0712d0292?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Splash 본문 하단](<screens/04_sc_65df6f8df3c64660bb0ed9f0712d0292.png>) | Cover를 선택해 상단 이미지/중앙 로고·제목 배치로 바꾼다. |
| 05 | [`sc_bb64d1812ba64baca74a6791334b5540`](https://gummble.com/screens/sc_bb64d1812ba64baca74a6791334b5540?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Cover 테마 선택 미리보기](<screens/05_sc_bb64d1812ba64baca74a6791334b5540.png>) | Finish Styling 후 일반 Style 패널로 복귀한다. |
| 06 | [`sc_c226d7f45ba246fb99a4debc2dd2d1d1`](https://gummble.com/screens/sc_c226d7f45ba246fb99a4debc2dd2d1d1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Cover 적용 후 스타일 패널](<screens/06_sc_c226d7f45ba246fb99a4debc2dd2d1d1.png>) | Cover 적용 상태에서 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 만료일 지정된 Classic 제안서

- Screen ID: `sc_adaec91541ec4d51b64abcf3e5ef2d72`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adaec91541ec4d51b64abcf3e5ef2d72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4a6eb2e5-2698-496d-a192-8985024d4140.png)
- 로컬 이미지: [01_sc_adaec91541ec4d51b64abcf3e5ef2d72.png](<screens/01_sc_adaec91541ec4d51b64abcf3e5ef2d72.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7ab5cf0d2cc94fa39517b953ea1d423d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 상단 추상 배경·왼쪽 로고·제목, 우측 Overview/Style.
- 입력 항목·필수 표시·기본값: Drafted5255, Single Option, Expiration Feb22 2024, Theme Classic, Border Width1, Brawler.
- 버튼·메뉴·안내 문구: Theme,색조절,Preview/Send/Automation,이미지Edit/X.
- 확인된 상태: 테마 수정 전. Changes Saved 표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 만료와 스타일이 독립 속성으로 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 만료 설정 과정은 다른 흐름,현재 이미지로 재구성하지 않음.

#### 모델링 영향

- 후보와 근거: 문서 내용·만료·표현 설정 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 8개 헤더 테마 선택

- Screen ID: `sc_7ab5cf0d2cc94fa39517b953ea1d423d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7ab5cf0d2cc94fa39517b953ea1d423d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/68a7f39a-b381-4ec4-a138-1b0ded74aee5.png)
- 로컬 이미지: [02_sc_7ab5cf0d2cc94fa39517b953ea1d423d.png](<screens/02_sc_7ab5cf0d2cc94fa39517b953ea1d423d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_adaec91541ec4d51b64abcf3e5ef2d72` → 현재 → `sc_4eae05d2299e4302a422bdd73f89ee2f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우측 패널이 Finish Styling과2열4행 테마 카드로 바뀜.
- 입력 항목·필수 표시·기본값: Cover,Classic선택,Alpine,Splash,Auburn,Pastel,Aerial,Misty.
- 버튼·메뉴·안내 문구: 각테마카드,Finish Styling. 문서Preview/Send는 유지.
- 확인된 상태: 테마 선택 패널.
- 단계 간 변화: Theme을 열어8개 헤더 테마 선택 패널을 표시한다.

#### 동작과 데이터

- 화면 관찰: 헤더 레이아웃을 유한한 선택지로 제공.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 키보드 선택·선택즉시저장·테마별 기본값 미확인.

#### 모델링 영향

- 후보와 근거: 테마 식별자와 선택 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Splash 테마 적용 미리보기

- Screen ID: `sc_4eae05d2299e4302a422bdd73f89ee2f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4eae05d2299e4302a422bdd73f89ee2f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6ca8d2fd-44c1-429d-9393-12c6faa421b8.png)
- 로컬 이미지: [03_sc_4eae05d2299e4302a422bdd73f89ee2f.png](<screens/03_sc_4eae05d2299e4302a422bdd73f89ee2f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7ab5cf0d2cc94fa39517b953ea1d423d` → 현재 → `sc_65df6f8df3c64660bb0ed9f0712d0292`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 대부분을 보케 배경이 차지하고 로고좌상단, 제목은 아래 흰 카드. 우측 Splash선택.
- 입력 항목·필수 표시·기본값: 문서명 Creative Design Brief 유지.
- 버튼·메뉴·안내 문구: Finish Styling,다른테마,배경Edit/X·로고X.
- 확인된 상태: 스타일 미리보기 변경.
- 단계 간 변화: Splash 선택으로 큰 배경과 하단 제목 카드로 바뀐다.

#### 동작과 데이터

- 화면 관찰: Classic의 짧은 배너와 다른 큰 표지 레이아웃.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 배경이 테마 기본값으로 바뀌는 정확 규칙·사용자 파일 영향 미확인.

#### 모델링 영향

- 후보와 근거: 테마별 표지높이·배경·제목위치 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Splash 본문 하단

- Screen ID: `sc_65df6f8df3c64660bb0ed9f0712d0292`
- 원본: [화면 페이지](https://gummble.com/screens/sc_65df6f8df3c64660bb0ed9f0712d0292?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c9ffc26f-f600-421f-adf8-9a8ebec57b30.png)
- 로컬 이미지: [04_sc_65df6f8df3c64660bb0ed9f0712d0292.png](<screens/04_sc_65df6f8df3c64660bb0ed9f0712d0292.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4eae05d2299e4302a422bdd73f89ee2f` → 현재 → `sc_bb64d1812ba64baca74a6791334b5540`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 아래로 스크롤, 우측테마패널고정. 요금 합계와 Additional Notes가 보임.
- 입력 항목·필수 표시·기본값: Total5255USD. [Company Name]/[Website]/[Email Address]/[Phone Number] 문자열이 본문에 남음.
- 버튼·메뉴·안내 문구: Add New Row,통화드롭다운,Finish Styling.
- 확인된 상태: 본문 템플릿 placeholder가 아직 치환되지 않은 편집 상태.
- 단계 간 변화: 문서 아래로 스크롤해 본문·금액이 유지되는지 확인한다.

#### 동작과 데이터

- 화면 관찰: 템플릿 본문 예시와 문서 헤더 연락처가 별개로 존재.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 대괄호 문자열이 자동변수인지 단순 안내문인지 미확인.

#### 모델링 영향

- 후보와 근거: 문서 리치텍스트와 실제 구조화 필드 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Cover 테마 선택 미리보기

- Screen ID: `sc_bb64d1812ba64baca74a6791334b5540`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bb64d1812ba64baca74a6791334b5540?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de2d5fbf-cb09-4a65-8605-656e74814ac6.png)
- 로컬 이미지: [05_sc_bb64d1812ba64baca74a6791334b5540.png](<screens/05_sc_bb64d1812ba64baca74a6791334b5540.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_65df6f8df3c64660bb0ed9f0712d0292` → 현재 → `sc_c226d7f45ba246fb99a4debc2dd2d1d1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 짧은 설경 배너, 중앙 겹친로고·중앙제목,아래 발신/수신 두열. 우측Cover선택.
- 입력 항목·필수 표시·기본값: 제목/수신자 유지. 발신주소가 보이고 Client Address placeholder.
- 버튼·메뉴·안내 문구: Finish Styling,이미지Edit/X,Add Recipient.
- 확인된 상태: Cover 선택 중.
- 단계 간 변화: Cover를 선택해 상단 이미지/중앙 로고·제목 배치로 바꾼다.

#### 동작과 데이터

- 화면 관찰: 배경/정렬/표지높이가 바뀌고 업무필드는 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 테마 전환이 본문전역색/폰트를 바꿨는지 전체비교 필요.

#### 모델링 영향

- 후보와 근거: Cover표현 구성과 업무데이터 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Cover 적용 후 스타일 패널

- Screen ID: `sc_c226d7f45ba246fb99a4debc2dd2d1d1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c226d7f45ba246fb99a4debc2dd2d1d1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5da378c-69ac-4e21-bf49-82295c739bdf.png)
- 로컬 이미지: [06_sc_c226d7f45ba246fb99a4debc2dd2d1d1.png](<screens/06_sc_c226d7f45ba246fb99a4debc2dd2d1d1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_bb64d1812ba64baca74a6791334b5540` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우측 테마선택그리드가 Overview/Style설정으로 복귀.
- 입력 항목·필수 표시·기본값: Theme Cover,Font Brawler,Border Width1, 만료Feb22,금액5255.
- 버튼·메뉴·안내 문구: Theme 재선택·색/폭·글꼴·Send Proposal.
- 확인된 상태: 스타일 편집 종료 상태.
- 단계 간 변화: Finish Styling 후 일반 Style 패널로 복귀한다.

#### 동작과 데이터

- 화면 관찰: Cover선택이 일반설정에 반영됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버저장/새로고침 지속성·Undo 미수록.

#### 모델링 영향

- 후보와 근거: 표현 설정 적용 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 테마 선택은 배치뿐 아니라 예시 배경 이미지도 바꾸는 모습이다. 사용자 업로드 이미지 보존 정책은 미확인.
- [관찰] 금액5255, 수신자와 문서명·만료일은 유지된다.
- [관찰] Finish Styling은 스타일 선택 패널을 닫지만 별도 서버 저장 시점은 보이지 않는다.

## 6. 공식 도움말과 API 대조

- [배경·테마 도움말](https://help.hellobonsai.com/en/articles/2880183-adding-your-background-to-proposals-and-invoices): 구형 제안서의8개 스타일과 배경 변경을 설명한다.
- [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 2026-07-27 이후 생성 계정은 통합 Document builder를 사용한다고 명시한다. 이 캡처의 기존 Proposals 편집기와 현재 API의 Docs를 같은 버전으로 간주하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.

## 7. 데이터 모델링 시사점

- 헤더 테마 ID·배경 미디어·로고·레이아웃·기본 색과 글로벌 글꼴을 조합하는 후보.
- 문서 업무 데이터와 표현 스타일의 분리 후보. 테마 전환이 내용을 삭제하는지 별도 확인.

## 8. 미확인 사항과 검토 질문

- 테마 변경 후 직접 지정한 색·글꼴·이미지의 유지/초기화 우선순위를 확인한다.
- Undo·미저장 닫기·모바일/인쇄 페이지 나눔을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

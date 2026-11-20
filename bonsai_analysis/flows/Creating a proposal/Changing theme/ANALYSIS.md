# Changing theme 플로우 분석

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **6/6단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **0/6단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../../FLOW_REVIEW_MATRIX.md#flow-5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 6단계 / 6단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

제안서 헤더 테마를 비교하고 Cover로 적용한다.

- 만료 Feb22가 이미 지정된 초안에서 시작한다. 만료 설정은 별도 하위 흐름이다.
- Classic→Splash→Cover를 탐색하며 본문 하단도 확인한다.

- 상위 흐름: [Creating a proposal](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal/Changing theme`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **만료일 지정된 Classic 제안서**이다. 테마 수정 전. Changes Saved 표시. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **Cover 적용 후 스타일 패널**이다. 스타일 편집 종료 상태. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Creating a proposal](<../ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_adaec91541ec4d51b64abcf3e5ef2d72`](https://gummble.com/screens/sc_adaec91541ec4d51b64abcf3e5ef2d72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [만료일 지정된 Classic 제안서](<screens/01_sc_adaec91541ec4d51b64abcf3e5ef2d72.png>) | 8개 헤더 테마 선택 — 테마 선택 패널. |
| 02 | [`sc_7ab5cf0d2cc94fa39517b953ea1d423d`](https://gummble.com/screens/sc_7ab5cf0d2cc94fa39517b953ea1d423d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [8개 헤더 테마 선택](<screens/02_sc_7ab5cf0d2cc94fa39517b953ea1d423d.png>) | Splash 테마 적용 미리보기 — 스타일 미리보기 변경. |
| 03 | [`sc_4eae05d2299e4302a422bdd73f89ee2f`](https://gummble.com/screens/sc_4eae05d2299e4302a422bdd73f89ee2f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Splash 테마 적용 미리보기](<screens/03_sc_4eae05d2299e4302a422bdd73f89ee2f.png>) | Splash 본문 하단 — 본문 템플릿 placeholder가 아직 치환되지 않은 편집 상태. |
| 04 | [`sc_65df6f8df3c64660bb0ed9f0712d0292`](https://gummble.com/screens/sc_65df6f8df3c64660bb0ed9f0712d0292?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Splash 본문 하단](<screens/04_sc_65df6f8df3c64660bb0ed9f0712d0292.png>) | Cover 테마 선택 미리보기 — Cover 선택 중. |
| 05 | [`sc_bb64d1812ba64baca74a6791334b5540`](https://gummble.com/screens/sc_bb64d1812ba64baca74a6791334b5540?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Cover 테마 선택 미리보기](<screens/05_sc_bb64d1812ba64baca74a6791334b5540.png>) | Cover 적용 후 스타일 패널 — 스타일 편집 종료 상태. |
| 06 | [`sc_c226d7f45ba246fb99a4debc2dd2d1d1`](https://gummble.com/screens/sc_c226d7f45ba246fb99a4debc2dd2d1d1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Cover 적용 후 스타일 패널](<screens/06_sc_c226d7f45ba246fb99a4debc2dd2d1d1.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 만료일 지정된 Classic 제안서

- Screen ID: `sc_adaec91541ec4d51b64abcf3e5ef2d72`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adaec91541ec4d51b64abcf3e5ef2d72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4a6eb2e5-2698-496d-a192-8985024d4140.png)
- 로컬 이미지: [01_sc_adaec91541ec4d51b64abcf3e5ef2d72.png](<screens/01_sc_adaec91541ec4d51b64abcf3e5ef2d72.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 040, 고유 이미지 S157, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7ab5cf0d2cc94fa39517b953ea1d423d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 상단 추상 배경·왼쪽 로고·제목, 우측 Overview/Style.
- 입력 항목·필수 표시·기본값: Drafted5255, Single Option, Expiration Feb22 2024, Theme Classic, Border Width1, Brawler.
- 버튼·메뉴·안내 문구: Theme,색조절,Preview/Send/Automation,이미지Edit/X.
- 확인된 상태: 테마 수정 전. Changes Saved 표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 만료와 스타일이 독립 속성으로 표시된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 만료 설정 과정은 다른 흐름,현재 이미지로 재구성하지 않음.

#### 모델링 영향

- 후보와 근거: 문서 내용·만료·표현 설정 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 만료 설정 과정은 다른 흐름,현재 이미지로 재구성하지 않음. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 8개 헤더 테마 선택

- Screen ID: `sc_7ab5cf0d2cc94fa39517b953ea1d423d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7ab5cf0d2cc94fa39517b953ea1d423d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/68a7f39a-b381-4ec4-a138-1b0ded74aee5.png)
- 로컬 이미지: [02_sc_7ab5cf0d2cc94fa39517b953ea1d423d.png](<screens/02_sc_7ab5cf0d2cc94fa39517b953ea1d423d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 040, 고유 이미지 S158, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_adaec91541ec4d51b64abcf3e5ef2d72` → 현재 → `sc_4eae05d2299e4302a422bdd73f89ee2f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우측 패널이 Finish Styling과2열4행 테마 카드로 바뀜.
- 입력 항목·필수 표시·기본값: Cover,Classic선택,Alpine,Splash,Auburn,Pastel,Aerial,Misty.
- 버튼·메뉴·안내 문구: 각테마카드,Finish Styling. 문서Preview/Send는 유지.
- 확인된 상태: 테마 선택 패널.
- 단계 간 변화: Theme을 열어8개 헤더 테마 선택 패널을 표시한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 헤더 레이아웃을 유한한 선택지로 제공. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 키보드 선택·선택즉시저장·테마별 기본값 미확인.

#### 모델링 영향

- 후보와 근거: 테마 식별자와 선택 상태 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 키보드 선택·선택즉시저장·테마별 기본값 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Splash 테마 적용 미리보기

- Screen ID: `sc_4eae05d2299e4302a422bdd73f89ee2f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4eae05d2299e4302a422bdd73f89ee2f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6ca8d2fd-44c1-429d-9393-12c6faa421b8.png)
- 로컬 이미지: [03_sc_4eae05d2299e4302a422bdd73f89ee2f.png](<screens/03_sc_4eae05d2299e4302a422bdd73f89ee2f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 040, 고유 이미지 S159, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7ab5cf0d2cc94fa39517b953ea1d423d` → 현재 → `sc_65df6f8df3c64660bb0ed9f0712d0292`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 대부분을 보케 배경이 차지하고 로고좌상단, 제목은 아래 흰 카드. 우측 Splash선택.
- 입력 항목·필수 표시·기본값: 문서명 Creative Design Brief 유지.
- 버튼·메뉴·안내 문구: Finish Styling,다른테마,배경Edit/X·로고X.
- 확인된 상태: 스타일 미리보기 변경.
- 단계 간 변화: Splash 선택으로 큰 배경과 하단 제목 카드로 바뀐다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: Classic의 짧은 배너와 다른 큰 표지 레이아웃. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 배경이 테마 기본값으로 바뀌는 정확 규칙·사용자 파일 영향 미확인.

#### 모델링 영향

- 후보와 근거: 테마별 표지높이·배경·제목위치 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 배경이 테마 기본값으로 바뀌는 정확 규칙·사용자 파일 영향 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Splash 본문 하단

- Screen ID: `sc_65df6f8df3c64660bb0ed9f0712d0292`
- 원본: [화면 페이지](https://gummble.com/screens/sc_65df6f8df3c64660bb0ed9f0712d0292?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c9ffc26f-f600-421f-adf8-9a8ebec57b30.png)
- 로컬 이미지: [04_sc_65df6f8df3c64660bb0ed9f0712d0292.png](<screens/04_sc_65df6f8df3c64660bb0ed9f0712d0292.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 040, 고유 이미지 S160, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4eae05d2299e4302a422bdd73f89ee2f` → 현재 → `sc_bb64d1812ba64baca74a6791334b5540`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 아래로 스크롤, 우측테마패널고정. 요금 합계와 Additional Notes가 보임.
- 입력 항목·필수 표시·기본값: Total5255USD. [Company Name]/[Website]/[Email Address]/[Phone Number] 문자열이 본문에 남음.
- 버튼·메뉴·안내 문구: Add New Row,통화드롭다운,Finish Styling.
- 확인된 상태: 본문 템플릿 placeholder가 아직 치환되지 않은 편집 상태.
- 단계 간 변화: 문서 아래로 스크롤해 본문·금액이 유지되는지 확인한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 템플릿 본문 예시와 문서 헤더 연락처가 별개로 존재. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 대괄호 문자열이 자동변수인지 단순 안내문인지 미확인.

#### 모델링 영향

- 후보와 근거: 문서 리치텍스트와 실제 구조화 필드 구분 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 이 대괄호 문자열이 자동변수인지 단순 안내문인지 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Cover 테마 선택 미리보기

- Screen ID: `sc_bb64d1812ba64baca74a6791334b5540`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bb64d1812ba64baca74a6791334b5540?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de2d5fbf-cb09-4a65-8605-656e74814ac6.png)
- 로컬 이미지: [05_sc_bb64d1812ba64baca74a6791334b5540.png](<screens/05_sc_bb64d1812ba64baca74a6791334b5540.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 041, 고유 이미지 S161, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_65df6f8df3c64660bb0ed9f0712d0292` → 현재 → `sc_c226d7f45ba246fb99a4debc2dd2d1d1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 짧은 설경 배너, 중앙 겹친로고·중앙제목,아래 발신/수신 두열. 우측Cover선택.
- 입력 항목·필수 표시·기본값: 제목/수신자 유지. 발신주소가 보이고 Client Address placeholder.
- 버튼·메뉴·안내 문구: Finish Styling,이미지Edit/X,Add Recipient.
- 확인된 상태: Cover 선택 중.
- 단계 간 변화: Cover를 선택해 상단 이미지/중앙 로고·제목 배치로 바꾼다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 배경/정렬/표지높이가 바뀌고 업무필드는 유지. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 테마 전환이 본문전역색/폰트를 바꿨는지 전체비교 필요.

#### 모델링 영향

- 후보와 근거: Cover표현 구성과 업무데이터 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 테마 전환이 본문전역색/폰트를 바꿨는지 전체비교 필요. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Cover 적용 후 스타일 패널

- Screen ID: `sc_c226d7f45ba246fb99a4debc2dd2d1d1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c226d7f45ba246fb99a4debc2dd2d1d1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5da378c-69ac-4e21-bf49-82295c739bdf.png)
- 로컬 이미지: [06_sc_c226d7f45ba246fb99a4debc2dd2d1d1.png](<screens/06_sc_c226d7f45ba246fb99a4debc2dd2d1d1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 041, 고유 이미지 S162, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_bb64d1812ba64baca74a6791334b5540` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우측 테마선택그리드가 Overview/Style설정으로 복귀.
- 입력 항목·필수 표시·기본값: Theme Cover,Font Brawler,Border Width1, 만료Feb22,금액5255.
- 버튼·메뉴·안내 문구: Theme 재선택·색/폭·글꼴·Send Proposal.
- 확인된 상태: 스타일 편집 종료 상태.
- 단계 간 변화: Finish Styling 후 일반 Style 패널로 복귀한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: Cover선택이 일반설정에 반영됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버저장/새로고침 지속성·Undo 미수록.

#### 모델링 영향

- 후보와 근거: 표현 설정 적용 상태 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 서버저장/새로고침 지속성·Undo 미수록. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 테마 수정 전. Changes Saved 표시. — Drafted5255, Single Option, Expiration Feb22 2024, Theme Classic, Border Width1, Brawler. | 만료 설정 과정은 다른 흐름,현재 이미지로 재구성하지 않음. |
| 02 | 테마 선택 패널. — Cover,Classic선택,Alpine,Splash,Auburn,Pastel,Aerial,Misty. | 키보드 선택·선택즉시저장·테마별 기본값 미확인. |
| 03 | 스타일 미리보기 변경. — 문서명 Creative Design Brief 유지. | 배경이 테마 기본값으로 바뀌는 정확 규칙·사용자 파일 영향 미확인. |
| 04 | 본문 템플릿 placeholder가 아직 치환되지 않은 편집 상태. — Total5255USD. [Company Name]/[Website]/[Email Address]/[Phone Number] 문자열이 본문에 남음. | 이 대괄호 문자열이 자동변수인지 단순 안내문인지 미확인. |
| 05 | Cover 선택 중. — 제목/수신자 유지. 발신주소가 보이고 Client Address placeholder. | 테마 전환이 본문전역색/폰트를 바꿨는지 전체비교 필요. |
| 06 | 스타일 편집 종료 상태. — Theme Cover,Font Brawler,Border Width1, 만료Feb22,금액5255. | 서버저장/새로고침 지속성·Undo 미수록. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

Classic→Splash→Cover 순서로 배경과 제목·로고 배치가 바뀐다. 마지막 일반 패널의 Theme은 Cover다. 본문 하단에는 [Company Name] 같은 미치환 문자열이 남고 Total 5,255가 표시된다. 스타일 변경을 내용 작성 완료로 보지 않는다.

### 업무 규칙과 연결 시 주의점

- [관찰] 테마 선택은 배치뿐 아니라 예시 배경 이미지도 바꾸는 모습이다. 사용자 업로드 이미지 보존 정책은 미확인.
- [관찰] 금액5255, 수신자와 문서명·만료일은 유지된다.
- [관찰] Finish Styling은 스타일 선택 패널을 닫지만 별도 서버 저장 시점은 보이지 않는다.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [Documents API](https://docs.hellobonsai.com/api/tag/documents): R2 본문 대조 기록(S029). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): R2 본문 대조 기록(S031). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [배경·테마 도움말](https://help.hellobonsai.com/en/articles/2880183-adding-your-background-to-proposals-and-invoices): R2 본문 대조 기록(S034). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 헤더 테마 ID·배경 미디어·로고·레이아웃·기본 색과 글로벌 글꼴을 조합하는 후보.
- 문서 업무 데이터와 표현 스타일의 분리 후보. 테마 전환이 내용을 삭제하는지 별도 확인.

### 단계별 모델링 근거

- 단계 01: 문서 내용·만료·표현 설정 분리 후보.
- 단계 02: 테마 식별자와 선택 상태 후보.
- 단계 03: 테마별 표지높이·배경·제목위치 후보.
- 단계 04: 문서 리치텍스트와 실제 구조화 필드 구분 후보.
- 단계 05: Cover표현 구성과 업무데이터 분리 후보.
- 단계 06: 표현 설정 적용 상태 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 테마 변경 후 직접 지정한 색·글꼴·이미지의 유지/초기화 우선순위를 확인한다. Undo·미저장 닫기·모바일/인쇄 페이지 나눔을 확인한다.

- 테마 변경 후 직접 지정한 색·글꼴·이미지의 유지/초기화 우선순위를 확인한다.
- Undo·미저장 닫기·모바일/인쇄 페이지 나눔을 확인한다.

### 단계별 미확인 사항

- 단계 01: 만료 설정 과정은 다른 흐름,현재 이미지로 재구성하지 않음.
- 단계 02: 키보드 선택·선택즉시저장·테마별 기본값 미확인.
- 단계 03: 배경이 테마 기본값으로 바뀌는 정확 규칙·사용자 파일 영향 미확인.
- 단계 04: 이 대괄호 문자열이 자동변수인지 단순 안내문인지 미확인.
- 단계 05: 테마 전환이 본문전역색/폰트를 바꿨는지 전체비교 필요.
- 단계 06: 서버저장/새로고침 지속성·Undo 미수록.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **결과**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 테마별 배치 변경 시 금액·문서 상태를 유지한다. 직접 지정한 색·이미지 보존, 미저장 취소·인쇄 차이를 별도 정한다.
- [이 흐름의 보완표](<../../../FLOW_REVIEW_MATRIX.md#flow-5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0>)와 [공통 웹 상태·연결 기준](<../../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 6단계 ID·순서·원본 URL 재조회 및 이미지 6/6단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 6단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 0/6단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |

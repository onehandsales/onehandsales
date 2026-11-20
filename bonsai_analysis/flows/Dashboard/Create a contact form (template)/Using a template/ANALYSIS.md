# Using a template 플로우 분석

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **5/5단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **0/5단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../../../FLOW_REVIEW_MATRIX.md#flow-0888ad18-25b5-43aa-be17-ae21f1859ea0>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `0888ad18-25b5-43aa-be17-ae21f1859ea0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=0888ad18-25b5-43aa-be17-ae21f1859ea0) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 5단계 / 5단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

Graphic Design Brief 템플릿을 미리 보고 편집 가능한 폼으로 생성한다.

- Design분류결과에서시작해Forms/Create편집기로끝난다.
- 폼수신자·프로젝트 선택은 이 생성 흐름에 없고 공유 단계에서 별도로 등장한다.

- 상위 흐름: [Create a contact form (template)](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Create a contact form (template)/Using a template`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **Design 템플릿 결과**이다. 10개실제템플릿과BlankForm으로좁혀진다. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **폼 편집기 상단**이다. Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Create a contact form (template)](<../ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_5c0dd427af8c4322a5b020f642a73774`](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Design 템플릿 결과](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>) | 템플릿 카드 hover — 미리보기 진입 제어가 카드 위에 나타난다. |
| 02 | [`sc_559f0944133b4c8fb66738d23390e845`](https://gummble.com/screens/sc_559f0944133b4c8fb66738d23390e845?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 카드 hover](<screens/02_sc_559f0944133b4c8fb66738d23390e845.png>) | Graphic Design Brief 미리보기 — 이름·이메일에는 이 뷰포트상 별표 없고 업무 질문에는 있다. |
| 03 | [`sc_6a141ad793ab4918935cec01018afe3b`](https://gummble.com/screens/sc_6a141ad793ab4918935cec01018afe3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Graphic Design Brief 미리보기](<screens/03_sc_6a141ad793ab4918935cec01018afe3b.png>) | 템플릿 적용 처리 — 생성처리중간상태. |
| 04 | [`sc_f5e4119741464cbc8bbac0dd3b4f0d55`](https://gummble.com/screens/sc_f5e4119741464cbc8bbac0dd3b4f0d55?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 적용 처리](<screens/04_sc_f5e4119741464cbc8bbac0dd3b4f0d55.png>) | 폼 편집기 상단 — Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인. |
| 05 | [`sc_56bf12a78bd64f6b972ecb048efd8d14`](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 편집기 상단](<screens/05_sc_56bf12a78bd64f6b972ecb048efd8d14.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — Design 템플릿 결과

- Screen ID: `sc_5c0dd427af8c4322a5b020f642a73774`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/33a6a088-5838-46fa-91f9-f0d01f316148.png)
- 로컬 이미지: [01_sc_5c0dd427af8c4322a5b020f642a73774.png](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 065, 고유 이미지 S259, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_559f0944133b4c8fb66738d23390e845`

#### 화면에서 직접 확인한 내용

- 레이아웃: Industry Design10선택,3열결과.
- 입력 항목·필수 표시·기본값: BlankForm+CreativeIntakeForm,DesignClientQuestionnaire,GraphicDesignBrief,GraphicDesignClientQuestionnaire,GraphicDesignintakeform,InteriorDesignClientQuestionnaire,LogoDesignBrief,LogoQuestionnaire,WebDesignClientQuestionnaire,WebsiteDesignForm.
- 버튼·메뉴·안내 문구: UseTemplate,검색,다른분류,닫기.
- 확인된 상태: 10개실제템플릿과BlankForm으로좁혀진다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 필터적용 결과확인. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인.

#### 모델링 영향

- 후보와 근거: 템플릿-산업분류 관계후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 템플릿 카드 hover

- Screen ID: `sc_559f0944133b4c8fb66738d23390e845`
- 원본: [화면 페이지](https://gummble.com/screens/sc_559f0944133b4c8fb66738d23390e845?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6e981849-8c8c-4d1f-8ac9-c2e7f615d7a6.png)
- 로컬 이미지: [02_sc_559f0944133b4c8fb66738d23390e845.png](<screens/02_sc_559f0944133b4c8fb66738d23390e845.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 066, 고유 이미지 S262, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5c0dd427af8c4322a5b020f642a73774` → 현재 → `sc_6a141ad793ab4918935cec01018afe3b`

#### 화면에서 직접 확인한 내용

- 레이아웃: GraphicDesignBrief카드에그림자·Preview링크.
- 입력 항목·필수 표시·기본값: Design10결과유지.
- 버튼·메뉴·안내 문구: Preview,UseTemplate,검색/분류.
- 확인된 상태: 미리보기 진입 제어가 카드 위에 나타난다.
- 단계 간 변화: GraphicDesignBrief카드를가리킨다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 선택전탐색상태. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭영역/키보드접근미확인.

#### 모델링 영향

- 후보와 근거: 카드hover와생성명령구분. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 클릭영역/키보드접근미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Graphic Design Brief 미리보기

- Screen ID: `sc_6a141ad793ab4918935cec01018afe3b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6a141ad793ab4918935cec01018afe3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/275e0161-2786-4eb8-991f-d6466f13cdf2.png)
- 로컬 이미지: [03_sc_6a141ad793ab4918935cec01018afe3b.png](<screens/03_sc_6a141ad793ab4918935cec01018afe3b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 066, 고유 이미지 S263, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_559f0944133b4c8fb66738d23390e845` → 현재 → `sc_f5e4119741464cbc8bbac0dd3b4f0d55`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체미리보기.상단AllTemplates/Previewing/UseTemplate/X,중앙브랜드배경+폼.
- 입력 항목·필수 표시·기본값: 제목/설명,FirstName/LastName/Email회색예시,웹사이트질문*/사업명질문*;하단제작물질문*일부.
- 버튼·메뉴·안내 문구: AllTemplates,UseTemplate,X,스크롤.
- 확인된 상태: 이름·이메일에는 이 뷰포트상 별표 없고 업무 질문에는 있다.
- 단계 간 변화: Preview로미리보기를연다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 템플릿의 공개 표현 미리보기. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체질문·답변제출/편집가능여부는미확인.

#### 모델링 영향

- 후보와 근거: 템플릿질문필수설정·미리보기 렌더링 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 전체질문·답변제출/편집가능여부는미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 템플릿 적용 처리

- Screen ID: `sc_f5e4119741464cbc8bbac0dd3b4f0d55`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f5e4119741464cbc8bbac0dd3b4f0d55?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0eb2f6bc-f947-40f6-be01-458ad59b122c.png)
- 로컬 이미지: [04_sc_f5e4119741464cbc8bbac0dd3b4f0d55.png](<screens/04_sc_f5e4119741464cbc8bbac0dd3b4f0d55.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 066, 고유 이미지 S264, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6a141ad793ab4918935cec01018afe3b` → 현재 → `sc_56bf12a78bd64f6b972ecb048efd8d14`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은미리보기,UseTemplate버튼옅어짐·상단초록진행선.
- 입력 항목·필수 표시·기본값: 폼내용유지.
- 버튼·메뉴·안내 문구: 비활성/처리중으로보이는UseTemplate,AllTemplates,X.
- 확인된 상태: 생성처리중간상태.
- 단계 간 변화: UseTemplate을실행한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 다음 편집기 화면이 적용 결과 근거다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한네트워크/실패/중복방지미확인.

#### 모델링 영향

- 후보와 근거: 생성 중 상태와 중복 실행 방지 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 정확한네트워크/실패/중복방지미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 폼 편집기 상단

- Screen ID: `sc_56bf12a78bd64f6b972ecb048efd8d14`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cffd3242-bc9f-4d5b-89c4-617f504f36b3.png)
- 로컬 이미지: [05_sc_56bf12a78bd64f6b972ecb048efd8d14.png](<screens/05_sc_56bf12a78bd64f6b972ecb048efd8d14.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 067, 고유 이미지 S265, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f5e4119741464cbc8bbac0dd3b4f0d55` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Forms/Create/Responses 및 작업 버튼. 왼쪽 배경 헤더+흰 폼 카드, 오른쪽 Content/Settings 패널.
- 입력 항목·필수 표시·기본값: Graphic Design Brief 제목/설명, Add An Image; First Name/Last Name(회색 Jane/Smith), Email(예시 이메일), 사업 웹사이트 URL 질문.
- 버튼·메뉴·안내 문구: Preview, Automation, Share Form, …; Content 타입: Short/Long Text, Number, Single/Multiple Choice, Date Select, Custom Content, Files Download/Upload, Dropdown, Star Rating, Website.
- 확인된 상태: Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인.
- 단계 간 변화: 처리 후 폼 편집기로 이동한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 폼 정의 편집 화면이며 응답은 아직 입력되지 않았다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 화면 아래 타입·Settings 내용·제목 편집 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 연락처 영역·일반 질문·콘텐츠 요소·브랜드 설정 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 화면 아래 타입·Settings 내용·제목 편집 방식은 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 10개실제템플릿과BlankForm으로좁혀진다. — BlankForm+CreativeIntakeForm,DesignClientQuestionnaire,GraphicDesignBrief,GraphicDesignClientQuestionnaire,GraphicDesignintakeform,InteriorDesignClientQuestionnaire,LogoDesignBrief,LogoQuestionnaire,WebDesignClientQuestionnaire,WebsiteDesignForm. | 각 템플릿 필드 구성과 버전은 선택미리보기전미확인. |
| 02 | 미리보기 진입 제어가 카드 위에 나타난다. — Design10결과유지. | 클릭영역/키보드접근미확인. |
| 03 | 이름·이메일에는 이 뷰포트상 별표 없고 업무 질문에는 있다. — 제목/설명,FirstName/LastName/Email회색예시,웹사이트질문*/사업명질문*;하단제작물질문*일부. | 전체질문·답변제출/편집가능여부는미확인. |
| 04 | 생성처리중간상태. — 폼내용유지. | 정확한네트워크/실패/중복방지미확인. |
| 05 | Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인. — Graphic Design Brief 제목/설명, Add An Image; First Name/Last Name(회색 Jane/Smith), Email(예시 이메일), 사업 웹사이트 URL 질문. | 화면 아래 타입·Settings 내용·제목 편집 방식은 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

Graphic Design Brief의 Preview·Use Template을 구분한다. 미리보기의 업무 질문에는 별표가 있으나 이름·이메일에는 이 뷰포트상 별표가 없다. 적용 버튼이 옅어진 중간 상태 후 Content 편집기로 이동하며 실제 응답 제출과는 다른 단계다.

### 업무 규칙과 연결 시 주의점

- [관찰]카드의Preview와UseTemplate은다른행동이다.
- [관찰]미리보기에는웹사이트/사업명 질문 별표가 있지만 생성 편집기에는 동일 표시가 없다.후속 공개 응답 폼에서도 일부 별표가 없어 미수록 필수 설정 변경 가능성을 남긴다.
- [관찰]UseTemplate처리 중 버튼이 옅어지고 상단 진행선이 보인다.
- [미확인]폼ID생성시점·저장완료·공개 게시 기본값은 정적 이미지만으로 확정하지 않는다.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [Templates API](https://docs.hellobonsai.com/api/tag/templates): R2 본문 대조 기록(S032). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): R2 본문 대조 기록(S045). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 템플릿 정의와 복사된 폼 정의·질문/스타일스냅샷·생성원천참조 후보.

### 단계별 모델링 근거

- 단계 01: 템플릿-산업분류 관계후보.
- 단계 02: 카드hover와생성명령구분.
- 단계 03: 템플릿질문필수설정·미리보기 렌더링 후보.
- 단계 04: 생성 중 상태와 중복 실행 방지 후보.
- 단계 05: 연락처 영역·일반 질문·콘텐츠 요소·브랜드 설정 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 템플릿 필수값과 생성 후 질문 설정의 차이·템플릿업데이트전파·중복생성을확인한다. 미리보기입력/Submit이실제응답을만드는지,생성취소/오류재시도를확인한다.

- 템플릿 필수값과 생성 후 질문 설정의 차이·템플릿업데이트전파·중복생성을확인한다.
- 미리보기입력/Submit이실제응답을만드는지,생성취소/오류재시도를확인한다.

### 단계별 미확인 사항

- 단계 01: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인.
- 단계 02: 클릭영역/키보드접근미확인.
- 단계 03: 전체질문·답변제출/편집가능여부는미확인.
- 단계 04: 정확한네트워크/실패/중복방지미확인.
- 단계 05: 화면 아래 타입·Settings 내용·제목 편집 방식은 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **부분**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 미리보기와 편집기 생성 상태를 나눈다. 템플릿 필수값 차이를 보존하고 중복 클릭·생성 취소·게시 기본값을 미정으로 둔다.
- [이 흐름의 보완표](<../../../../FLOW_REVIEW_MATRIX.md#flow-0888ad18-25b5-43aa-be17-ae21f1859ea0>)와 [공통 웹 상태·연결 기준](<../../../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 5단계 ID·순서·원본 URL 재조회 및 이미지 5/5단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 5단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 0/5단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |

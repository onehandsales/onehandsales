# Searching templates 플로우 분석

검토 상태: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b3dc7ca0-f03d-4a87-b0e2-84c08aa27400` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b3dc7ca0-f03d-4a87-b0e2-84c08aa27400) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 3단계 / 3단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | 2026-11-20 KST 조회. 6절에서 기능별 직접 대조 범위·미확인 범위 및 [공통 출처](<../../../../SOURCES.md>) 연결 |
| 원본·문서 무결성 | MCP 단계 ID·순서·원본 URL 대조, 로컬 PNG 디코딩·크기·CDN 원본과 SHA-256 대조. [전체 검토 기록](<../../../../review/2026-11-20/REPORT.md>) |

## 2. 플로우 목적과 연결

폼 템플릿 라이브러리에서 이름 검색으로 결과를 좁힌다.

- Design분류 결과에서시작,Type탭으로 바꾼뒤application을 검색한다.

- 상위 흐름: [Create a contact form (template)](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Create a contact form (template)/Searching templates`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **Design 템플릿 결과**이다. 10개실제템플릿과BlankForm으로좁혀진다. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **application 검색 결과**이다. 실제검색결과1개가2분류에집계된다. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Create a contact form (template)](<../ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_5c0dd427af8c4322a5b020f642a73774`](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Design 템플릿 결과](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>) | Type 전환 후 중간 결과 — 선택 분류 표시와 카드 집합의 관계가 명확하지 않다. |
| 02 | [`sc_466e5e8430564c069f3186232841c1e5`](https://gummble.com/screens/sc_466e5e8430564c069f3186232841c1e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Type 전환 후 중간 결과](<screens/02_sc_466e5e8430564c069f3186232841c1e5.png>) | application 검색 결과 — 실제검색결과1개가2분류에집계된다. |
| 03 | [`sc_533e22603d0a48f48865973f027d58c6`](https://gummble.com/screens/sc_533e22603d0a48f48865973f027d58c6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [application 검색 결과](<screens/03_sc_533e22603d0a48f48865973f027d58c6.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — Design 템플릿 결과

- Screen ID: `sc_5c0dd427af8c4322a5b020f642a73774`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/33a6a088-5838-46fa-91f9-f0d01f316148.png)
- 로컬 이미지: [01_sc_5c0dd427af8c4322a5b020f642a73774.png](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 065, 고유 이미지 S259, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_466e5e8430564c069f3186232841c1e5`

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

### 단계 02 — Type 전환 후 중간 결과

- Screen ID: `sc_466e5e8430564c069f3186232841c1e5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_466e5e8430564c069f3186232841c1e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cd4faa77-f371-4f68-bfed-c055b8a1899c.png)
- 로컬 이미지: [02_sc_466e5e8430564c069f3186232841c1e5.png](<screens/02_sc_466e5e8430564c069f3186232841c1e5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 065, 고유 이미지 S260, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5c0dd427af8c4322a5b020f642a73774` → 현재 → `sc_533e22603d0a48f48865973f027d58c6`

#### 화면에서 직접 확인한 내용

- 레이아웃: Type탭/AllTemplates95선택,오른쪽은기존디자인카드.
- 입력 항목·필수 표시·기본값: 검색어없음;디자인10개와BlankForm유지.
- 버튼·메뉴·안내 문구: 검색,Type분류,Industry,UseTemplate.
- 확인된 상태: 선택 분류 표시와 카드 집합의 관계가 명확하지 않다.
- 단계 간 변화: Type탭으로 전환한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 탭 전환 중간 상태를 기록한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 갱신지연/산업필터잔존 여부미확인.

#### 모델링 영향

- 후보와 근거: 검색/분류 UI 상태동기화 검토. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 갱신지연/산업필터잔존 여부미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — application 검색 결과

- Screen ID: `sc_533e22603d0a48f48865973f027d58c6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_533e22603d0a48f48865973f027d58c6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8171a739-a3cc-46f3-872e-8ce8923a3ab6.png)
- 로컬 이미지: [03_sc_533e22603d0a48f48865973f027d58c6.png](<screens/03_sc_533e22603d0a48f48865973f027d58c6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 066, 고유 이미지 S261, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_466e5e8430564c069f3186232841c1e5` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 검색창에application,오른쪽2카드.
- 입력 항목·필수 표시·기본값: AllTemplates1,ClientOnboarding1,ClientIntake1;BlankForm+ClientApplication.
- 버튼·메뉴·안내 문구: 검색X,분류,UseTemplate,닫기.
- 확인된 상태: 실제검색결과1개가2분류에집계된다.
- 단계 간 변화: 검색창에application을입력한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 검색결과와facet수변경확인. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색필드/일치방식/다른0건분류숨김정책미확인.

#### 모델링 영향

- 후보와 근거: 다중카테고리와검색집계 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 검색필드/일치방식/다른0건분류숨김정책미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 10개실제템플릿과BlankForm으로좁혀진다. — BlankForm+CreativeIntakeForm,DesignClientQuestionnaire,GraphicDesignBrief,GraphicDesignClientQuestionnaire,GraphicDesignintakeform,InteriorDesignClientQuestionnaire,LogoDesignBrief,LogoQuestionnaire,WebDesignClientQuestionnaire,WebsiteDesignForm. | 각 템플릿 필드 구성과 버전은 선택미리보기전미확인. |
| 02 | 선택 분류 표시와 카드 집합의 관계가 명확하지 않다. — 검색어없음;디자인10개와BlankForm유지. | 갱신지연/산업필터잔존 여부미확인. |
| 03 | 실제검색결과1개가2분류에집계된다. — AllTemplates1,ClientOnboarding1,ClientIntake1;BlankForm+ClientApplication. | 검색필드/일치방식/다른0건분류숨김정책미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

application 검색은 All Templates 1·Client Onboarding 1·Client Intake 1과 Client Application 카드 하나를 보여 준다. Blank Form은 별도로 남는다. Type 전환 직후 디자인 카드가 남는 이유는 필터 유지·갱신 지연 중 어느 쪽인지 미확인이다.

### 업무 규칙과 연결 시 주의점

- [관찰]Type All95표시인데 디자인 카드가 남아 있는 중간 화면이 있다.필터 유지인지 갱신 전인지 미확인.
- [관찰]검색후All1/ClientOnboarding1/ClientIntake1로 같은 결과가 여러 분류에 집계된다.
- [관찰]검색결과1개와별도로BlankForm카드가남는다.

## 6. 공식 도움말과 API 대조

공식 자료는 **2026-11-20 KST** 조회한 현재 문서이며 과거 캡처와 시점이 다를 수 있다. 아래 출처의 제한된 범위를 대조했고, 실제 계정이나 내부 API를 실행하지 않았다.

- [Templates API](https://docs.hellobonsai.com/api/tag/templates): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S032 공통 대조](<../../../../SOURCES.md#s032>)에 기록했다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../../SOURCES.md#api>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 검색어·필터축·페이지 상태와 템플릿 다중 분류·동적facet카운트 후보.

### 단계별 모델링 근거

- 단계 01: 템플릿-산업분류 관계후보.
- 단계 02: 검색/분류 UI 상태동기화 검토.
- 단계 03: 다중카테고리와검색집계 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 검색대상필드·부분일치/대소문자·디바운스·빈검색결과·초기화X동작을확인한다. 산업필터유지여부와Type탭전환시표시불일치를 실제조작으로검증한다.

- 검색대상필드·부분일치/대소문자·디바운스·빈검색결과·초기화X동작을확인한다.
- 산업필터유지여부와Type탭전환시표시불일치를 실제조작으로검증한다.

### 단계별 미확인 사항

- 단계 01: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인.
- 단계 02: 갱신지연/산업필터잔존 여부미확인.
- 단계 03: 검색필드/일치방식/다른0건분류숨김정책미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 3단계 ID·순서·원본 URL 재조회 및 이미지 3/3단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. [검토 기록](<../../../../review/2026-11-20/REPORT.md>) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |

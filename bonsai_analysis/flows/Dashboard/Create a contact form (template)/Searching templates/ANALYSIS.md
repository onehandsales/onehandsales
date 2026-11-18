# Searching templates 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b3dc7ca0-f03d-4a87-b0e2-84c08aa27400` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b3dc7ca0-f03d-4a87-b0e2-84c08aa27400) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

폼 템플릿 라이브러리에서 이름 검색으로 결과를 좁힌다.

- Design분류 결과에서시작,Type탭으로 바꾼뒤application을 검색한다.

- 상위 분석: [Create a contact form (template)](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Create a contact form (template)/Searching templates`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_5c0dd427af8c4322a5b020f642a73774`](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Design 템플릿 결과](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>) | Type탭으로 전환한다. |
| 02 | [`sc_466e5e8430564c069f3186232841c1e5`](https://gummble.com/screens/sc_466e5e8430564c069f3186232841c1e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Type 전환 후 중간 결과](<screens/02_sc_466e5e8430564c069f3186232841c1e5.png>) | 검색창에application을입력한다. |
| 03 | [`sc_533e22603d0a48f48865973f027d58c6`](https://gummble.com/screens/sc_533e22603d0a48f48865973f027d58c6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [application 검색 결과](<screens/03_sc_533e22603d0a48f48865973f027d58c6.png>) | ClientApplication1개와 관련 분류 카운트를 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — Design 템플릿 결과

- Screen ID: `sc_5c0dd427af8c4322a5b020f642a73774`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/33a6a088-5838-46fa-91f9-f0d01f316148.png)
- 로컬 이미지: [01_sc_5c0dd427af8c4322a5b020f642a73774.png](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_466e5e8430564c069f3186232841c1e5`

#### 화면에서 직접 확인한 내용

- 레이아웃: Industry Design10선택,3열결과.
- 입력 항목·필수 표시·기본값: BlankForm+CreativeIntakeForm,DesignClientQuestionnaire,GraphicDesignBrief,GraphicDesignClientQuestionnaire,GraphicDesignintakeform,InteriorDesignClientQuestionnaire,LogoDesignBrief,LogoQuestionnaire,WebDesignClientQuestionnaire,WebsiteDesignForm.
- 버튼·메뉴·안내 문구: UseTemplate,검색,다른분류,닫기.
- 확인된 상태: 10개실제템플릿과BlankForm으로좁혀진다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 필터적용 결과확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인.

#### 모델링 영향

- 후보와 근거: 템플릿-산업분류 관계후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Type 전환 후 중간 결과

- Screen ID: `sc_466e5e8430564c069f3186232841c1e5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_466e5e8430564c069f3186232841c1e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cd4faa77-f371-4f68-bfed-c055b8a1899c.png)
- 로컬 이미지: [02_sc_466e5e8430564c069f3186232841c1e5.png](<screens/02_sc_466e5e8430564c069f3186232841c1e5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5c0dd427af8c4322a5b020f642a73774` → 현재 → `sc_533e22603d0a48f48865973f027d58c6`

#### 화면에서 직접 확인한 내용

- 레이아웃: Type탭/AllTemplates95선택,오른쪽은기존디자인카드.
- 입력 항목·필수 표시·기본값: 검색어없음;디자인10개와BlankForm유지.
- 버튼·메뉴·안내 문구: 검색,Type분류,Industry,UseTemplate.
- 확인된 상태: 선택 분류 표시와 카드 집합의 관계가 명확하지 않다.
- 단계 간 변화: Type탭으로 전환한다.

#### 동작과 데이터

- 화면 관찰: 탭 전환 중간 상태를 기록한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 갱신지연/산업필터잔존 여부미확인.

#### 모델링 영향

- 후보와 근거: 검색/분류 UI 상태동기화 검토.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — application 검색 결과

- Screen ID: `sc_533e22603d0a48f48865973f027d58c6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_533e22603d0a48f48865973f027d58c6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8171a739-a3cc-46f3-872e-8ce8923a3ab6.png)
- 로컬 이미지: [03_sc_533e22603d0a48f48865973f027d58c6.png](<screens/03_sc_533e22603d0a48f48865973f027d58c6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_466e5e8430564c069f3186232841c1e5` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 검색창에application,오른쪽2카드.
- 입력 항목·필수 표시·기본값: AllTemplates1,ClientOnboarding1,ClientIntake1;BlankForm+ClientApplication.
- 버튼·메뉴·안내 문구: 검색X,분류,UseTemplate,닫기.
- 확인된 상태: 실제검색결과1개가2분류에집계된다.
- 단계 간 변화: 검색창에application을입력한다.

#### 동작과 데이터

- 화면 관찰: 검색결과와facet수변경확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색필드/일치방식/다른0건분류숨김정책미확인.

#### 모델링 영향

- 후보와 근거: 다중카테고리와검색집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰]Type All95표시인데 디자인 카드가 남아 있는 중간 화면이 있다.필터 유지인지 갱신 전인지 미확인.
- [관찰]검색후All1/ClientOnboarding1/ClientIntake1로 같은 결과가 여러 분류에 집계된다.
- [관찰]검색결과1개와별도로BlankForm카드가남는다.

## 6. 공식 도움말과 API 대조

- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 검색어·필터축·페이지 상태와 템플릿 다중 분류·동적facet카운트 후보.

## 8. 미확인 사항과 검토 질문

- 검색대상필드·부분일치/대소문자·디바운스·빈검색결과·초기화X동작을확인한다.
- 산업필터유지여부와Type탭전환시표시불일치를 실제조작으로검증한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

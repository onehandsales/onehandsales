# Filtering contact templates 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `71620f3c-7759-4c18-8fa3-164e3d3e2256` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=71620f3c-7759-4c18-8fa3-164e3d3e2256) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

템플릿 페이지를 이동하고 Industry의 Design 분류로 결과를 좁힌다.

- All Templates95에서 시작해 Design10으로 끝난다.현재 결과와 전체카테고리 집계가 같이 표시된다.

- 상위 분석: [Create a contact form (template)](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Create a contact form (template)/Filtering contact templates`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_06356cc9ef5248f49522f1a427901e56`](https://gummble.com/screens/sc_06356cc9ef5248f49522f1a427901e56?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 템플릿 목록 로드 완료](<screens/01_sc_06356cc9ef5248f49522f1a427901e56.png>) | 전체목록2페이지로 이동한다. |
| 02 | [`sc_f06a992826234fddae83f7b121e5d0f9`](https://gummble.com/screens/sc_f06a992826234fddae83f7b121e5d0f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿2페이지](<screens/02_sc_f06a992826234fddae83f7b121e5d0f9.png>) | Industry 탭으로 전환한다. |
| 03 | [`sc_dbfeaa676dde4d26882ba97ee5c939b7`](https://gummble.com/screens/sc_dbfeaa676dde4d26882ba97ee5c939b7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Industry 분류 목록](<screens/03_sc_dbfeaa676dde4d26882ba97ee5c939b7.png>) | Design 분류를 선택한다. |
| 04 | [`sc_5c0dd427af8c4322a5b020f642a73774`](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Design 템플릿 결과](<screens/04_sc_5c0dd427af8c4322a5b020f642a73774.png>) | 디자인 관련10개템플릿과BlankForm을 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — 폼 템플릿 목록 로드 완료

- Screen ID: `sc_06356cc9ef5248f49522f1a427901e56`
- 원본: [화면 페이지](https://gummble.com/screens/sc_06356cc9ef5248f49522f1a427901e56?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6678b639-467a-41c6-9a13-4052b1ec0732.png)
- 로컬 이미지: [01_sc_06356cc9ef5248f49522f1a427901e56.png](<screens/01_sc_06356cc9ef5248f49522f1a427901e56.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f06a992826234fddae83f7b121e5d0f9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열×4행 카드와좌측필터.
- 입력 항목·필수 표시·기본값: BlankForm,AcupunctureIntakeForm,ArchitectClientQuestionnaire,BodyContouringIntakeForm,BrandQuestionnaire,BusinessIntake,BusinessPartnershipQuesti… ,BusinessQuestionnaire,ChairMassageIntakeForm,ChiropracticIntakeForm,ClientApplication,ClientAttestation.각썸네일표시.
- 버튼·메뉴·안내 문구: 검색,Type/Industry,UseTemplate,닫기.
- 확인된 상태: 회색영역이 실제미리보기로채워진다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 목록 이미지 로드 완료.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잘린제목전체·다음페이지는 별도검토.

#### 모델링 영향

- 후보와 근거: 템플릿표시명·미리보기자산·페이지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 템플릿2페이지

- Screen ID: `sc_f06a992826234fddae83f7b121e5d0f9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f06a992826234fddae83f7b121e5d0f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0db423e8-f501-4d2d-b3a5-ea74a1f7ad07.png)
- 로컬 이미지: [02_sc_f06a992826234fddae83f7b121e5d0f9.png](<screens/02_sc_f06a992826234fddae83f7b121e5d0f9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_06356cc9ef5248f49522f1a427901e56` → 현재 → `sc_dbfeaa676dde4d26882ba97ee5c939b7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 목록하단과페이지네이션,Type All선택.
- 입력 항목·필수 표시·기본값: BlankForm,ClientBillingForm,ClientBookingForm,ClientBrief,ClientComplaint,ClientConfidentiality,ClientConsultation,ClientEnrolment,ClientFeedback,ClientInfo,ClientIntake,ClientOnboarding.2페이지선택.
- 버튼·메뉴·안내 문구: Previous,1,2,3,…7,8,9,Next;UseTemplate.
- 확인된 상태: 페이지2에서도BlankForm이 반복된다.
- 단계 간 변화: 전체목록2페이지로 이동한다.

#### 동작과 데이터

- 화면 관찰: 페이지단위템플릿조회 결과.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: BlankForm이95집계에 포함되는지는 검색결과와대조한다.

#### 모델링 영향

- 후보와 근거: 특수CTA와 실제결과 목록 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Industry 분류 목록

- Screen ID: `sc_dbfeaa676dde4d26882ba97ee5c939b7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dbfeaa676dde4d26882ba97ee5c939b7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/025baab2-58f8-4dd9-884e-2a2dd0295c0f.png)
- 로컬 이미지: [03_sc_dbfeaa676dde4d26882ba97ee5c939b7.png](<screens/03_sc_dbfeaa676dde4d26882ba97ee5c939b7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f06a992826234fddae83f7b121e5d0f9` → 현재 → `sc_5c0dd427af8c4322a5b020f642a73774`

#### 화면에서 직접 확인한 내용

- 레이아웃: Industry탭선택,전체목록1페이지카드로복귀.
- 입력 항목·필수 표시·기본값: All95;Beauty&Self-Care13,Health11,Design10,Marketing9,Coaching5,Accounting&Finance4,Photography4,Legal4,Consulting2,Architecture2,RealEstate2,Development2,EventPlanning2,Other16.
- 버튼·메뉴·안내 문구: Industry분류,Type,검색,UseTemplate.
- 확인된 상태: 분류축 변경으로 왼쪽항목이바뀐다.
- 단계 간 변화: Industry 탭으로 전환한다.

#### 동작과 데이터

- 화면 관찰: 산업별목록탐색.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다중분류/집계범위 및추가분류 미확인.

#### 모델링 영향

- 후보와 근거: 분류축별메타데이터 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Design 템플릿 결과

- Screen ID: `sc_5c0dd427af8c4322a5b020f642a73774`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/33a6a088-5838-46fa-91f9-f0d01f316148.png)
- 로컬 이미지: [04_sc_5c0dd427af8c4322a5b020f642a73774.png](<screens/04_sc_5c0dd427af8c4322a5b020f642a73774.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_dbfeaa676dde4d26882ba97ee5c939b7` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Industry Design10선택,3열결과.
- 입력 항목·필수 표시·기본값: BlankForm+CreativeIntakeForm,DesignClientQuestionnaire,GraphicDesignBrief,GraphicDesignClientQuestionnaire,GraphicDesignintakeform,InteriorDesignClientQuestionnaire,LogoDesignBrief,LogoQuestionnaire,WebDesignClientQuestionnaire,WebsiteDesignForm.
- 버튼·메뉴·안내 문구: UseTemplate,검색,다른분류,닫기.
- 확인된 상태: 10개실제템플릿과BlankForm으로좁혀진다.
- 단계 간 변화: Design 분류를 선택한다.

#### 동작과 데이터

- 화면 관찰: 필터적용 결과확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인.

#### 모델링 영향

- 후보와 근거: 템플릿-산업분류 관계후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰]2페이지에도BlankForm카드가 맨앞에 있다.
- [관찰]Type/Industry는 서로 다른 분류 축이다.전환시 필터유지/교집합정책은 추가확인 필요.
- [관찰]Design10에 실제템플릿10개+BlankForm이 보인다.

## 6. 공식 도움말과 API 대조

- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.
- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 폼 템플릿 분류/페이지 산식은 해당 도움말에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 템플릿-분류의복수관계,분류축,검색/필터 집계,BlankForm 특수CTA 후보.

## 8. 미확인 사항과 검토 질문

- 필터조합·탭전환초기화·페이지크기·정렬·검색과카운트범위를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

# Create a contact form (template) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `be21a04b-0006-4c0c-86bd-4a536d9e7c71` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=be21a04b-0006-4c0c-86bd-4a536d9e7c71) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

온보딩에서 빈 폼 또는 템플릿 기반 생성 경로를 선택하고 폼 템플릿 라이브러리에 진입한다.

- 시작은 예약 유형 목록이며 이후 Dashboard의 폼 온보딩으로 이동한다.
- 상위 흐름 종료는 템플릿 선택 화면이다. 실제 폼 생성은 Using a template 하위 흐름에서 확인한다.

- 상위 분석: [Dashboard](../ANALYSIS.md)
- 하위 플로우: [Using a template](Using%20a%20template/ANALYSIS.md), [Filtering contact templates](Filtering%20contact%20templates/ANALYSIS.md), [Searching templates](Searching%20templates/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Create a contact form (template)`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_529048e78b304f66937c84b12cbc8a07`](https://gummble.com/screens/sc_529048e78b304f66937c84b12cbc8a07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [생성된 유형 목록](<screens/01_sc_529048e78b304f66937c84b12cbc8a07.png>) | Dashboard로 이동한다. |
| 02 | [`sc_b4a7de1ea55c4debb7bd86e0263b7563`](https://gummble.com/screens/sc_b4a7de1ea55c4debb7bd86e0263b7563?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 폼 온보딩](<screens/02_sc_b4a7de1ea55c4debb7bd86e0263b7563.png>) | Create Form을 연다. |
| 03 | [`sc_64a38330f26b456cafe9cc1926b44a21`](https://gummble.com/screens/sc_64a38330f26b456cafe9cc1926b44a21?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 폼 생성 방식 선택](<screens/03_sc_64a38330f26b456cafe9cc1926b44a21.png>) | Use a template을 선택한다. |
| 04 | [`sc_bdc01d3e33d34f5ba2ca525085dcec98`](https://gummble.com/screens/sc_bdc01d3e33d34f5ba2ca525085dcec98?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 템플릿 목록 로딩](<screens/04_sc_bdc01d3e33d34f5ba2ca525085dcec98.png>) | 템플릿 썸네일 로딩이 끝난다. |
| 05 | [`sc_06356cc9ef5248f49522f1a427901e56`](https://gummble.com/screens/sc_06356cc9ef5248f49522f1a427901e56?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 템플릿 목록 로드 완료](<screens/05_sc_06356cc9ef5248f49522f1a427901e56.png>) | 필터·검색·사용 하위 흐름으로 이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — 생성된 유형 목록

- Screen ID: `sc_529048e78b304f66937c84b12cbc8a07`
- 원본: [화면 페이지](https://gummble.com/screens/sc_529048e78b304f66937c84b12cbc8a07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6ba84c63-1167-41ca-9412-e3dbab548038.png)
- 로컬 이미지: [01_sc_529048e78b304f66937c84b12cbc8a07.png](<screens/01_sc_529048e78b304f66937c84b12cbc8a07.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_b4a7de1ea55c4debb7bd86e0263b7563`

#### 화면에서 직접 확인한 내용

- 레이아웃: Scheduling 관리2열 화면.
- 입력 항목·필수 표시·기본값: Consultation call, Video Conferencing,30min; No Upcoming Events.
- 버튼·메뉴·안내 문구: View Booking Page, Copy Link, …, Calendar Settings, New Event Type.
- 확인된 상태: 생성한 유형이 목록에 나타난다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 유형 레코드 영속 결과를 확인할 근거다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침 후 유지와 실제 예약 연동은 미확인.

#### 모델링 영향

- 후보와 근거: 정의와 인스턴스의 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 대시보드 폼 온보딩

- Screen ID: `sc_b4a7de1ea55c4debb7bd86e0263b7563`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b4a7de1ea55c4debb7bd86e0263b7563?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7e881d80-6f7c-466f-98de-cf07cdc1038b.png)
- 로컬 이미지: [02_sc_b4a7de1ea55c4debb7bd86e0263b7563.png](<screens/02_sc_b4a7de1ea55c4debb7bd86e0263b7563.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_529048e78b304f66937c84b12cbc8a07` → 현재 → `sc_64a38330f26b456cafe9cc1926b44a21`

#### 화면에서 직접 확인한 내용

- 레이아웃: 5단계 온보딩 중4번 선택,앞3개완료.
- 입력 항목·필수 표시·기본값: Create a contact form 설명,업무활동없음.
- 버튼·메뉴·안내 문구: Create Form,Next Step,Hide.
- 확인된 상태: 수입 생성 시작 전에 폼 설정 안내를 보고 있다.
- 단계 간 변화: Dashboard로 이동한다.

#### 동작과 데이터

- 화면 관찰: 온보딩 맥락만 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다음 단계의 완료 표시는 폼생성 생략 구간을 포함한다.

#### 모델링 영향

- 후보와 근거: 온보딩 상태와 도메인 데이터 생성 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 새 폼 생성 방식 선택

- Screen ID: `sc_64a38330f26b456cafe9cc1926b44a21`
- 원본: [화면 페이지](https://gummble.com/screens/sc_64a38330f26b456cafe9cc1926b44a21?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1e0a641d-85c1-40b1-a285-535ea5145dab.png)
- 로컬 이미지: [03_sc_64a38330f26b456cafe9cc1926b44a21.png](<screens/03_sc_64a38330f26b456cafe9cc1926b44a21.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b4a7de1ea55c4debb7bd86e0263b7563` → 현재 → `sc_bdc01d3e33d34f5ba2ca525085dcec98`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Form 중앙 모달에2개 큰 카드.
- 입력 항목·필수 표시·기본값: Start from scratch 설명과 Use a template 설명.입력란없음.
- 버튼·메뉴·안내 문구: 두 카드,외부X.
- 확인된 상태: 빈 폼 빌더와 사전 제작 템플릿이 별도 경로다.
- 단계 간 변화: Create Form을 연다.

#### 동작과 데이터

- 화면 관찰: 생성 방식 선택 전 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 선택 후 초기저장시점은 미확인.

#### 모델링 영향

- 후보와 근거: 생성 원천/템플릿 참조 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 폼 템플릿 목록 로딩

- Screen ID: `sc_bdc01d3e33d34f5ba2ca525085dcec98`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bdc01d3e33d34f5ba2ca525085dcec98?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2486ebd3-38d8-481b-b07a-b7626d2f5af4.png)
- 로컬 이미지: [04_sc_bdc01d3e33d34f5ba2ca525085dcec98.png](<screens/04_sc_bdc01d3e33d34f5ba2ca525085dcec98.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_64a38330f26b456cafe9cc1926b44a21` → 현재 → `sc_06356cc9ef5248f49522f1a427901e56`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체화면 선택기.좌측Type/Industry·카테고리,오른쪽검색/3열카드.
- 입력 항목·필수 표시·기본값: Type All95;ClientIntake60,ClientRequest15,ClientOnboarding12,Registration10,Contactforms9,Research5,Feedback5,Other8.카드이름은표시·썸네일은회색.
- 버튼·메뉴·안내 문구: 검색/X,카테고리,UseTemplate,BlankForm Startfromscratch,전체닫기X.
- 확인된 상태: 텍스트 목록이 먼저 로드된 상태.
- 단계 간 변화: Use a template을 선택한다.

#### 동작과 데이터

- 화면 관찰: 카테고리/카드 메타데이터 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 분류합계가 전체보다커도 중복분류가능성을 고려한다.

#### 모델링 영향

- 후보와 근거: 템플릿과다중분류·비동기미리보기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 폼 템플릿 목록 로드 완료

- Screen ID: `sc_06356cc9ef5248f49522f1a427901e56`
- 원본: [화면 페이지](https://gummble.com/screens/sc_06356cc9ef5248f49522f1a427901e56?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6678b639-467a-41c6-9a13-4052b1ec0732.png)
- 로컬 이미지: [05_sc_06356cc9ef5248f49522f1a427901e56.png](<screens/05_sc_06356cc9ef5248f49522f1a427901e56.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_bdc01d3e33d34f5ba2ca525085dcec98` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열×4행 카드와좌측필터.
- 입력 항목·필수 표시·기본값: BlankForm,AcupunctureIntakeForm,ArchitectClientQuestionnaire,BodyContouringIntakeForm,BrandQuestionnaire,BusinessIntake,BusinessPartnershipQuesti… ,BusinessQuestionnaire,ChairMassageIntakeForm,ChiropracticIntakeForm,ClientApplication,ClientAttestation.각썸네일표시.
- 버튼·메뉴·안내 문구: 검색,Type/Industry,UseTemplate,닫기.
- 확인된 상태: 회색영역이 실제미리보기로채워진다.
- 단계 간 변화: 템플릿 썸네일 로딩이 끝난다.

#### 동작과 데이터

- 화면 관찰: 목록 이미지 로드 완료.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잘린제목전체·다음페이지는 별도검토.

#### 모델링 영향

- 후보와 근거: 템플릿표시명·미리보기자산·페이지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Start from scratch와 Use a template이 별도 분기다.
- [관찰] 라이브러리95는 캡처 당시 개수이고 구독/현재 제품의 고정 상수로 쓰지 않는다.
- [관찰] 콘텐츠 이름이 먼저 보이고 썸네일은 이후 로드된다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 폼 생성/편집을 설명한다. 이 템플릿 선택 UI의 세부 동작은 이미지 근거다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 재사용 템플릿과 생성된 폼 인스턴스·카테고리·미리보기 자산 후보.

## 8. 미확인 사항과 검토 질문

- 빈 폼 초기 구성,템플릿 소유/버전/복사/수정 전파 정책과 생성 실패/중복을 확인한다.
- 고객/프로젝트 없이 생성된 폼의 소유 범위와 공유 시 연결 정책을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

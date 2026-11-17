# Services 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `16a15a7f-2535-457e-838b-877a27767618` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=16a15a7f-2535-457e-838b-877a27767618) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

반복 사용하는 서비스 항목과 가격·단위·분류를 조회한다.

- Dashboard→Services 목록→하단스크롤→Categories 탐색.
- 서비스 항목을 선택해 청구서/제안서에 가져오는 경로와 연결된다.

- 하위 플로우: [Adding a service to library](Adding%20a%20service%20to%20library/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | Services 목록으로 이동한다. |
| 02 | [`sc_059762fd20fc473f9ef5b1f15f270ed6`](https://gummble.com/screens/sc_059762fd20fc473f9ef5b1f15f270ed6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 서비스 라이브러리 목록 | 아래로 스크롤해 전체10개 행을 확인한다. |
| 03 | [`sc_02428801137b4cd3abb08e3ba16a05e6`](https://gummble.com/screens/sc_02428801137b4cd3abb08e3ba16a05e6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 서비스 목록 하단 | Categories 탭에서4개분류를 확인한다. |
| 04 | [`sc_5111e1b401844345948bcbceee9ddb52`](https://gummble.com/screens/sc_5111e1b401844345948bcbceee9ddb52?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 서비스 분류 목록 | 분류목록 탐색에서종료. 수정행위없음. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_059762fd20fc473f9ef5b1f15f270ed6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정된 왼쪽 사이드바, 상단 Search·Track Time·New, 날짜와 인사말 아래 2열 본문. 왼쪽은 Project Timeline과 Profit & Loss, 오른쪽은 2×2 빠른 생성 카드와 Workflow Plus 홍보 카드다.
- 입력 항목·필수 표시·기본값: Wednesday, February 14th / Good evening, Joe. 타임라인에 Consulting Project, Design Project with …, Rebranding Project가 있고 JAN 31·TODAY·FEB 28 축이 보인다. 손익 필터는 USD·Last 6 Months. 이 화면에 입력 폼이나 필수 표시는 없다.
- 버튼·메뉴·안내 문구: 사이드바 Dashboard·Clients·Projects·Tasks, Tools 아래 Invoices·Proposals·Contracts·Time Tracking·Services·Forms·Scheduling, Finances 아래 Bookkeeping. 하단 Invite Team·Get 1 Month Free. 빠른 실행은 Send an invoice·Draft a proposal·Create a contract·Add a form. 홍보 카드에는 X·캐러셀 점·START 14-DAY FREE TRIAL, 우하단 도움말 버튼이 있다.
- 확인된 상태: Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트별 문서 아이콘과 손익 그래프를 한 화면에서 표시한다. 특정 메뉴를 실행했다는 근거는 다음 단계와 함께 판단한다. 홍보의 14일 문구를 계정 전체의 체험 기간으로 일반화하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 프로젝트·문서 참조, 기간·통화별 재무 집계, 빠른 생성 진입점 및 공통 내비게이션 후보. 메뉴 노출은 서버 권한의 증거와 구분한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 서비스 라이브러리 목록

- Screen ID: `sc_059762fd20fc473f9ef5b1f15f270ed6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_059762fd20fc473f9ef5b1f15f270ed6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/05d4f069-6e42-4088-b7d3-e95c1250381e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_02428801137b4cd3abb08e3ba16a05e6`

#### 화면에서 직접 확인한 내용

- 레이아웃: Services/Categories탭,검색·Filters·View Templates·New Service,서비스명/가격/분류표.
- 입력 항목·필수 표시·기본값: 10행: Brand2500, BusinessCard100, Deck200, Flyer50/item, Icon1000, Logo800, Poster250/item, UX5000, Website150/hour, WebsiteRedesign800/day. 분류Branding/Graphic Design/Design/Marketing.
- 버튼·메뉴·안내 문구: 각행…·열정렬·템플릿조회·신규서비스.
- 확인된 상태: 샘플서비스목록. 빈상태아님.
- 단계 간 변화: Services 목록으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 서비스별가격과단위·분류를목록에서비교가능.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서비스설명은목록에없음. 표시 통화와 계정 통화 관계 미확인.

#### 모델링 영향

- 후보와 근거: 서비스카탈로그·분류·요금단위후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 서비스 목록 하단

- Screen ID: `sc_02428801137b4cd3abb08e3ba16a05e6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_02428801137b4cd3abb08e3ba16a05e6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1d50423e-35d6-460a-a54e-2309eb39251d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_059762fd20fc473f9ef5b1f15f270ed6` → 현재 → `sc_5111e1b401844345948bcbceee9ddb52`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전역 상단 바가 사라질 정도로 아래로 스크롤,사이드바유지.10행전체보임.
- 입력 항목·필수 표시·기본값: 목록값은이전과같고WebsiteRedesign800/day까지확인.
- 버튼·메뉴·안내 문구: 검색/Filters/템플릿/신규/행…유지.
- 확인된 상태: 스크롤차이. 데이터추가없음.
- 단계 간 변화: 아래로 스크롤해 전체10개 행을 확인한다.

#### 동작과 데이터

- 화면 관찰: 동일목록하단정보확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 가상스크롤/페이지네이션·고정헤더규칙미확인.

#### 모델링 영향

- 후보와 근거: 목록 스크롤과 정렬 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 서비스 분류 목록

- Screen ID: `sc_5111e1b401844345948bcbceee9ddb52`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5111e1b401844345948bcbceee9ddb52?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2090986b-5ef6-497f-a6ec-85af632b94a7.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_02428801137b4cd3abb08e3ba16a05e6` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Categories탭,All Services복귀버튼,New Category.4개행과색세로막대.
- 입력 항목·필수 표시·기본값: Branding회녹색,Design분홍,Graphic Design진녹색,Marketing주황. 정확색코드미확인.
- 버튼·메뉴·안내 문구: New Category·각행…·All Services.
- 확인된 상태: 분류조회.
- 단계 간 변화: Categories 탭에서4개분류를 확인한다.

#### 동작과 데이터

- 화면 관찰: 서비스 분류가 별도 관리 화면을 가진다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 편집/삭제 메뉴와 사용 중 분류 삭제 정책 미확인.

#### 모델링 영향

- 후보와 근거: 분류식별자·이름·색·서비스연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 가격은 고정표시와/item·/hour·/day 단위를 지원하는 형태다.
- [관찰] 분류는색이있는라벨/세로막대로표시되며행별…와New Category가있다.
- [문서] 기존 문서 항목은 라이브러리 수정과 분리된다.

## 6. 공식 도움말과 API 대조

- [Services library](https://help.hellobonsai.com/en/articles/12824095-services-library): 이름·설명·가격·유형·분류를 관리하고 제안서/인보이스에 가져온다. 라이브러리 수정은 이미 문서에 들어간 항목을 소급 변경하지 않는다.
- [공개API목록](https://docs.hellobonsai.com/api): 조회한 공개 그룹에는 서비스 라이브러리 전용 CRUD 계약이 없었다. Templates API가 서비스 템플릿을 뜻한다고 단정하지 않는다.

## 7. 데이터 모델링 시사점

- 서비스 카탈로그의 이름·설명·가격·단위/유형·분류와 분류명/색 후보.
- 공통 템플릿과 계정 소유 서비스,문서에 복사된 항목은 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 카테고리가 서비스당 하나인지,삭제 시 미분류 처리하는지 확인한다.
- New Service입력의필수값·통화·가격정밀도·단위종류와무료/음수가격을확인한다.
- 검색·필터·정렬·행메뉴동작은미수록이다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |

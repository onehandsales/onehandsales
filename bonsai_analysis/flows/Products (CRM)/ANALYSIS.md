# Products (CRM) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `12ca870d-d929-4cc8-ab4c-60436c2eac13` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=12ca870d-d929-4cc8-ab4c-60436c2eac13) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

공개 방문자가 Product 메뉴에서 CRM 소개를 읽고 기능·템플릿·FAQ를 탐색한다.

- 실제 Clients/Projects CRUD가 아니라 공개 마케팅 흐름이다.
- 폼 템플릿·시간 기록·작업 관리·가입으로 연결되는 링크가 있다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_2ce9fd14ccb74e05977de48b5517e78c`](https://gummble.com/screens/sc_2ce9fd14ccb74e05977de48b5517e78c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Product 전체 메뉴 | CRM 소개 페이지로 전환 |
| 02 | [`sc_e887bc9463cc451fa88f9aef731b6eb3`](https://gummble.com/screens/sc_e887bc9463cc451fa88f9aef731b6eb3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | CRM 소개 hero | 핵심 기능으로 스크롤 |
| 03 | [`sc_4d7838a172d243b78e7c5e6f4fc9ffc9`](https://gummble.com/screens/sc_4d7838a172d243b78e7c5e6f4fc9ffc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | CRM 핵심 기능 3개 | 고객·프로젝트 소개로 스크롤 |
| 04 | [`sc_bad21b14523b490288c7037d79ba03cd`](https://gummble.com/screens/sc_bad21b14523b490288c7037d79ba03cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 목록·프로젝트 통합 소개 | 후기와 템플릿 시작 노출 |
| 05 | [`sc_d8a62347ff844766bc5b8997d289ba3c`](https://gummble.com/screens/sc_d8a62347ff844766bc5b8997d289ba3c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | CRM 후기와 폼 템플릿 진입 | 템플릿 12개 목록으로 스크롤 |
| 06 | [`sc_f2fd8490cf4d40d1b0c1ff5a104ce501`](https://gummble.com/screens/sc_f2fd8490cf4d40d1b0c1ff5a104ce501?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 폼 템플릿 12개 그리드 | 추가 템플릿·가입 안내 노출 |
| 07 | [`sc_e2fae02b9bf14ab6be504f53c3e490fb`](https://gummble.com/screens/sc_e2fae02b9bf14ab6be504f53c3e490fb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 추가 템플릿 가입 안내 | 연관 기능으로 스크롤 |
| 08 | [`sc_ac8d0e2583ea436ca9ce2ec0c94b4857`](https://gummble.com/screens/sc_ac8d0e2583ea436ca9ce2ec0c94b4857?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 연관 시간·작업 관리 기능 | FAQ 닫힘 상태로 스크롤 |
| 09 | [`sc_69e9686880f0449d86954e385ec98c11`](https://gummble.com/screens/sc_69e9686880f0449d86954e385ec98c11?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | CRM FAQ 닫힘 | 첫 FAQ만 펼쳐 답변 표시 |
| 10 | [`sc_a3545f7a7e324b7299d14f07150f6978`](https://gummble.com/screens/sc_a3545f7a7e324b7299d14f07150f6978?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | CRM FAQ 첫 답변 열림 | 답변 열림에서 종료; 가입·고객 생성 없음 |

## 4. 화면별 상세 분석

### 단계 01 — Product 전체 메뉴

- Screen ID: `sc_2ce9fd14ccb74e05977de48b5517e78c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2ce9fd14ccb74e05977de48b5517e78c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f39968a2-0980-43c9-8327-80c4e6f17d39.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_e887bc9463cc451fa88f9aef731b6eb3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 헤더 아래 화면 폭 전체의 흰색 메가 메뉴, 배경 홈페이지 hero 일부가 가려진다.
- 입력 항목·필수 표시·기본값: 배경 이메일 입력은 비어 있다.
- 버튼·메뉴·안내 문구: Client Management 5개, Project Management 5개, Financial Management 5개 링크와 What's new 카드·Learn more. CRM이 첫 항목.
- 확인된 상태: Product 초록색 활성; 신기능은 Branded scheduling portal.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: CRM 상세 소개로 이동할 수 있는 공개 탐색이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메뉴가 hover인지 click인지, 닫힘·키보드 포커스 미확인.

#### 모델링 영향

- 후보와 근거: 공개 내비게이션 그룹·링크·프로모션 카드 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — CRM 소개 hero

- Screen ID: `sc_e887bc9463cc451fa88f9aef731b6eb3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e887bc9463cc451fa88f9aef731b6eb3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1705edbe-20e7-4e26-89ad-502f64128755.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_2ce9fd14ccb74e05977de48b5517e78c` → 현재 → `sc_4d7838a172d243b78e7c5e6f4fc9ffc9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 큰 제목·이메일 CTA·평점, 우측 프로젝트 보드와 상세 패널 목업. 상단 고객군 보조 메뉴.
- 입력 항목·필수 표시·기본값: Enter your work email 빈 입력; 필수·오류 표시 없음.
- 버튼·메뉴·안내 문구: Start free, Small businesses·Agencies·Freelancers.
- 확인된 상태: 고객·프로젝트·계약·결제를 한곳에서 관리한다는 소개.
- 단계 간 변화: CRM 소개 페이지로 전환

#### 동작과 데이터

- 화면 관찰: 실제 고객 생성이 아닌 공개 가입 유도다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이메일 전달·검증·가입 경로는 본 흐름 미수록.

#### 모델링 영향

- 후보와 근거: 콘텐츠 랜딩 변형 및 가입 유입 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — CRM 핵심 기능 3개

- Screen ID: `sc_4d7838a172d243b78e7c5e6f4fc9ffc9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4d7838a172d243b78e7c5e6f4fc9ffc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2bb8387f-ea88-44a5-9fb8-de1218796745.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e887bc9463cc451fa88f9aef731b6eb3` → 현재 → `sc_bad21b14523b490288c7037d79ba03cd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 제목 아래 Client management·Project organization·Project collaboration 카드 3열.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 개별 카드에 초록 선 아이콘, 하단 고객 목록 소개 시작.
- 확인된 상태: 리드·고객·내부 노트, 문서·결제·작업·타임시트, 팀·외주 협업 설명.
- 단계 간 변화: 핵심 기능으로 스크롤

#### 동작과 데이터

- 화면 관찰: 설명은 고객·프로젝트 중심 업무 연결을 제시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 관계 카디널리티·권한은 이 카드로 알 수 없다.

#### 모델링 영향

- 후보와 근거: 고객·프로젝트·팀원·문서 관계 후보를 앱/API와 대조.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 고객 목록·프로젝트 통합 소개

- Screen ID: `sc_bad21b14523b490288c7037d79ba03cd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bad21b14523b490288c7037d79ba03cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ddf16ca3-9cc8-4175-b4f8-cc6d2c1915a2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_4d7838a172d243b78e7c5e6f4fc9ffc9` → 현재 → `sc_d8a62347ff844766bc5b8997d289ba3c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 섹션이 좌우 교차 배치. 상단 고객 추가 목업과 설명, 하단 프로젝트 업무 목업·설명.
- 입력 항목·필수 표시·기본값: 이미지 내 회사명·연락처명·이메일·전화·웹사이트 및 작업 체크박스.
- 버튼·메뉴·안내 문구: 실제 페이지 CTA Get started 두 곳. Add new client는 목업 내부.
- 확인된 상태: 노트·연락처·요율·태그를 고객별로 관리하고 프로젝트에서 문서·지불을 모은다는 설명.
- 단계 간 변화: 고객·프로젝트 소개로 스크롤

#### 동작과 데이터

- 화면 관찰: CRM과 프로젝트가 연결됨을 홍보하지만 입력·저장은 수행되지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목업과 현재 실제 Clients의 필수 필드 차이 미확인.

#### 모델링 영향

- 후보와 근거: 회사·담당자 분리, 고객 프로필 속성, 프로젝트 문서 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — CRM 후기와 폼 템플릿 진입

- Screen ID: `sc_d8a62347ff844766bc5b8997d289ba3c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d8a62347ff844766bc5b8997d289ba3c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f7475fbf-e1bb-4890-9cac-283bdc3bdc89.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_bad21b14523b490288c7037d79ba03cd` → 현재 → `sc_f2fd8490cf4d40d1b0c1ff5a104ce501`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 사진+Mary 후기 카드, 아래 폼 템플릿 제목과 첫 줄 4카드.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Tax intake form·Recruiter intake form·Project Intake Form·Free Portfolio Contact Page 화살표.
- 확인된 상태: 고객 프로필 정보 집약 후기 뒤 관련 폼을 제안한다.
- 단계 간 변화: 후기와 템플릿 시작 노출

#### 동작과 데이터

- 화면 관찰: 공개 템플릿 카탈로그 링크이며 생성된 폼 목록이 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭 후 가입 필요 여부와 템플릿 사용 결과 미확인.

#### 모델링 영향

- 후보와 근거: 제품 소개와 추천 템플릿의 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 폼 템플릿 12개 그리드

- Screen ID: `sc_f2fd8490cf4d40d1b0c1ff5a104ce501`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f2fd8490cf4d40d1b0c1ff5a104ce501?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4c53e093-a97c-4651-bc22-afaf688a631a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d8a62347ff844766bc5b8997d289ba3c` → 현재 → `sc_e2fae02b9bf14ab6be504f53c3e490fb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 4열×3행 테두리 카드, 오른쪽 위·왼쪽 아래 둥근 모서리 스타일.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 각 카드 Forms 라벨·제목·초록 원형 화살표. Life Coach Intake/Assessment, Interior Design, Event Planning, Consultant Intake, Comprehensive Client, Client Registration, Client Intake 등.
- 확인된 상태: 12개 폼 유형이 같은 디자인으로 표시된다.
- 단계 간 변화: 템플릿 12개 목록으로 스크롤

#### 동작과 데이터

- 화면 관찰: 템플릿 분류 Forms와 업무 분야별 이름을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 제목과 실제 템플릿 스키마의 일치·공개 API 제공 여부 미확인.

#### 모델링 영향

- 후보와 근거: 공개 템플릿 메타데이터·추천 순서 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 추가 템플릿 가입 안내

- Screen ID: `sc_e2fae02b9bf14ab6be504f53c3e490fb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e2fae02b9bf14ab6be504f53c3e490fb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9321e57c-2e8d-4abf-9c91-305cf63acefc.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f2fd8490cf4d40d1b0c1ff5a104ce501` → 현재 → `sc_ac8d0e2583ea436ca9ce2ec0c94b4857`

#### 화면에서 직접 확인한 내용

- 레이아웃: View all templates 버튼 아래 넓은 테두리 안내 박스, 다음 기능 영역 제목.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: View all templates, Signup.
- 확인된 상태: 추가 템플릿은 Bonsai 내부에서만 이용 가능하다는 안내.
- 단계 간 변화: 추가 템플릿·가입 안내 노출

#### 동작과 데이터

- 화면 관찰: 공개 열람과 가입 후 추가 접근의 경계를 명시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 유료 여부·템플릿 개별 접근 조건 미확인.

#### 모델링 영향

- 후보와 근거: 접근 정책은 공개/로그인/요금제 조건을 분리해 확인.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 연관 시간·작업 관리 기능

- Screen ID: `sc_ac8d0e2583ea436ca9ce2ec0c94b4857`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ac8d0e2583ea436ca9ce2ec0c94b4857?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4dcfe6ab-82cf-4223-8b53-a7b16ebe616d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e2fae02b9bf14ab6be504f53c3e490fb` → 현재 → `sc_69e9686880f0449d86954e385ec98c11`

#### 화면에서 직접 확인한 내용

- 레이아웃: 연녹색 지도 무늬 카드 두 개를 가로 배치.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Time tracking·Task management, 각각 View more.
- 확인된 상태: 시간 기록에 노트·완료 작업, 작업에는 템플릿·기한·이메일 알림을 소개.
- 단계 간 변화: 연관 기능으로 스크롤

#### 동작과 데이터

- 화면 관찰: 기능별 별도 소개 페이지로 탐색 가능한 구조.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 링크의 실제 이동 화면은 수록되지 않았다.

#### 모델링 영향

- 후보와 근거: 연관 기능 추천과 업무 모델 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — CRM FAQ 닫힘

- Screen ID: `sc_69e9686880f0449d86954e385ec98c11`
- 원본: [화면 페이지](https://gummble.com/screens/sc_69e9686880f0449d86954e385ec98c11?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a2ea356d-5879-4bee-8dc1-426195f30e11.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ac8d0e2583ea436ca9ce2ec0c94b4857` → 현재 → `sc_a3545f7a7e324b7299d14f07150f6978`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 FAQ 3행과 오른쪽 잎 일러스트, 하단 푸터 시작.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 리드 생성 자동화·리드 선별·대상 사용자 질문, 각 아래 화살표.
- 확인된 상태: 세 답변 모두 접힌 상태.
- 단계 간 변화: FAQ 닫힘 상태로 스크롤

#### 동작과 데이터

- 화면 관찰: 답변은 아직 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 독립 다중 열림·키보드 접근·기본 열림 여부 미확인.

#### 모델링 영향

- 후보와 근거: FAQ 콘텐츠와 펼침 상태 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — CRM FAQ 첫 답변 열림

- Screen ID: `sc_a3545f7a7e324b7299d14f07150f6978`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a3545f7a7e324b7299d14f07150f6978?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8bad8e40-43ba-4cdc-aae4-69c0a77edeea.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_69e9686880f0449d86954e385ec98c11` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첫 질문 아래 답변이 늘어나고 나머지 두 행이 내려간다.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 첫 행 화살표 위쪽, 답변 내 Bonsai Forms 링크.
- 확인된 상태: 첫 답변만 열려 있다.
- 단계 간 변화: 첫 FAQ만 펼쳐 답변 표시

#### 동작과 데이터

- 화면 관찰: Forms를 통해 리드 관리와 프로젝트 추적을 돕는다는 설명을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 답변·동시 열림·자동화의 정확한 범위 미확인.

#### 모델링 영향

- 후보와 근거: FAQ 펼침 상태는 화면 상태, 폼→리드 연결은 별도 검증할 업무 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 목업의 고객 필드를 실제 입력 폼 계약으로 확정하지 않는다.
- 추가 템플릿의 가입 조건은 보이나 유료 조건은 보이지 않는다.
- FAQ는 Forms와 리드 관리를 연결하지만 자동화 트리거·중복 처리·소유권은 설명되지 않는다.

## 6. 공식 도움말과 API 대조

- [공식 CRM 소개](https://www.hellobonsai.com/crm): 현재도 고객 정보·프로젝트·문서·포털 연결과 폼 템플릿을 소개한다. 캡처의 레이아웃·문구와 현재 페이지는 다르며 실제 필수값·권한은 도움말/API로 별도 확인해야 한다.
- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires)
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.
- [회사·연락처 도움말](https://help.hellobonsai.com/en/articles/452120-how-to-create-and-manage-companies-and-contacts): 현행 회사는 이름만 필수이며 회사·연락처를 독립적으로 생성하고 다중 회사 연결과 기본 연락처를 지원한다. 이 캡처의 담당자명·이메일 필수 폼과 버전 차이가 있다.

## 7. 데이터 모델링 시사점

- 공개 제품 페이지·FAQ·추천 템플릿은 콘텐츠 후보.
- 업무 모델은 회사·담당자·프로젝트·폼 응답의 실제 연결을 Clients/Forms/API에서 대조해야 한다.

## 8. 미확인 사항과 검토 질문

- FAQ 나머지 두 답변과 메가 메뉴 키보드 동작은 미수록이다.
- Bonsai Forms 리드 자동 생성·중복 판정은 실제 앱에서 확인해야 한다.
- 목업 UI와 구현 기준 화면의 차이를 구분해 FE 컴포넌트 범위를 정한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

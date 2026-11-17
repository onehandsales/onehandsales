# Perks 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `dee9aba7-13a6-462f-87f5-0a942a971ab0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=dee9aba7-13a6-462f-87f5-0a942a971ab0) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

계정 메뉴에서 제휴 혜택 목록을 열어5개 제공 업체의 안내·외부 CTA를 탐색한다.

- 업무데이터 편집 플로우가 아닌 제휴 콘텐츠 화면.
- 할인·보험·인증과정 설명은 캡처 당시 마케팅 문구이며 현재 혜택이나 권리로 확인한 것이 아니다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | 프로필메뉴 |
| 02 | [`sc_25261ff6e5d44d70885c07b053f29685`](https://gummble.com/screens/sc_25261ff6e5d44d70885c07b053f29685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 프로필 메뉴 | Perks목록 |
| 03 | [`sc_4ad80af162bd442d86a72672c1c4a187`](https://gummble.com/screens/sc_4ad80af162bd442d86a72672c1c4a187?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Bonsai Perks 상단 | 하단2개혜택으로스크롤 |
| 04 | [`sc_01047b019e8a40e3b675cb770f66700a`](https://gummble.com/screens/sc_01047b019e8a40e3b675cb770f66700a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Bonsai Perks 하단 | 목록에서종료;외부신청없음 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_25261ff6e5d44d70885c07b053f29685`

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

### 단계 02 — 대시보드 프로필 메뉴

- Screen ID: `sc_25261ff6e5d44d70885c07b053f29685`
- 원본: [화면 페이지](https://gummble.com/screens/sc_25261ff6e5d44d70885c07b053f29685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8d2c0c65-3033-4e0f-90e9-39aa0de970ef.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_4ad80af162bd442d86a72672c1c4a187`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 앱 사이드바, 우측 상단 아바타 아래 흰색 드롭다운. 배경에 프로젝트 타임라인과 손익 그래프.
- 입력 항목·필수 표시·기본값: 입력 없음. Joe Studio 계정 표시.
- 버튼·메뉴·안내 문구: Help Center, Perks, Team, Subscription, Settings, Logout.
- 확인된 상태: 메뉴가 열린 정상 상태.
- 단계 간 변화: 프로필메뉴

#### 동작과 데이터

- 화면 관찰: 설정과 팀·구독으로 직접 이동하는 진입점이 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메뉴 항목별 역할 권한과 이동 URL 미확인.

#### 모델링 영향

- 후보와 근거: 계정 메뉴 라우팅과 워크스페이스 표시 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Bonsai Perks 상단

- Screen ID: `sc_4ad80af162bd442d86a72672c1c4a187`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4ad80af162bd442d86a72672c1c4a187?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7cd7495e-4789-46e2-b112-4c6d11f41b06.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_25261ff6e5d44d70885c07b053f29685` → 현재 → `sc_01047b019e8a40e3b675cb770f66700a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 앱 사이드바 없는 독립 페이지,로고와GoToDashboard,3열카드.
- 입력 항목·필수 표시·기본값: 입력없음. Mindvalley,firstbase,Pollen.
- 버튼·메뉴·안내 문구: 업체별CTA,대시보드복귀.
- 확인된 상태: 파트너혜택소개.
- 단계 간 변화: Perks목록

#### 동작과 데이터

- 화면 관찰: 카드별혜택형태가할인/가입우선권등상이.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자격·현재제공여부미확인.

#### 모델링 영향

- 후보와 근거: 제휴콘텐츠반복컴포넌트.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Bonsai Perks 하단

- Screen ID: `sc_01047b019e8a40e3b675cb770f66700a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_01047b019e8a40e3b675cb770f66700a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/024b70ab-1316-4273-bc0f-ea5815f16f97.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_4ad80af162bd442d86a72672c1c4a187` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열격자다음행에2개카드,나머지공백.
- 입력 항목·필수 표시·기본값: ConsultingSuccess,Stride.
- 버튼·메뉴·안내 문구: 교육과정·건강보험관련외부CTA.
- 확인된 상태: 스크롤하단.
- 단계 간 변화: 하단2개혜택으로스크롤

#### 동작과 데이터

- 화면 관찰: 다섯 개 파트너 카드가 수록됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 외부신청폼·실제할인미확인.

#### 모델링 영향

- 후보와 근거: 콘텐츠그리드및외부링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 혜택카드는브랜드·설명·Perk내용·CTA로 반복된다.
- 외부구매/가입완료와 혜택조건은수록되지않음.

## 6. 공식 도움말과 API 대조

- [공식 Perks URL](https://www.hellobonsai.com/perks)은 조회를 시도했으나 도구에서 접근할 수 없어 현재 내용을 대조하지 못했다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 제휴 혜택은 콘텐츠 카탈로그(제공사/설명/조건/외부링크)후보.실제 이용 이력 저장은 근거 없음.

## 8. 미확인 사항과 검토 질문

- 로그인·플랜별혜택자격과외부CTA도착지·유효기간확인.
- 현재 혜택 존속 여부와 문구를 공식 페이지에서 추가 검증.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |

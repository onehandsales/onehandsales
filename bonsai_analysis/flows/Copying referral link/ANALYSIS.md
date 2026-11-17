# Copying referral link 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `0744777e-0613-4157-b1e2-a1ac0854db27` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=0744777e-0613-4157-b1e2-a1ac0854db27) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

추천 프로그램의 개인 링크를 복사하고 복사 성공을 확인한다.

- 대시보드 Get1MonthFree에서 진입.
- 팀 초대와 추천 초대는 목적·보상·대상 접근권이 다르다. 이메일 발송은 수록되지 않았다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | 추천 화면 |
| 02 | [`sc_859f6888e4b94f37a2aae444c3112490`](https://gummble.com/screens/sc_859f6888e4b94f37a2aae444c3112490?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 추천 링크와 현황 | 복사 후 토스트가 채팅 팝업에 가림 |
| 03 | [`sc_048932cf6a2a422ebe3c4aad916d20fd`](https://gummble.com/screens/sc_048932cf6a2a422ebe3c4aad916d20fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 추천 링크 복사 — 알림 가림 | 팝업이 사라져 복사 토스트 확인 |
| 04 | [`sc_d6335d9364f0470bb3b2a2c08323fd66`](https://gummble.com/screens/sc_d6335d9364f0470bb3b2a2c08323fd66?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 추천 링크 복사 완료 | 복사 완료 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_859f6888e4b94f37a2aae444c3112490`

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

### 단계 02 — 추천 링크와 현황

- Screen ID: `sc_859f6888e4b94f37a2aae444c3112490`
- 원본: [화면 페이지](https://gummble.com/screens/sc_859f6888e4b94f37a2aae444c3112490?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/88c304ab-560c-4512-89cc-a4b7ffedb76c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_048932cf6a2a422ebe3c4aad916d20fd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체화면 중앙통계3칸, 이메일초대, 링크·SNS2열,제휴프로그램배너.
- 입력 항목·필수 표시·기본값: 세통계0,이메일빈값(쉼표구분안내),개인inviteURL.
- 버튼·메뉴·안내 문구: SendInvite,복사아이콘,Twitter/Facebook/LinkedIn,LearnMore,X.
- 확인된 상태: 채팅안내팝업 표시.
- 단계 간 변화: 추천 화면

#### 동작과 데이터

- 화면 관찰: 추천 링크 공유와 이메일 초대 대안.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: URL생성·추천귀속·통계정의미확인.

#### 모델링 영향

- 후보와 근거: 추천링크·보상현황 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 추천 링크 복사 — 알림 가림

- Screen ID: `sc_048932cf6a2a422ebe3c4aad916d20fd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_048932cf6a2a422ebe3c4aad916d20fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/07e9803b-7a12-488f-b0e5-f2dbcf127f2d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_859f6888e4b94f37a2aae444c3112490` → 현재 → `sc_d6335d9364f0470bb3b2a2c08323fd66`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일화면,우하단 성공 토스트 위 채팅 팝업.
- 입력 항목·필수 표시·기본값: 통계0유지.
- 버튼·메뉴·안내 문구: 복사아이콘과공유메뉴.
- 확인된 상태: 토스트 일부만 보여 전체 문구는 다음 화면 확인.
- 단계 간 변화: 복사 후 토스트가 채팅 팝업에 가림

#### 동작과 데이터

- 화면 관찰: 복사작업후로보이는알림.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 가려진 문구를 추정하지 않음.

#### 모델링 영향

- 후보와 근거: 겹치는알림레이어와z-index검토.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 추천 링크 복사 완료

- Screen ID: `sc_d6335d9364f0470bb3b2a2c08323fd66`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d6335d9364f0470bb3b2a2c08323fd66?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/63b724b8-a32c-4e51-a0f1-f73929446f49.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_048932cf6a2a422ebe3c4aad916d20fd` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 채팅 팝업 없이 성공 토스트 전체 표시.
- 입력 항목·필수 표시·기본값: 통계0유지.
- 버튼·메뉴·안내 문구: Your link has been copied,토스트X.
- 확인된 상태: 클립보드복사성공UI.
- 단계 간 변화: 팝업이 사라져 복사 토스트 확인

#### 동작과 데이터

- 화면 관찰: 링크복사 완료;추천수증가없음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제클립보드값·권한실패미확인.

#### 모델링 영향

- 후보와 근거: 클립보드피드백 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- InvitesSent/SuccessfulReferrals/FreeMonths 모두0. 링크 복사 후에도 증가하지 않는다.
- 친구가 유료 구독하면 각각 무료1개월 안내. 실제 보상 발생은 미수록.
- 클립보드 성공 토스트와 이메일 발송·SNS 공유는 별개.

## 6. 공식 도움말과 API 대조

- [추천 프로그램](https://help.hellobonsai.com/en/articles/2876308-bonsai-s-referral-program): 추천인의 보상은 유료 전환 후 적용되며 월·연 구독에 따라 적용시점이 다르다. 링크 복사 자체는 보상 조건이 아니다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 추천 식별링크·초대발송·유입전환·보상크레딧을 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 추천 토큰 수명·자기추천·중복유입·환불 시 보상회수 확인.
- 이메일 다중입력 검증·SNS 공유 URL은 후속화면 필요.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |

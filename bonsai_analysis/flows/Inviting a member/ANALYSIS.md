# Inviting a member 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `646bd9c2-add0-414c-8b98-89489f2c43b5` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=646bd9c2-add0-414c-8b98-89489f2c43b5) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

팀 관리자가 이메일·역할·프로젝트를 지정해 Collaborator 초대를 보낸다.

- 대시보드 Invite Team에서 Settings Team의 모달로 이동.
- 초대 수락과 사용자 등록은 별도 Accepting an invitation 플로우다. 서로 이메일이 달라 동일 초대로 연결하지 않는다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | Team 초대 모달 진입 |
| 02 | [`sc_634224945f334a7489b79db3e68b0a19`](https://gummble.com/screens/sc_634224945f334a7489b79db3e68b0a19?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Invite Member 빈 모달 | 이메일 입력 |
| 03 | [`sc_d59bf1a0438b462ba7d6bfc6d641103c`](https://gummble.com/screens/sc_d59bf1a0438b462ba7d6bfc6d641103c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 초대 이메일 입력 | Collaborator와 프로젝트 선택 |
| 04 | [`sc_865e3b1009c34b9999af73de640724a1`](https://gummble.com/screens/sc_865e3b1009c34b9999af73de640724a1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Collaborator 프로젝트 선택 | 초대 발송 후 목록 |
| 05 | [`sc_4633bf9cebcf4ee2a1dd5c613aa33d56`](https://gummble.com/screens/sc_4633bf9cebcf4ee2a1dd5c613aa33d56?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Invite sent와 대기 행 | Invite Pending 및 Invite sent에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_634224945f334a7489b79db3e68b0a19`

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

### 단계 02 — Invite Member 빈 모달

- Screen ID: `sc_634224945f334a7489b79db3e68b0a19`
- 원본: [화면 페이지](https://gummble.com/screens/sc_634224945f334a7489b79db3e68b0a19?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e95918e0-4c18-4707-b370-c5e5270d3020.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_d59bf1a0438b462ba7d6bfc6d641103c`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings Team 배경, 중앙 세로폼.
- 입력 항목·필수 표시·기본값: Email 회색 john@yourcompany.com,Role Select,Projects Select.별표없음.
- 버튼·메뉴·안내 문구: Invite Team Member 연한색.
- 확인된 상태: 초대 입력 전.
- 단계 간 변화: Team 초대 모달 진입

#### 동작과 데이터

- 화면 관찰: 이메일·역할·프로젝트3개 요소.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수조건 및 모든 역할목록 미확인.

#### 모델링 영향

- 후보와 근거: 초대payload후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 초대 이메일 입력

- Screen ID: `sc_d59bf1a0438b462ba7d6bfc6d641103c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d59bf1a0438b462ba7d6bfc6d641103c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a3acc369-ac43-41d2-af45-eced4ef735cd.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_634224945f334a7489b79db3e68b0a19` → 현재 → `sc_865e3b1009c34b9999af73de640724a1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달.
- 입력 항목·필수 표시·기본값: jsmith.mobbin@gmail.com,나머지미선택.
- 버튼·메뉴·안내 문구: Invite Team Member 연한색,X.
- 확인된 상태: 이메일만 채움.
- 단계 간 변화: 이메일 입력

#### 동작과 데이터

- 화면 관찰: 이메일 입력만으로 진행 버튼 활성되지 않음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 형식검증·서버중복검증미확인.

#### 모델링 영향

- 후보와 근거: 초대대상식별.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Collaborator 프로젝트 선택

- Screen ID: `sc_865e3b1009c34b9999af73de640724a1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_865e3b1009c34b9999af73de640724a1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ad919f05-2800-4745-a3b3-7a1271a5cb42.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d59bf1a0438b462ba7d6bfc6d641103c` → 현재 → `sc_4633bf9cebcf4ee2a1dd5c613aa33d56`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일모달Projects에chip.
- 입력 항목·필수 표시·기본값: Role Collaborator,Design Project with Doe Studio1개.
- 버튼·메뉴·안내 문구: Invite Collaborator 녹색,chip제거X.
- 확인된 상태: 초대준비완료.
- 단계 간 변화: Collaborator와 프로젝트 선택

#### 동작과 데이터

- 화면 관찰: 역할선택에따라CTA라벨변경.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복수프로젝트·필수개수미확인.

#### 모델링 영향

- 후보와 근거: 역할+프로젝트접근배정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Invite sent와 대기 행

- Screen ID: `sc_4633bf9cebcf4ee2a1dd5c613aa33d56`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4633bf9cebcf4ee2a1dd5c613aa33d56?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/73ae2c7a-258c-47e2-877b-877dd3e57615.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_865e3b1009c34b9999af73de640724a1` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Team표3행,우하단성공토스트.
- 입력 항목·필수 표시·기본값: Owner JoeDoe,Partner JaneSmith AllProjects,신규이메일 Collaborator1Project InvitePending.
- 버튼·메뉴·안내 문구: Invite Member,행메뉴,Invite sent.
- 확인된 상태: 신규초대대기행표시.
- 단계 간 변화: 초대 발송 후 목록

#### 동작과 데이터

- 화면 관찰: 이름이 없는 초대 행은 이메일을Name으로표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메일수신·수락·좌석결제미확인.

#### 모델링 영향

- 후보와 근거: 초대 대기 상태와 가입일 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 빈Role/Projects일 때버튼은 연한색. 선택 후 Invite Collaborator로 라벨이 바뀜.
- 프로젝트는 제거X가 있는 chip형 선택. 복수 선택 한계는 미확인.
- 완료는 초대 발송이다. Joined열은 Invite Pending이며 가입 완료가 아니다.

## 6. 공식 도움말과 API 대조

- [사용자 권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai): 역할과 프로젝트 접근을 구분하며 초대 수락 후 접근한다. 현재 권한·요금 정책과 과거 캡처의 플랜 구성을 구분한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 초대 대상 이메일·역할·프로젝트 집합·발송 상태와 수락된 멤버십을 구분.
- 역할에 따른 접근범위와 표시이름 없는 초대행 후보.

## 8. 미확인 사항과 검토 질문

- 기존 사용자·중복 이메일·만료 초대의 분기 확인.
- Role/Projects별 필수조건·플랜·과금 경계 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |

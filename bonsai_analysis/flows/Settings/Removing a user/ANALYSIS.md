# Removing a user 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `c615a678-2203-45d5-bcc0-235f6b325516` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=c615a678-2203-45d5-bcc0-235f6b325516) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

팀의 초대 대기 사용자1명을 제거하고 목록·성공 알림을 확인한다.

- 대상은 가입 완료 멤버가 아니라 Invite Pending 행이다.
- 동일 이름의 다른 계정 행은 유지된다.

- 상위 분석: [Settings](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_c3ed26151c6f4f72b154852639f26757`](https://gummble.com/screens/sc_c3ed26151c6f4f72b154852639f26757?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Team 목록 | 마지막 행 메뉴 |
| 02 | [`sc_9e9153cd2e184bca95ad8221af225481`](https://gummble.com/screens/sc_9e9153cd2e184bca95ad8221af225481?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 초대 대기 행 메뉴 | Confirm Removal 모달 |
| 03 | [`sc_cabb20c7541043ae92fb93dbfc992266`](https://gummble.com/screens/sc_cabb20c7541043ae92fb93dbfc992266?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Confirm Removal | 제거 후4행과 성공 토스트 |
| 04 | [`sc_205004e1f31044eeb1a1e4693a3e85e5`](https://gummble.com/screens/sc_205004e1f31044eeb1a1e4693a3e85e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 팀 멤버 제거 완료 | 완료 |

## 4. 화면별 상세 분석

### 단계 01 — Team 목록

- Screen ID: `sc_c3ed26151c6f4f72b154852639f26757`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c3ed26151c6f4f72b154852639f26757?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0a9d91f2-ab27-47f4-8f27-ebad4ced137f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9e9153cd2e184bca95ad8221af225481`

#### 화면에서 직접 확인한 내용

- 레이아웃: Team 탭과 우측 Invite Member. Name/Email/Role/Projects/Joined 표.
- 입력 항목·필수 표시·기본값: Owner Joe Doe All Projects; Collaborator 4행. 3행은 Invite Pending, 다른 행은 날짜. 같은 Jon Smith 이름에 다른 이메일.
- 버튼·메뉴·안내 문구: 행별 점3개 메뉴, Invite Member, 상단 Upgrade Now.
- 확인된 상태: 초대 대기와 가입 완료가 공존. 화면 표시 날짜는2024년2월.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 멤버명·이메일·역할·프로젝트 범위·초대 상태가 구분됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 소유자 변경, 초대 중복, 좌석 과금 시점 미확인.

#### 모델링 영향

- 후보와 근거: 멤버십과 초대 수명주기·프로젝트 배정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 초대 대기 행 메뉴

- Screen ID: `sc_9e9153cd2e184bca95ad8221af225481`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9e9153cd2e184bca95ad8221af225481?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6152dee9-57a0-4fc1-a324-5bf8fd04f8bc.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c3ed26151c6f4f72b154852639f26757` → 현재 → `sc_cabb20c7541043ae92fb93dbfc992266`

#### 화면에서 직접 확인한 내용

- 레이아웃: 팀표 마지막 이메일 이름 행의 우측 메뉴.
- 입력 항목·필수 표시·기본값: Invite Pending·Collaborator·1Project 대상.
- 버튼·메뉴·안내 문구: Resend Invite, Remove.
- 확인된 상태: 다른 행은 변경 없음.
- 단계 간 변화: 마지막 행 메뉴

#### 동작과 데이터

- 화면 관찰: 초대 재발송과 제거 가능.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 완료 멤버 메뉴 동일 여부 미확인.

#### 모델링 영향

- 후보와 근거: 초대 상태별 액션 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Confirm Removal

- Screen ID: `sc_cabb20c7541043ae92fb93dbfc992266`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cabb20c7541043ae92fb93dbfc992266?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/051a8ed1-bf80-4243-a5bf-f465de29227d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9e9153cd2e184bca95ad8221af225481` → 현재 → `sc_205004e1f31044eeb1a1e4693a3e85e5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 모달과 어두운 배경.
- 입력 항목·필수 표시·기본값: 대상 이메일을 굵게 표시. 추가 입력 없음.
- 버튼·메뉴·안내 문구: Remove Member 빨간 버튼, 닫기 X. 모든 프로젝트·문서 접근 회수 안내.
- 확인된 상태: 최종 확인.
- 단계 간 변화: Confirm Removal 모달

#### 동작과 데이터

- 화면 관찰: 멤버 접근권을 회수하는 의미.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 데이터 보존·즉시 세션 만료·취소 가능성 미확인.

#### 모델링 영향

- 후보와 근거: 멤버십 해지와 권한 회수 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 팀 멤버 제거 완료

- Screen ID: `sc_205004e1f31044eeb1a1e4693a3e85e5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_205004e1f31044eeb1a1e4693a3e85e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5ed75c2a-55db-4989-b67a-053b07f4fc2d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_cabb20c7541043ae92fb93dbfc992266` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 팀표5행에서4행. 우하단 Team member removed 토스트.
- 입력 항목·필수 표시·기본값: 대상 이메일 행 사라짐; 다른JonSmith행 유지.
- 버튼·메뉴·안내 문구: Invite Member, 남은행 메뉴.
- 확인된 상태: 제거 성공.
- 단계 간 변화: 제거 후4행과 성공 토스트

#### 동작과 데이터

- 화면 관찰: 선택 계정 단위로 제거됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 접근 차단·초대 토큰 폐기 미확인.

#### 모델링 영향

- 후보와 근거: 고유 멤버 식별자와 상태 전환 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 모달은 모든 프로젝트·문서 접근 회수를 안내한다. 문서 자체 삭제를 안내하지 않는다.
- 대기 초대 제거 이후 기존 초대 URL 유효성은 수록되지 않음.

## 6. 공식 도움말과 API 대조

- [사용자 권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai): 역할과 프로젝트 접근을 구분하며 초대 수락 후 접근한다. 현재 권한·요금 정책과 과거 캡처의 플랜 구성을 구분한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 팀 멤버십/초대 취소와 사용자 계정 삭제를 구분.
- 접근 회수와 과거 작성자·기여 이력 보존 후보.

## 8. 미확인 사항과 검토 질문

- 기존 초대 링크·열린 세션·배정 작업의 처리 검증.
- 가입 완료 사용자와 Owner 제거 시 메뉴 차이·좌석 과금 영향 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

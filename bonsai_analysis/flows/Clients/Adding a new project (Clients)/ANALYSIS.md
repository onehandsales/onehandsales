# Adding a new project (Clients) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `dd29b56e-cc30-4875-8f7b-302ca3909d05` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=dd29b56e-cc30-4875-8f7b-302ca3909d05) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

현재 고객을 문맥으로 사용해 프로젝트를 만들고 상세 요약을 확인한다.

- Doe Company 상세의 Projects +에서 진입하는 흐름이다.
- Projects 목록에서 만드는 흐름과 달리 이 모달에 고객 선택 입력이 없다.
- 최종 화면은 프로젝트 Overview 아래쪽 스크롤 상태다.

- 상위 분석: [Clients](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_7a2bb697a852495e8fd9be9fe6563b0a`](https://gummble.com/screens/sc_7a2bb697a852495e8fd9be9fe6563b0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 대표 이미지 교체 완료 | 고객 상세에서 New Project 모달을 연다. |
| 02 | [`sc_d0f7b82f653d46e993ad3108aba21bae`](https://gummble.com/screens/sc_d0f7b82f653d46e993ad3108aba21bae?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 문맥의 새 프로젝트 | Project Title이 Design Project에서 Design Project with Doe로 바뀐다. |
| 03 | [`sc_c659df491c354cd8bd910fec7f59f9c8`](https://gummble.com/screens/sc_c659df491c354cd8bd910fec7f59f9c8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 제목 수정 | 생성 후 고객 Doe Company와 연결된 프로젝트 Overview가 나타난다. |
| 04 | [`sc_adeac0011d87480980cfd58e53e4d751`](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 상세의 빈 개요 | 같은 Overview를 아래로 스크롤해 시간·사내 노트를 확인한다. |
| 05 | [`sc_6baf0c1661f749d39694f6350b4b6413`](https://gummble.com/screens/sc_6baf0c1661f749d39694f6350b4b6413?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 생성 프로젝트 요약 아래쪽 | 프로젝트 생성 확인 후 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 고객 대표 이미지 교체 완료

- Screen ID: `sc_7a2bb697a852495e8fd9be9fe6563b0a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7a2bb697a852495e8fd9be9fe6563b0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ae6fa3b5-203d-4dab-8914-192a4754559e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d0f7b82f653d46e993ad3108aba21bae`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고객명 왼쪽 이미지가 보라색 배경 인물 그림으로 교체. 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: 다른 고객 기본값과 빈 목록은 유지. 필수 입력 추가 없음.
- 버튼·메뉴·안내 문구: Your client has been successfully updated. 이미지 X와 상세 편집 버튼.
- 확인된 상태: 업로드 후 성공 표시. 이미지 원본 파일명은 보이지 않는다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 고객 대표 이미지 표시가 바뀌었고 업데이트 알림이 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 업로드 처리시간·영구 URL·압축·실패 복구 미확인.

#### 모델링 영향

- 후보와 근거: 고객 이미지 참조 변경 및 성공 알림. 미디어와 고객의 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 고객 문맥의 새 프로젝트

- Screen ID: `sc_d0f7b82f653d46e993ad3108aba21bae`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d0f7b82f653d46e993ad3108aba21bae?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d39e6ff5-0181-4b84-b3f9-c9123295d9bc.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_7a2bb697a852495e8fd9be9fe6563b0a` → 현재 → `sc_c659df491c354cd8bd910fec7f59f9c8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 배경 고객 상세를 어둡게 덮는 중앙 New Project 모달. 닫기 X는 외곽 우상단.
- 입력 항목·필수 표시·기본값: Project Title Design Project. Project Team Joe Doe. 고객 선택란과 별표는 보이지 않음.
- 버튼·메뉴·안내 문구: 하단 초록 Create Project, Contact Support 링크.
- 확인된 상태: 작성 중. Design Project가 시스템 기본값인지는 미확인.
- 단계 간 변화: 고객 상세에서 New Project 모달을 연다.

#### 동작과 데이터

- 화면 관찰: 현재 고객 문맥을 유지한 채 프로젝트 생성 폼이 열렸다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제목 초기값 출처·팀 변경·취소 시 보존 미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트 생성 입력과 호출 문맥의 고객 ID 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 제목 수정

- Screen ID: `sc_c659df491c354cd8bd910fec7f59f9c8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c659df491c354cd8bd910fec7f59f9c8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c420096e-827c-4983-8de7-172e9181bb0d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d0f7b82f653d46e993ad3108aba21bae` → 현재 → `sc_adeac0011d87480980cfd58e53e4d751`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Project 모달 구조 유지.
- 입력 항목·필수 표시·기본값: Project Title Design Project with Doe로 변경. Joe Doe 팀원 유지.
- 버튼·메뉴·안내 문구: Create Project와 외곽 X.
- 확인된 상태: 생성 전 제목 작성 완료.
- 단계 간 변화: Project Title이 Design Project에서 Design Project with Doe로 바뀐다.

#### 동작과 데이터

- 화면 관찰: 제목만 바뀐 것이 화면으로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 중복 제목·공백·길이 제한 미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트 표시 이름과 고유 ID 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 상세의 빈 개요

- Screen ID: `sc_adeac0011d87480980cfd58e53e4d751`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4562b3e8-1ba5-461e-81bd-766674cf2aed.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c659df491c354cd8bd910fec7f59f9c8` → 현재 → `sc_6baf0c1661f749d39694f6350b4b6413`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 본문 좌측 Tasks와 Recent Activity, 우측 Documents & Links, Invoices/Expenses 요약 카드.
- 입력 항목·필수 표시·기본값: Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0.
- 버튼·메뉴·안내 문구: Tasks 새 작업/템플릿, 각 영역+; Send Email, Forwarding Email, Automations.
- 확인된 상태: 프로젝트 생성 활동1개와 빈 업무 영역.
- 단계 간 변화: 생성 후 고객 Doe Company와 연결된 프로젝트 Overview가 나타난다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 생성 이력에 주체·제목·시각이 표시된다. 이메일 발송은 실행하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 생성 프로젝트 요약 아래쪽

- Screen ID: `sc_6baf0c1661f749d39694f6350b4b6413`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6baf0c1661f749d39694f6350b4b6413?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/22d48b8f-102a-453b-b014-e500a8fda74a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_adeac0011d87480980cfd58e53e4d751` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Overview 하단. 왼쪽 Recent Activity, 오른쪽 Invoices/Expenses/Time Tracking/Your Notes 카드.
- 입력 항목·필수 표시·기본값: 금액 모두 $0.00, 시간 Unbilled/Billed 00:00:00, Notes 비어 있음.
- 버튼·메뉴·안내 문구: Send Email·Forwarding Email·각 카드 +·Your Notes Edit.
- 확인된 상태: 신규 프로젝트의 빈 집계 상태. Your Notes에 회사 내부 공개 안내.
- 단계 간 변화: 같은 Overview를 아래로 스크롤해 시간·사내 노트를 확인한다.

#### 동작과 데이터

- 화면 관찰: 생성 활동은 유지되고 집계·내부 노트 영역이 추가로 드러남.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 시간 집계 반올림·통화·노트 작성권한은 미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트 집계 뷰, 내부 노트와 공유 콘텐츠의 공개 범위 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] New Project는 제목과 Project Team Joe Doe를 표시한다. 고객은 진입 문맥으로 연결되어 보인다.
- [관찰] 생성 결과 New Lead이며 목록 경로의 다른 샘플은 In Progress였다. 기본 상태를 하나로 확정하지 않는다.
- [관찰] Your Notes는 회사에만 보인다는 안내가 있다. 모든 노트를 고객과 공유한다고 가정하지 않는다.

## 6. 공식 도움말과 API 대조

- [All about Projects](https://help.hellobonsai.com/en/articles/12783206-all-about-projects): 프로젝트가 작업·시간·청구·비용·문서·팀을 묶는 업무 단위임을 대조했다. 현재 문서의 새 탭 구성과 캡처의 탭 구성은 버전 차이를 유지한다.
- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 프로젝트-고객 연결, 제목, 팀 참여, 보드 상태, 생성 활동 후보.
- 프로젝트의 내부 노트와 고객 공유 메시지·문서를 구분하는 공개 범위 후보.
- 청구·비용·시간 합계는 서로 다른 연결 데이터의 집계 후보이며 하나의 금액 필드로 합치지 않는다.

## 8. 미확인 사항과 검토 질문

- 진입 고객을 변경할 수 있는 경로와 초기 보드 상태 결정 규칙은 무엇인가? 두 생성 경로를 같은 조건으로 재현해야 한다.
- 모달의 Design Project가 기본값인지 앞서 입력한 값인지 시작 직후 캡처가 필요하다.
- 팀원 추가 시 고객 포털 노출·요금제 권한이 어떻게 적용되는지 별도 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

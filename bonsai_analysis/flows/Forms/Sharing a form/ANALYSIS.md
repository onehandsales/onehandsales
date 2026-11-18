# Sharing a form 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `93ea3af8-3cce-49ec-aaa0-b7d4e9676924` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=93ea3af8-3cce-49ec-aaa0-b7d4e9676924) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 8개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

폼을 공개 링크·임베드·이메일로 공유하는 방법을 확인한다.

- 편집기에서 Share Form 모달을 열고 공개 URL을 복사한 뒤 이메일 발송 성공까지 확인한다.
- 우리가 실제 링크 복사/이메일 발송을 수행한 것이 아니라 Gummble 캡처를 관찰한 기록이다.

- 상위 분석: [Forms](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Forms/Sharing a form`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_56bf12a78bd64f6b972ecb048efd8d14`](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 편집기 상단](<screens/01_sc_56bf12a78bd64f6b972ecb048efd8d14.png>) | Share Form으로 모달을 연다. |
| 02 | [`sc_43b93e37ca07400f94130a072aff0537`](https://gummble.com/screens/sc_43b93e37ca07400f94130a072aff0537?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [공개 링크 공유](<screens/02_sc_43b93e37ca07400f94130a072aff0537.png>) | Copy This Link를 선택한다. |
| 03 | [`sc_7cf32d86d1ca4f53a410a2a2b8e58f65`](https://gummble.com/screens/sc_7cf32d86d1ca4f53a410a2a2b8e58f65?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [공개 링크 복사 성공](<screens/03_sc_7cf32d86d1ca4f53a410a2a2b8e58f65.png>) | 복사 성공 후 Embed Code 탭으로 전환한다. |
| 04 | [`sc_56352588947d481d99cf169e30714abf`](https://gummble.com/screens/sc_56352588947d481d99cf169e30714abf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [임베드 코드](<screens/04_sc_56352588947d481d99cf169e30714abf.png>) | Send Email 탭으로 전환한다. |
| 05 | [`sc_d2ad07d286ed411a86e9d163d7f0fc5b`](https://gummble.com/screens/sc_d2ad07d286ed411a86e9d163d7f0fc5b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이메일 공유 초기 상태](<screens/05_sc_d2ad07d286ed411a86e9d163d7f0fc5b.png>) | 고객과 선택 프로젝트를 지정한다. |
| 06 | [`sc_afc35cce33e44ef591b2bd4bce18c3f2`](https://gummble.com/screens/sc_afc35cce33e44ef591b2bd4bce18c3f2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객·프로젝트 지정](<screens/06_sc_afc35cce33e44ef591b2bd4bce18c3f2.png>) | 선택 메시지를 입력한다. |
| 07 | [`sc_75e4b74d37184da0a5b3e6b6db0360ae`](https://gummble.com/screens/sc_75e4b74d37184da0a5b3e6b6db0360ae?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이메일 메시지 작성](<screens/07_sc_75e4b74d37184da0a5b3e6b6db0360ae.png>) | Send form 후 성공 알림이 나타난다. |
| 08 | [`sc_a008e54e512349bfab1962125ca145e0`](https://gummble.com/screens/sc_a008e54e512349bfab1962125ca145e0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 이메일 발송 성공](<screens/08_sc_a008e54e512349bfab1962125ca145e0.png>) | 편집기로 복귀한다. |

## 4. 화면별 상세 분석

### 단계 01 — 폼 편집기 상단

- Screen ID: `sc_56bf12a78bd64f6b972ecb048efd8d14`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cffd3242-bc9f-4d5b-89c4-617f504f36b3.png)
- 로컬 이미지: [01_sc_56bf12a78bd64f6b972ecb048efd8d14.png](<screens/01_sc_56bf12a78bd64f6b972ecb048efd8d14.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_43b93e37ca07400f94130a072aff0537`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Forms/Create/Responses 및 작업 버튼. 왼쪽 배경 헤더+흰 폼 카드, 오른쪽 Content/Settings 패널.
- 입력 항목·필수 표시·기본값: Graphic Design Brief 제목/설명, Add An Image; First Name/Last Name(회색 Jane/Smith), Email(예시 이메일), 사업 웹사이트 URL 질문.
- 버튼·메뉴·안내 문구: Preview, Automation, Share Form, …; Content 타입: Short/Long Text, Number, Single/Multiple Choice, Date Select, Custom Content, Files Download/Upload, Dropdown, Star Rating, Website.
- 확인된 상태: Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 폼 정의 편집 화면이며 응답은 아직 입력되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 화면 아래 타입·Settings 내용·제목 편집 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 연락처 영역·일반 질문·콘텐츠 요소·브랜드 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 공개 링크 공유

- Screen ID: `sc_43b93e37ca07400f94130a072aff0537`
- 원본: [화면 페이지](https://gummble.com/screens/sc_43b93e37ca07400f94130a072aff0537?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d644a570-77fb-4f23-89ff-1ec26b4e2b71.png)
- 로컬 이미지: [02_sc_43b93e37ca07400f94130a072aff0537.png](<screens/02_sc_43b93e37ca07400f94130a072aff0537.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_56bf12a78bd64f6b972ecb048efd8d14` → 현재 → `sc_7cf32d86d1ca4f53a410a2a2b8e58f65`

#### 화면에서 직접 확인한 내용

- 레이아웃: Share Your Form 모달 상단 3개 탭.
- 입력 항목·필수 표시·기본값: Public Link 선택. app.hellobonsai.com/f/… URL이 가로로 잘려 보인다.
- 버튼·메뉴·안내 문구: Copy This Link, Embed Code, Send Email, X.
- 확인된 상태: 응답을 받기 위한 공개 링크 안내.
- 단계 간 변화: Share Form으로 모달을 연다.

#### 동작과 데이터

- 화면 관찰: 공개 공유 주소가 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잘린 전체 주소와 링크 권한·만료는 미확인. 토큰을 임의 복원하지 않는다.

#### 모델링 영향

- 후보와 근거: 공유 토큰·채널 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 공개 링크 복사 성공

- Screen ID: `sc_7cf32d86d1ca4f53a410a2a2b8e58f65`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7cf32d86d1ca4f53a410a2a2b8e58f65?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9d9c3f19-2ba7-4f26-bf31-e4cd818e3b2f.png)
- 로컬 이미지: [03_sc_7cf32d86d1ca4f53a410a2a2b8e58f65.png](<screens/03_sc_7cf32d86d1ca4f53a410a2a2b8e58f65.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_43b93e37ca07400f94130a072aff0537` → 현재 → `sc_56352588947d481d99cf169e30714abf`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 모달과 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: URL 유지.
- 버튼·메뉴·안내 문구: Copy This Link와 탭들, 토스트 X.
- 확인된 상태: Your link has been copied.
- 단계 간 변화: Copy This Link를 선택한다.

#### 동작과 데이터

- 화면 관찰: 캡처상 클립보드 복사 성공 안내를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 클립보드 내용은 조회하지 않았다.

#### 모델링 영향

- 후보와 근거: 복사는 문서/응답 생성 이벤트와 다르다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 임베드 코드

- Screen ID: `sc_56352588947d481d99cf169e30714abf`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56352588947d481d99cf169e30714abf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/95f82ce9-8df1-49b8-b52d-f5ec9f25bdcf.png)
- 로컬 이미지: [04_sc_56352588947d481d99cf169e30714abf.png](<screens/04_sc_56352588947d481d99cf169e30714abf.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7cf32d86d1ca4f53a410a2a2b8e58f65` → 현재 → `sc_d2ad07d286ed411a86e9d163d7f0fc5b`

#### 화면에서 직접 확인한 내용

- 레이아웃: Embed Code 탭에 Customize와 코드 영역.
- 입력 항목·필수 표시·기본값: Hide header off. iframe의 embed=true, width/height 100%, min-height600px, border none이 보인다.
- 버튼·메뉴·안내 문구: Hide header 토글, Copy to clipboard, 다른 탭, X.
- 확인된 상태: 이전 링크 복사 토스트가 남아 있다. 이를 임베드 복사 성공으로 보지 않는다.
- 단계 간 변화: 복사 성공 후 Embed Code 탭으로 전환한다.

#### 동작과 데이터

- 화면 관찰: 임베드용 출력 코드 및 표시 옵션이 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Hide header 변경 후 코드/공개 페이지 영향은 미확인.

#### 모델링 영향

- 후보와 근거: 공유 표시 옵션과 URL 파라미터 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 이메일 공유 초기 상태

- Screen ID: `sc_d2ad07d286ed411a86e9d163d7f0fc5b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d2ad07d286ed411a86e9d163d7f0fc5b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5091d7a6-62f8-4062-a850-b8f50eede9fb.png)
- 로컬 이미지: [05_sc_d2ad07d286ed411a86e9d163d7f0fc5b.png](<screens/05_sc_d2ad07d286ed411a86e9d163d7f0fc5b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_56352588947d481d99cf169e30714abf` → 현재 → `sc_afc35cce33e44ef591b2bd4bce18c3f2`

#### 화면에서 직접 확인한 내용

- 레이아웃: Send Email 탭의 세로 입력 폼.
- 입력 항목·필수 표시·기본값: Client Select…; Email Message(Optional) 회색 기본 안내. Project는 아직 없다.
- 버튼·메뉴·안내 문구: Send form, Client 선택, X, Contact Support.
- 확인된 상태: 수신 고객이 미선택 상태.
- 단계 간 변화: Send Email 탭으로 전환한다.

#### 동작과 데이터

- 화면 관찰: 이메일 전송 준비만 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미선택 발송 시 검증·회색 안내의 기본 메시지 전송 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 발송 대상과 선택 메시지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 고객·프로젝트 지정

- Screen ID: `sc_afc35cce33e44ef591b2bd4bce18c3f2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_afc35cce33e44ef591b2bd4bce18c3f2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/561a28d9-33c2-4260-8173-3cae8c3c9942.png)
- 로컬 이미지: [06_sc_afc35cce33e44ef591b2bd4bce18c3f2.png](<screens/06_sc_afc35cce33e44ef591b2bd4bce18c3f2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d2ad07d286ed411a86e9d163d7f0fc5b` → 현재 → `sc_75e4b74d37184da0a5b3e6b6db0360ae`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 모달에 Project 필드가 추가된다.
- 입력 항목·필수 표시·기본값: Client Doe Company, Project(Optional) Rebranding Project, Email Message(Optional) 회색 안내.
- 버튼·메뉴·안내 문구: 프로젝트 선택 해제 X, 드롭다운, Send form.
- 확인된 상태: 고객 선택 후 연결 프로젝트가 표시된다.
- 단계 간 변화: 고객과 선택 프로젝트를 지정한다.

#### 동작과 데이터

- 화면 관찰: 고객과 프로젝트를 별도로 지정할 수 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객 변경 시 프로젝트 초기화·수신 연락처 선정은 미확인.

#### 모델링 영향

- 후보와 근거: 고객 참조와 선택 프로젝트 참조 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 이메일 메시지 작성

- Screen ID: `sc_75e4b74d37184da0a5b3e6b6db0360ae`
- 원본: [화면 페이지](https://gummble.com/screens/sc_75e4b74d37184da0a5b3e6b6db0360ae?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bc9703d8-3cbb-4bdb-b38c-755fe1427b3d.png)
- 로컬 이미지: [07_sc_75e4b74d37184da0a5b3e6b6db0360ae.png](<screens/07_sc_75e4b74d37184da0a5b3e6b6db0360ae.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_afc35cce33e44ef591b2bd4bce18c3f2` → 현재 → `sc_a008e54e512349bfab1962125ca145e0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 메시지 입력 영역에 포커스.
- 입력 항목·필수 표시·기본값: Doe Company/Rebranding Project 유지; Hi Jane, can we talk more about this project? 입력.
- 버튼·메뉴·안내 문구: Send form, X.
- 확인된 상태: 회색 안내가 실제 사용자 메시지로 바뀌었다.
- 단계 간 변화: 선택 메시지를 입력한다.

#### 동작과 데이터

- 화면 관찰: 발송 메시지 입력 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿·서식·길이 제한은 미확인.

#### 모델링 영향

- 후보와 근거: 발송 당시 메시지 스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 폼 이메일 발송 성공

- Screen ID: `sc_a008e54e512349bfab1962125ca145e0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a008e54e512349bfab1962125ca145e0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/21aa221b-207a-48c2-98bb-e97594b73257.png)
- 로컬 이미지: [08_sc_a008e54e512349bfab1962125ca145e0.png](<screens/08_sc_a008e54e512349bfab1962125ca145e0.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_75e4b74d37184da0a5b3e6b6db0360ae` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달이 닫히고 편집기. 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: 폼 제목·기본 필드 유지. 로고 이미지가 이제 표시된다.
- 버튼·메뉴·안내 문구: Share Form, Preview, Automation, …, 로고 제거 X.
- 확인된 상태: You've successfully sent your form. 로고 추가 과정은 중간 기록에 없다.
- 단계 간 변화: Send form 후 성공 알림이 나타난다.

#### 동작과 데이터

- 화면 관찰: 발송 요청 성공 안내만 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 수신·열람·제출 여부, 로고 변경 원인은 미확인.

#### 모델링 영향

- 후보와 근거: 발송 상태와 응답 제출 상태를 분리할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 링크 복사는 성공 토스트가 있다. 임베드 코드 복사 실행은 별도 증거가 없다.
- [관찰] 이메일 방식은 Client와 선택 Project/Message를 받는다. 고객을 고르기 전에는 Project가 보이지 않는다.
- [관찰] Hide header는 임베드 옵션이며 현재 꺼져 있다.
- [미확인] 성공 토스트만으로 수신함 도착·열람·응답을 확정하지 않는다.
- [미확인] 첫 화면 Add An Image가 마지막에 로고로 바뀌지만 업로드 과정은 없다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 공개 링크, 임베드, 고객 이메일 및 선택 메시지 공유를 설명한다.
- [공개 API 문서](https://docs.hellobonsai.com/api): 검토한 공개 리소스 목록에서 Forms/Questions/Responses 전용 endpoint와 필드 계약을 확인하지 못했다. Documents API를 폼 API로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 폼 정의와 공유 채널·대상 고객/프로젝트·메시지·발송 결과·공개 링크를 구분할 후보.
- 임베드 표시 옵션과 폼 자체 브랜드 설정의 범위를 구분할 후보.

## 8. 미확인 사항과 검토 질문

- 한 고객의 여러 연락처 중 실제 수신자 선택 규칙, 이메일 재발송/실패/중복을 확인한다.
- 공개 링크 만료·비활성화·토큰 재발급·로그인 요구 여부를 확인한다.
- 프로젝트 선택이 응답 연결에 적용되는 방식과 public/embed의 고객 식별 규칙을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

# Enable client mode 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **2/2단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `3dce7a57-e3a1-4fd6-944a-3f547b30def6` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=3dce7a57-e3a1-4fd6-944a-3f547b30def6) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 2단계 / 2단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 2개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

Contractor 모드에서 Dual-Mode 활성화를 시도할 때 제시되는 Business 업그레이드 진입을 확인한다.

- 이름은 Enable client mode지만 실제 활성화 완료 화면은 없다.
- 고객 포털 설정과 다른 화면이다.

- 상위 분석: [Settings](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings/Enable client mode`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_35ec0f745e63437994f49c24aa5aa8bb`](https://gummble.com/screens/sc_35ec0f745e63437994f49c24aa5aa8bb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Client Mode — Contractor](<screens/01_sc_35ec0f745e63437994f49c24aa5aa8bb.png>) | Business 플랜 선택 화면 |
| 02 | [`sc_41a882a9a9a04d89ad41ea4c428eaf2d`](https://gummble.com/screens/sc_41a882a9a9a04d89ad41ea4c428eaf2d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Business 전용 플랜 선택](<screens/02_sc_41a882a9a9a04d89ad41ea4c428eaf2d.png>) | 선택 전 종료; 활성화 미확인 |

## 4. 화면별 상세 분석

### 단계 01 — Client Mode — Contractor

- Screen ID: `sc_35ec0f745e63437994f49c24aa5aa8bb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_35ec0f745e63437994f49c24aa5aa8bb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/699a6892-0949-433f-91b8-40c95ea5363c.png)
- 로컬 이미지: [01_sc_35ec0f745e63437994f49c24aa5aa8bb.png](<screens/01_sc_35ec0f745e63437994f49c24aa5aa8bb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_41a882a9a9a04d89ad41ea4c428eaf2d`

#### 화면에서 직접 확인한 내용

- 레이아웃: Account 하위 Client Mode 카드, 왕관 아이콘.
- 입력 항목·필수 표시·기본값: Account mode Contractor. 입력 필드 없음.
- 버튼·메뉴·안내 문구: Enable Dual-Mode. 고객 모드에서는 고객 입장 계약 관리와 지급을 할 수 있다는 설명.
- 확인된 상태: Contractor 기본 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 이 계정이 고객과 공급자 양쪽 역할을 수행하는 모드 전환 진입.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클라이언트 포털 접근과 동일 개념인지·플랜 제한 미확인.

#### 모델링 영향

- 후보와 근거: 계정의 사용 모드와 고객 포털 권한을 별개 후보로 검토.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Business 전용 플랜 선택

- Screen ID: `sc_41a882a9a9a04d89ad41ea4c428eaf2d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_41a882a9a9a04d89ad41ea4c428eaf2d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/66ccba2e-dd20-49aa-a3f6-9029d15d766f.png)
- 로컬 이미지: [02_sc_41a882a9a9a04d89ad41ea4c428eaf2d.png](<screens/02_sc_41a882a9a9a04d89ad41ea4c428eaf2d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_35ec0f745e63437994f49c24aa5aa8bb` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체 화면 흰 배경, 양쪽 식물 장식, 중앙 Business 카드1개. 좌상단 로고 우상단 X.
- 입력 항목·필수 표시·기본값: 가격 입력 없음. Business가 체크 표시로 선택됨.
- 버튼·메뉴·안내 문구: Choose Business; Subcontractor Management/Onboarding/Payments/Unlimited Subcontractors 목록.
- 확인된 상태: 업그레이드 선택 단계, 결제 폼 없음.
- 단계 간 변화: Business 플랜 선택 화면

#### 동작과 데이터

- 화면 관찰: 기능 진입이 플랜 선택으로 연결됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 구매 결과와 고객 모드 활성 상태 미확인.

#### 모델링 영향

- 후보와 근거: 요금제별 기능 자격 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 캡처에서는 Enable Dual-Mode 다음에 Business만 제시된다.
- 계정 모드 변경·구독 결제 완료를 확인하지 못했다.

## 6. 공식 도움말과 API 대조

- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.
- [구독 도움말 목록](https://help.hellobonsai.com/en/collections/96965-subscription-account-settings): 현재 구독 문서와 대조해야 하며, 이 과거 Client Mode의 정확한 자격 조건은 조회 자료에서 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 기능 자격 확인·플랜 업그레이드 진입·계정 모드 상태를 분리하는 후보.

## 8. 미확인 사항과 검토 질문

- Business 구매 이후 Dual-Mode가 자동 활성화되는지 후속 화면 필요.
- Client Mode와 외주 멤버·수신자 포털 관계 및 현재 기능 존속 여부 확인 필요.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 2개와 실제 이미지 2개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 2단계 재조회 및 원본 2개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

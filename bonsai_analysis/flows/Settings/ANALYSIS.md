# Settings 플로우 분석

검토 상태: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **12/12단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `fe127bb6-984a-4b25-927f-4186b6650743` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=fe127bb6-984a-4b25-927f-4186b6650743) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 12단계 / 12단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | 2026-11-20 KST 조회. 6절에서 기능별 직접 대조 범위·미확인 범위 및 [공통 출처](<../../SOURCES.md>) 연결 |
| 원본·문서 무결성 | MCP 단계 ID·순서·원본 URL 대조, 로컬 PNG 디코딩·크기·CDN 원본과 SHA-256 대조. [전체 검토 기록](<../../review/2026-11-20/REPORT.md>) |

## 2. 플로우 목적과 연결

운영자가 개인 프로필, 운영 회사, 메시지·알림, 브랜딩, 팀, 연동, 구독 설정 영역을 탐색한다. 이 루트는 여러 탭의 개요이며 하나의 연속 저장 작업이 아니다.

- 대시보드 우측 프로필 메뉴에서 Settings로 진입한다.
- Client Portal 메뉴는 보이지만 해당 패널은 이 루트에 없다. 하위 플로우와 고객 포털 분석을 함께 대조한다.
- 구독 화면은 이미 해지 예약된 Starter 계정이며 현재 가격표로 사용하지 않는다.

- 하위 흐름: [Deleting account](Deleting%20account/ANALYSIS.md), [Enable client mode](Enable%20client%20mode/ANALYSIS.md), [Editing branding settings](Editing%20branding%20settings/ANALYSIS.md), [Uploading profile picture](Uploading%20profile%20picture/ANALYSIS.md), [Editing notification settings](Editing%20notification%20settings/ANALYSIS.md), [Importing a CSV](Importing%20a%20CSV/ANALYSIS.md), [Removing a user](Removing%20a%20user/ANALYSIS.md), [Disabling public profile](Disabling%20public%20profile/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 상위 흐름: 없음. Gummble 최상위 분류.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **대시보드 프로필 메뉴**이다. 메뉴가 열린 정상 상태. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **Subscription — 기능과 Tax**이다. 플랜별 문서/CRM/자동화/브랜딩/하도급 기능 구분. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Deleting account](<Deleting account/ANALYSIS.md>), [Disabling public profile](<Disabling public profile/ANALYSIS.md>), [Editing branding settings](<Editing branding settings/ANALYSIS.md>), [Subscribing to Starter plan](<../Subscribing to Starter plan/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_25261ff6e5d44d70885c07b053f29685`](https://gummble.com/screens/sc_25261ff6e5d44d70885c07b053f29685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 프로필 메뉴](<screens/01_sc_25261ff6e5d44d70885c07b053f29685.png>) | Profile Settings — Profile Settings 선택. 개인 사진은 이니셜 상태. |
| 02 | [`sc_f81cdd742f9d4d09b96c9de95c4d0390`](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Profile Settings](<screens/02_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>) | Company Settings — 공개 프로필과 주소 — 공개 프로필 활성. 주소의 Singapore가 여러 줄에 중복 표시. |
| 03 | [`sc_33fdc633ac3c432eb0934dddfe05a1f7`](https://gummble.com/screens/sc_33fdc633ac3c432eb0934dddfe05a1f7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Company Settings — 공개 프로필과 주소](<screens/03_sc_33fdc633ac3c432eb0934dddfe05a1f7.png>) | Default Client Messages — 이메일 본문에 기본 개인화 메시지를 넣는다는 안내. 계약 영역은 화면 밖. |
| 04 | [`sc_e9ce751aa491433ebc421be43501cc07`](https://gummble.com/screens/sc_e9ce751aa491433ebc421be43501cc07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Default Client Messages](<screens/04_sc_e9ce751aa491433ebc421be43501cc07.png>) | Notifications & Alerts — 브라우저 권한 창은 없다. |
| 05 | [`sc_5ed82da31d4542d1971fce527dc0584d`](https://gummble.com/screens/sc_5ed82da31d4542d1971fce527dc0584d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Notifications & Alerts](<screens/05_sc_5ed82da31d4542d1971fce527dc0584d.png>) | Client Mode — Contractor — Contractor 기본 상태. |
| 06 | [`sc_35ec0f745e63437994f49c24aa5aa8bb`](https://gummble.com/screens/sc_35ec0f745e63437994f49c24aa5aa8bb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Client Mode — Contractor](<screens/06_sc_35ec0f745e63437994f49c24aa5aa8bb.png>) | Two-factor Authentication — 이메일 방식이 선택됨. 실제 코드 입력이나 설정 변경 없음. |
| 07 | [`sc_fbb3e484b00c48e4963ee43bbe214b80`](https://gummble.com/screens/sc_fbb3e484b00c48e4963ee43bbe214b80?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Two-factor Authentication](<screens/07_sc_fbb3e484b00c48e4963ee43bbe214b80.png>) | Brand Settings — 새로 만드는 문서에만 변경 적용 안내. 샘플 invoice1001. |
| 08 | [`sc_a2d30da474bc43909f17e726b0559b83`](https://gummble.com/screens/sc_a2d30da474bc43909f17e726b0559b83?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Brand Settings](<screens/08_sc_a2d30da474bc43909f17e726b0559b83.png>) | Team 목록 — 초대 대기와 가입 완료가 공존. 화면 표시 날짜는2024년2월. |
| 09 | [`sc_c3ed26151c6f4f72b154852639f26757`](https://gummble.com/screens/sc_c3ed26151c6f4f72b154852639f26757?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Team 목록](<screens/09_sc_c3ed26151c6f4f72b154852639f26757.png>) | Integrations & Data 목록 — 스크롤 상단. Import 영역은 아직 보이지 않음. |
| 10 | [`sc_b8ed116f56354559846a960779fa7c5d`](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Integrations & Data 목록](<screens/10_sc_b8ed116f56354559846a960779fa7c5d.png>) | Subscription — 해지 예약 — 현재 결제 기간 말 종료 예약됨. 유효 플랜 Starter가 계속 표시. |
| 11 | [`sc_e7be88f9e1fa42c28bf8dc0b9f1368a9`](https://gummble.com/screens/sc_e7be88f9e1fa42c28bf8dc0b9f1368a9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Subscription — 해지 예약](<screens/11_sc_e7be88f9e1fa42c28bf8dc0b9f1368a9.png>) | Subscription — 기능과 Tax — 플랜별 문서/CRM/자동화/브랜딩/하도급 기능 구분. |
| 12 | [`sc_837573dab00e42459af5990de3b28044`](https://gummble.com/screens/sc_837573dab00e42459af5990de3b28044?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Subscription — 기능과 Tax](<screens/12_sc_837573dab00e42459af5990de3b28044.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 프로필 메뉴

- Screen ID: `sc_25261ff6e5d44d70885c07b053f29685`
- 원본: [화면 페이지](https://gummble.com/screens/sc_25261ff6e5d44d70885c07b053f29685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8d2c0c65-3033-4e0f-90e9-39aa0de970ef.png)
- 로컬 이미지: [01_sc_25261ff6e5d44d70885c07b053f29685.png](<screens/01_sc_25261ff6e5d44d70885c07b053f29685.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 103, 고유 이미지 S409, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f81cdd742f9d4d09b96c9de95c4d0390`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 앱 사이드바, 우측 상단 아바타 아래 흰색 드롭다운. 배경에 프로젝트 타임라인과 손익 그래프.
- 입력 항목·필수 표시·기본값: 입력 없음. Joe Studio 계정 표시.
- 버튼·메뉴·안내 문구: Help Center, Perks, Team, Subscription, Settings, Logout.
- 확인된 상태: 메뉴가 열린 정상 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 설정과 팀·구독으로 직접 이동하는 진입점이 있다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메뉴 항목별 역할 권한과 이동 URL 미확인.

#### 모델링 영향

- 후보와 근거: 계정 메뉴 라우팅과 워크스페이스 표시 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 메뉴 항목별 역할 권한과 이동 URL 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Profile Settings

- Screen ID: `sc_f81cdd742f9d4d09b96c9de95c4d0390`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8881986d-5358-4529-a8dc-52332465d205.png)
- 로컬 이미지: [02_sc_f81cdd742f9d4d09b96c9de95c4d0390.png](<screens/02_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 136, 고유 이미지 S542, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_25261ff6e5d44d70885c07b053f29685` → 현재 → `sc_33fdc633ac3c432eb0934dddfe05a1f7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 5개 탭, Account 내부 왼쪽 7개 세부 메뉴, 오른쪽 프로필 카드와 하단 Delete Account 일부.
- 입력 항목·필수 표시·기본값: First name Joe, Last name Doe, Email, Title의 회색 Operations Director 예시. JD 아바타와 제거 X. 별표 없음.
- 버튼·메뉴·안내 문구: Save Changes, Update Password 접기/펼치기.
- 확인된 상태: Profile Settings 선택. 개인 사진은 이니셜 상태.
- 단계 간 변화: Settings 프로필 패널로 이동 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 개인 이름·로그인 이메일·직함과 사진을 수정하는 화면. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인.

#### 모델링 영향

- 후보와 근거: 개인 프로필과 인증정보 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Company Settings — 공개 프로필과 주소

- Screen ID: `sc_33fdc633ac3c432eb0934dddfe05a1f7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33fdc633ac3c432eb0934dddfe05a1f7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6334edc6-4ba5-4953-86f3-4f95e2e23710.png)
- 로컬 이미지: [03_sc_33fdc633ac3c432eb0934dddfe05a1f7.png](<screens/03_sc_33fdc633ac3c432eb0934dddfe05a1f7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 136, 고유 이미지 S543, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f81cdd742f9d4d09b96c9de95c4d0390` → 현재 → `sc_e9ce751aa491433ebc421be43501cc07`

#### 화면에서 직접 확인한 내용

- 레이아웃: Account 내부 Company Settings 선택. 회사명·담당자 2열, 공개 프로필/URL, 국가/주소 2열.
- 입력 항목·필수 표시·기본값: Company Name Joe Studio, Company Contact Joe Doe, Public Profile Enabled, URL joe-doe-10, Country Singapore. 주소 카드.
- 버튼·메뉴·안내 문구: Save Changes, Enabled/Disabled, View Profile. 회사명 비우면 사용자 이름 사용 안내.
- 확인된 상태: 공개 프로필 활성. 주소의 Singapore가 여러 줄에 중복 표시.
- 단계 간 변화: Company Settings로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 운영 회사 이름·대표 연락 담당자·공개 URL·주소를 함께 관리. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 공개 URL 중복 검증 및 담당자 선택 범위 미확인.

#### 모델링 영향

- 후보와 근거: 운영 회사 설정과 공개 프로필 가시성·slug 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 공개 URL 중복 검증 및 담당자 선택 범위 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Default Client Messages

- Screen ID: `sc_e9ce751aa491433ebc421be43501cc07`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e9ce751aa491433ebc421be43501cc07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5e8467e5-e45d-4c38-a0a5-ee0738a6c0af.png)
- 로컬 이미지: [04_sc_e9ce751aa491433ebc421be43501cc07.png](<screens/04_sc_e9ce751aa491433ebc421be43501cc07.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 136, 고유 이미지 S544, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_33fdc633ac3c432eb0934dddfe05a1f7` → 현재 → `sc_5ed82da31d4542d1971fce527dc0584d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 기본 메시지 카드에 설명과 긴 textarea들이 세로 배치.
- 입력 항목·필수 표시·기본값: Default invoice message와 Default proposal message. 이메일·회사명·개인명 포함된 회색 예문; 입력값인지 placeholder인지 이미지 단독으로 불명.
- 버튼·메뉴·안내 문구: Save changes, More information here.
- 확인된 상태: 이메일 본문에 기본 개인화 메시지를 넣는다는 안내. 계약 영역은 화면 밖.
- 단계 간 변화: 기본 고객 메시지로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 발송 문서 유형별 기본 메시지 구분. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 변수·자동 치환·사용자 편집 여부 미확인.

#### 모델링 영향

- 후보와 근거: 문서 종류별 기본 본문 후보; 변수 지원을 가정하지 않음. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 템플릿 변수·자동 치환·사용자 편집 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Notifications & Alerts

- Screen ID: `sc_5ed82da31d4542d1971fce527dc0584d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5ed82da31d4542d1971fce527dc0584d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/edf60083-6b0c-4f58-8daa-ef41461d5905.png)
- 로컬 이미지: [05_sc_5ed82da31d4542d1971fce527dc0584d.png](<screens/05_sc_5ed82da31d4542d1971fce527dc0584d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 137, 고유 이미지 S545, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e9ce751aa491433ebc421be43501cc07` → 현재 → `sc_35ec0f745e63437994f49c24aa5aa8bb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 체크박스 5개, 구분선 아래 브라우저 알림과 타이머 임계값.
- 입력 항목·필수 표시·기본값: 앱 알림/리마인더, 프리랜싱 팁, 새 기능, 구독 결제 문제, 작업 기한 알림 모두 체크. 아래 360 minutes 일부 보임.
- 버튼·메뉴·안내 문구: Save Changes, Enable desktop notifications.
- 확인된 상태: 브라우저 권한 창은 없다.
- 단계 간 변화: Notifications & Alerts로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 이메일 성격의 항목들과 브라우저 알림 진입이 분리됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 체크 항목별 전송 채널과 임계값 최소·최대 미확인.

#### 모델링 영향

- 후보와 근거: 알림 종류별 선호와 브라우저 권한, 타이머 임계값 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 체크 항목별 전송 채널과 임계값 최소·최대 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Client Mode — Contractor

- Screen ID: `sc_35ec0f745e63437994f49c24aa5aa8bb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_35ec0f745e63437994f49c24aa5aa8bb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/699a6892-0949-433f-91b8-40c95ea5363c.png)
- 로컬 이미지: [06_sc_35ec0f745e63437994f49c24aa5aa8bb.png](<screens/06_sc_35ec0f745e63437994f49c24aa5aa8bb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 137, 고유 이미지 S546, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5ed82da31d4542d1971fce527dc0584d` → 현재 → `sc_fbb3e484b00c48e4963ee43bbe214b80`

#### 화면에서 직접 확인한 내용

- 레이아웃: Account 하위 Client Mode 카드, 왕관 아이콘.
- 입력 항목·필수 표시·기본값: Account mode Contractor. 입력 필드 없음.
- 버튼·메뉴·안내 문구: Enable Dual-Mode. 고객 모드에서는 고객 입장 계약 관리와 지급을 할 수 있다는 설명.
- 확인된 상태: Contractor 기본 상태.
- 단계 간 변화: Client Mode로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 이 계정이 고객과 공급자 양쪽 역할을 수행하는 모드 전환 진입. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클라이언트 포털 접근과 동일 개념인지·플랜 제한 미확인.

#### 모델링 영향

- 후보와 근거: 계정의 사용 모드와 고객 포털 권한을 별개 후보로 검토. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 클라이언트 포털 접근과 동일 개념인지·플랜 제한 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — Two-factor Authentication

- Screen ID: `sc_fbb3e484b00c48e4963ee43bbe214b80`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fbb3e484b00c48e4963ee43bbe214b80?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5ffa4a3-2ac5-4061-9be2-d3bec7d1ec64.png)
- 로컬 이미지: [07_sc_fbb3e484b00c48e4963ee43bbe214b80.png](<screens/07_sc_fbb3e484b00c48e4963ee43bbe214b80.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 137, 고유 이미지 S547, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_35ec0f745e63437994f49c24aa5aa8bb` → 현재 → `sc_a2d30da474bc43909f17e726b0559b83`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 2FA 카드, 하단 장치 기억 체크박스.
- 입력 항목·필수 표시·기본값: Enabled/Disabled가 흐리게 표시. Email Verification 선택, SMS 미선택. 30일 장치 기억 체크.
- 버튼·메뉴·안내 문구: 이메일 또는 휴대폰에 무작위 6자리 코드 전송 안내.
- 확인된 상태: 이메일 방식이 선택됨. 실제 코드 입력이나 설정 변경 없음.
- 단계 간 변화: 2FA 패널로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 로그인 장치 기억 옵션과 2FA 전달 방식이 별도. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 흐린 상태의 원인·SMS 번호 등록·재인증 경계 미확인.

#### 모델링 영향

- 후보와 근거: 인증 방식과 장치 신뢰 만료 후보; 해제 가능으로 모델링하지 않음. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 흐린 상태의 원인·SMS 번호 등록·재인증 경계 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Brand Settings

- Screen ID: `sc_a2d30da474bc43909f17e726b0559b83`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a2d30da474bc43909f17e726b0559b83?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d32a37ed-4ba5-4daf-bb38-10a0ce50321b.png)
- 로컬 이미지: [08_sc_a2d30da474bc43909f17e726b0559b83.png](<screens/08_sc_a2d30da474bc43909f17e726b0559b83.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 137, 고유 이미지 S548, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fbb3e484b00c48e4963ee43bbe214b80` → 현재 → `sc_c3ed26151c6f4f72b154852639f26757`

#### 화면에서 직접 확인한 내용

- 레이아웃: Branding 탭. 왼쪽 설정, 오른쪽 Sample Invoice 미리보기.
- 입력 항목·필수 표시·기본값: Company Logo spencer.png, Small Square 84×84, Header Image No image, Brand Font 미선택, Brand Color #22AD01 일부.
- 버튼·메뉴·안내 문구: Save Changes, 파일 제거 X, 로고 크기·헤더·폰트 드롭다운. 폰트·색 왕관.
- 확인된 상태: 새로 만드는 문서에만 변경 적용 안내. 샘플 invoice1001.
- 단계 간 변화: Branding 탭으로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 운영 회사의 브랜드 기본값과 미리보기. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 왕관 기능의 제한 동작·미리보기와 저장 차이 미확인.

#### 모델링 영향

- 후보와 근거: 브랜드 설정·asset·문서 생성 당시 기본값 복사 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 왕관 기능의 제한 동작·미리보기와 저장 차이 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — Team 목록

- Screen ID: `sc_c3ed26151c6f4f72b154852639f26757`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c3ed26151c6f4f72b154852639f26757?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0a9d91f2-ab27-47f4-8f27-ebad4ced137f.png)
- 로컬 이미지: [09_sc_c3ed26151c6f4f72b154852639f26757.png](<screens/09_sc_c3ed26151c6f4f72b154852639f26757.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 138, 고유 이미지 S549, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a2d30da474bc43909f17e726b0559b83` → 현재 → `sc_b8ed116f56354559846a960779fa7c5d`

#### 화면에서 직접 확인한 내용

- 레이아웃: Team 탭과 우측 Invite Member. Name/Email/Role/Projects/Joined 표.
- 입력 항목·필수 표시·기본값: Owner Joe Doe All Projects; Collaborator 4행. 3행은 Invite Pending, 다른 행은 날짜. 같은 Jon Smith 이름에 다른 이메일.
- 버튼·메뉴·안내 문구: 행별 점3개 메뉴, Invite Member, 상단 Upgrade Now.
- 확인된 상태: 초대 대기와 가입 완료가 공존. 화면 표시 날짜는2024년2월.
- 단계 간 변화: Team 탭; 상단 Upgrade Now가 보여 계정 상태 연속성은 미확인 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 멤버명·이메일·역할·프로젝트 범위·초대 상태가 구분됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 소유자 변경, 초대 중복, 좌석 과금 시점 미확인.

#### 모델링 영향

- 후보와 근거: 멤버십과 초대 수명주기·프로젝트 배정 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 소유자 변경, 초대 중복, 좌석 과금 시점 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — Integrations & Data 목록

- Screen ID: `sc_b8ed116f56354559846a960779fa7c5d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/29e0bf0a-7762-4cc6-88b3-83f024820c4f.png)
- 로컬 이미지: [10_sc_b8ed116f56354559846a960779fa7c5d.png](<screens/10_sc_b8ed116f56354559846a960779fa7c5d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 138, 고유 이미지 S550, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c3ed26151c6f4f72b154852639f26757` → 현재 → `sc_e7be88f9e1fa42c28bf8dc0b9f1368a9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 카드 그리드. Gmail/Google Calendar/Zapier, Slack/QuickBooks Online/Calendly, ClickUp/Trello/Google Drive 일부.
- 입력 항목·필수 표시·기본값: 현재 연결 상태나 토큰 입력 없음.
- 버튼·메뉴·안내 문구: 서비스 카드와 간단한 연동 목적 설명.
- 확인된 상태: 스크롤 상단. Import 영역은 아직 보이지 않음.
- 단계 간 변화: Integrations & Data로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 클라이언트 발송 이메일·알림·인보이스 동기화·외부 작업 자동화 등 목적이 다름. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인.

#### 모델링 영향

- 후보와 근거: 외부 연결 계정·상태와 자동화 설정을 분리할 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — Subscription — 해지 예약

- Screen ID: `sc_e7be88f9e1fa42c28bf8dc0b9f1368a9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e7be88f9e1fa42c28bf8dc0b9f1368a9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6fba1371-4d11-4ea9-9807-1e1fc7d6884b.png)
- 로컬 이미지: [11_sc_e7be88f9e1fa42c28bf8dc0b9f1368a9.png](<screens/11_sc_e7be88f9e1fa42c28bf8dc0b9f1368a9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 138, 고유 이미지 S551, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b8ed116f56354559846a960779fa7c5d` → 현재 → `sc_837573dab00e42459af5990de3b28044`

#### 화면에서 직접 확인한 내용

- 레이아웃: Current Subscription Starter 카드와 아래3열 플랜 비교.
- 입력 항목·필수 표시·기본값: Starter $25 monthly. 종료 예정 Mar8 2024. 플랜25/39/79달러.
- 버튼·메뉴·안내 문구: 해지 취소 click here, 플랜 비교.
- 확인된 상태: 현재 결제 기간 말 종료 예약됨. 유효 플랜 Starter가 계속 표시.
- 단계 간 변화: Subscription으로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 취소 예약과 유효 종료일을 별도로 보여줌. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 재활성화·환불·실제 종료 후 권한 미확인.

#### 모델링 영향

- 후보와 근거: 구독 상태, cancel_at_period_end, 유효 기간 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 재활성화·환불·실제 종료 후 권한 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 12 — Subscription — 기능과 Tax

- Screen ID: `sc_837573dab00e42459af5990de3b28044`
- 원본: [화면 페이지](https://gummble.com/screens/sc_837573dab00e42459af5990de3b28044?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0d5bf456-6d4f-4b83-b455-1f1f57eb22dc.png)
- 로컬 이미지: [12_sc_837573dab00e42459af5990de3b28044.png](<screens/12_sc_837573dab00e42459af5990de3b28044.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 138, 고유 이미지 S552, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e7be88f9e1fa42c28bf8dc0b9f1368a9` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 구독 페이지 아래 스크롤,3열 플랜 기능/버튼, Tax 가로 카드.
- 입력 항목·필수 표시·기본값: Starter25, Professional39, Business79 USD/월, Tax10/월. 캡처 당시 표시값.
- 버튼·메뉴·안내 문구: Current Plan 비활성, Upgrade Plan2개, Tax Start Free Trial.
- 확인된 상태: 플랜별 문서/CRM/자동화/브랜딩/하도급 기능 구분.
- 단계 간 변화: 동일 구독 페이지 아래로 스크롤 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 기본 구독과 별도 Tax 부가 상품이 표시됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재 플랜·지역별 가격/세금·좌석 계산 미확인.

#### 모델링 영향

- 후보와 근거: 플랜 기능 자격과 부가 구독 후보; 가격 하드코딩 금지. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 현재 플랜·지역별 가격/세금·좌석 계산 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 메뉴가 열린 정상 상태. — 입력 없음. Joe Studio 계정 표시. | 메뉴 항목별 역할 권한과 이동 URL 미확인. |
| 02 | Profile Settings 선택. 개인 사진은 이니셜 상태. — First name Joe, Last name Doe, Email, Title의 회색 Operations Director 예시. JD 아바타와 제거 X. 별표 없음. | 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인. |
| 03 | 공개 프로필 활성. 주소의 Singapore가 여러 줄에 중복 표시. — Company Name Joe Studio, Company Contact Joe Doe, Public Profile Enabled, URL joe-doe-10, Country Singapore. 주소 카드. | 공개 URL 중복 검증 및 담당자 선택 범위 미확인. |
| 04 | 이메일 본문에 기본 개인화 메시지를 넣는다는 안내. 계약 영역은 화면 밖. — Default invoice message와 Default proposal message. 이메일·회사명·개인명 포함된 회색 예문; 입력값인지 placeholder인지 이미지 단독으로 불명. | 템플릿 변수·자동 치환·사용자 편집 여부 미확인. |
| 05 | 브라우저 권한 창은 없다. — 앱 알림/리마인더, 프리랜싱 팁, 새 기능, 구독 결제 문제, 작업 기한 알림 모두 체크. 아래 360 minutes 일부 보임. | 체크 항목별 전송 채널과 임계값 최소·최대 미확인. |
| 06 | Contractor 기본 상태. — Account mode Contractor. 입력 필드 없음. | 클라이언트 포털 접근과 동일 개념인지·플랜 제한 미확인. |
| 07 | 이메일 방식이 선택됨. 실제 코드 입력이나 설정 변경 없음. — Enabled/Disabled가 흐리게 표시. Email Verification 선택, SMS 미선택. 30일 장치 기억 체크. | 흐린 상태의 원인·SMS 번호 등록·재인증 경계 미확인. |
| 08 | 새로 만드는 문서에만 변경 적용 안내. 샘플 invoice1001. — Company Logo spencer.png, Small Square 84×84, Header Image No image, Brand Font 미선택, Brand Color #22AD01 일부. | 왕관 기능의 제한 동작·미리보기와 저장 차이 미확인. |
| 09 | 초대 대기와 가입 완료가 공존. 화면 표시 날짜는2024년2월. — Owner Joe Doe All Projects; Collaborator 4행. 3행은 Invite Pending, 다른 행은 날짜. 같은 Jon Smith 이름에 다른 이메일. | 소유자 변경, 초대 중복, 좌석 과금 시점 미확인. |
| 10 | 스크롤 상단. Import 영역은 아직 보이지 않음. — 현재 연결 상태나 토큰 입력 없음. | 카드 클릭 후 인증·동기화 방향·권한 범위 미확인. |
| 11 | 현재 결제 기간 말 종료 예약됨. 유효 플랜 Starter가 계속 표시. — Starter $25 monthly. 종료 예정 Mar8 2024. 플랜25/39/79달러. | 재활성화·환불·실제 종료 후 권한 미확인. |
| 12 | 플랜별 문서/CRM/자동화/브랜딩/하도급 기능 구분. — Starter25, Professional39, Business79 USD/월, Tax10/월. 캡처 당시 표시값. | 현재 플랜·지역별 가격/세금·좌석 계산 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

설정은 Account·Branding·Team·Integrations & Data·Subscription으로 나뉜다. Company의 공개 프로필과 Client Mode는 서로 다른 설정이다. Team은 동일 이름·다른 이메일과 Invite Pending·가입일 표시가 공존한다. Subscription은 Starter 월 25달러가 표시된 채 2024-03-08 종료 예약 안내가 있으므로 이미 이용 종료된 계정으로 해석하지 않는다. 2FA의 흐린 Enabled/Disabled만으로 선택 가능 여부를 확정하지 않는다.

### 업무 규칙과 연결 시 주의점

- 개인·운영 회사·고객 CRM 설정은 다른 업무 범위다.
- Brand Settings 안내는 변경이 새 문서에만 적용된다고 말한다.
- Invite Pending과 실제 가입일은 구분된다. 동일 이름으로 다른 이메일 행이 존재한다.
- 해지 예약과 현재 이용 플랜이 동시에 표시된다. 해지 즉시 모든 권한이 사라졌다고 볼 수 없다.

## 6. 공식 도움말과 API 대조

공식 자료는 **2026-11-20 KST** 조회한 현재 문서이며 과거 캡처와 시점이 다를 수 있다. 아래 출처의 제한된 범위를 대조했고, 실제 계정이나 내부 API를 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S003 공통 대조](<../../SOURCES.md#s003>)에 기록했다.
- [사용자 권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S004 공통 대조](<../../SOURCES.md#s004>)에 기록했다.
- [2FA 관리](https://help.hellobonsai.com/en/articles/7935122-managing-two-factor-authentication-2fa-on-your-account): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S005 공통 대조](<../../SOURCES.md#s005>)에 기록했다.
- [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S039 공통 대조](<../../SOURCES.md#s039>)에 기록했다.
- [회사 로고·문서 헤더](https://help.hellobonsai.com/en/articles/1977524-how-to-update-your-company-logo-and-header-on-your-documents): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S040 공통 대조](<../../SOURCES.md#s040>)에 기록했다.
- [기본 발송 메시지](https://help.hellobonsai.com/en/articles/2397460-how-to-set-default-messages-when-sending-documents-to-clients): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S083 공통 대조](<../../SOURCES.md#s083>)에 기록했다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../SOURCES.md#api>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- UserProfile, 운영 Workspace 설정, 문서 종류별 발송 기본값, 개인 알림 선호, 브랜드 기본값을 분리하는 후보.
- 멤버십 역할·프로젝트 접근·초대 상태·구독 유효 종료일과 해지 예약 상태가 별도 후보.
- 탭을 DB 테이블과 일대일로 대응시키지 않는다.

### 단계별 모델링 근거

- 단계 01: 계정 메뉴 라우팅과 워크스페이스 표시 후보.
- 단계 02: 개인 프로필과 인증정보 분리 후보.
- 단계 03: 운영 회사 설정과 공개 프로필 가시성·slug 후보.
- 단계 04: 문서 종류별 기본 본문 후보; 변수 지원을 가정하지 않음.
- 단계 05: 알림 종류별 선호와 브라우저 권한, 타이머 임계값 후보.
- 단계 06: 계정의 사용 모드와 고객 포털 권한을 별개 후보로 검토.
- 단계 07: 인증 방식과 장치 신뢰 만료 후보; 해제 가능으로 모델링하지 않음.
- 단계 08: 브랜드 설정·asset·문서 생성 당시 기본값 복사 후보.
- 단계 09: 멤버십과 초대 수명주기·프로젝트 배정 후보.
- 단계 10: 외부 연결 계정·상태와 자동화 설정을 분리할 후보.
- 단계 11: 구독 상태, cancel_at_period_end, 유효 기간 후보.
- 단계 12: 플랜 기능 자격과 부가 구독 후보; 가격 하드코딩 금지.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 설정별 권한과 저장 범위는 역할별 실제 계정에서 확인할 것. 2FA의 장치 기억 30일은 로그인 이외 민감 작업에도 적용되는지 확인할 것.

- 설정별 권한과 저장 범위는 역할별 실제 계정에서 확인할 것.
- 2FA의 장치 기억 30일은 로그인 이외 민감 작업에도 적용되는지 확인할 것.
- 새 브랜드 기본값이 기존 문서에 적용되지 않는 경계를 문서 생성 시점과 대조할 것.

### 단계별 미확인 사항

- 단계 01: 메뉴 항목별 역할 권한과 이동 URL 미확인.
- 단계 02: 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인.
- 단계 03: 공개 URL 중복 검증 및 담당자 선택 범위 미확인.
- 단계 04: 템플릿 변수·자동 치환·사용자 편집 여부 미확인.
- 단계 05: 체크 항목별 전송 채널과 임계값 최소·최대 미확인.
- 단계 06: 클라이언트 포털 접근과 동일 개념인지·플랜 제한 미확인.
- 단계 07: 흐린 상태의 원인·SMS 번호 등록·재인증 경계 미확인.
- 단계 08: 왕관 기능의 제한 동작·미리보기와 저장 차이 미확인.
- 단계 09: 소유자 변경, 초대 중복, 좌석 과금 시점 미확인.
- 단계 10: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인.
- 단계 11: 재활성화·환불·실제 종료 후 권한 미확인.
- 단계 12: 현재 플랜·지역별 가격/세금·좌석 계산 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 12개와 실제 이미지 12개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 12단계 재조회 및 원본 12개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 12단계 ID·순서·원본 URL 재조회 및 이미지 12/12단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. [검토 기록](<../../review/2026-11-20/REPORT.md>) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |

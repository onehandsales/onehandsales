# Settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **12/12단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `fe127bb6-984a-4b25-927f-4186b6650743` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=fe127bb6-984a-4b25-927f-4186b6650743) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 12단계 / 12단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 12개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

운영자가 개인 프로필, 운영 회사, 메시지·알림, 브랜딩, 팀, 연동, 구독 설정 영역을 탐색한다. 이 루트는 여러 탭의 개요이며 하나의 연속 저장 작업이 아니다.

- 대시보드 우측 프로필 메뉴에서 Settings로 진입한다.
- Client Portal 메뉴는 보이지만 해당 패널은 이 루트에 없다. 하위 플로우와 고객 포털 분석을 함께 대조한다.
- 구독 화면은 이미 해지 예약된 Starter 계정이며 현재 가격표로 사용하지 않는다.

- 하위 플로우: [Deleting account](Deleting%20account/ANALYSIS.md), [Enable client mode](Enable%20client%20mode/ANALYSIS.md), [Editing branding settings](Editing%20branding%20settings/ANALYSIS.md), [Uploading profile picture](Uploading%20profile%20picture/ANALYSIS.md), [Editing notification settings](Editing%20notification%20settings/ANALYSIS.md), [Importing a CSV](Importing%20a%20CSV/ANALYSIS.md), [Removing a user](Removing%20a%20user/ANALYSIS.md), [Disabling public profile](Disabling%20public%20profile/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_25261ff6e5d44d70885c07b053f29685`](https://gummble.com/screens/sc_25261ff6e5d44d70885c07b053f29685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 프로필 메뉴](<screens/01_sc_25261ff6e5d44d70885c07b053f29685.png>) | Settings 프로필 패널로 이동 |
| 02 | [`sc_f81cdd742f9d4d09b96c9de95c4d0390`](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Profile Settings](<screens/02_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>) | Company Settings로 전환 |
| 03 | [`sc_33fdc633ac3c432eb0934dddfe05a1f7`](https://gummble.com/screens/sc_33fdc633ac3c432eb0934dddfe05a1f7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Company Settings — 공개 프로필과 주소](<screens/03_sc_33fdc633ac3c432eb0934dddfe05a1f7.png>) | 기본 고객 메시지로 전환 |
| 04 | [`sc_e9ce751aa491433ebc421be43501cc07`](https://gummble.com/screens/sc_e9ce751aa491433ebc421be43501cc07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Default Client Messages](<screens/04_sc_e9ce751aa491433ebc421be43501cc07.png>) | Notifications & Alerts로 전환 |
| 05 | [`sc_5ed82da31d4542d1971fce527dc0584d`](https://gummble.com/screens/sc_5ed82da31d4542d1971fce527dc0584d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Notifications & Alerts](<screens/05_sc_5ed82da31d4542d1971fce527dc0584d.png>) | Client Mode로 전환 |
| 06 | [`sc_35ec0f745e63437994f49c24aa5aa8bb`](https://gummble.com/screens/sc_35ec0f745e63437994f49c24aa5aa8bb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Client Mode — Contractor](<screens/06_sc_35ec0f745e63437994f49c24aa5aa8bb.png>) | 2FA 패널로 전환 |
| 07 | [`sc_fbb3e484b00c48e4963ee43bbe214b80`](https://gummble.com/screens/sc_fbb3e484b00c48e4963ee43bbe214b80?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Two-factor Authentication](<screens/07_sc_fbb3e484b00c48e4963ee43bbe214b80.png>) | Branding 탭으로 전환 |
| 08 | [`sc_a2d30da474bc43909f17e726b0559b83`](https://gummble.com/screens/sc_a2d30da474bc43909f17e726b0559b83?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Brand Settings](<screens/08_sc_a2d30da474bc43909f17e726b0559b83.png>) | Team 탭; 상단 Upgrade Now가 보여 계정 상태 연속성은 미확인 |
| 09 | [`sc_c3ed26151c6f4f72b154852639f26757`](https://gummble.com/screens/sc_c3ed26151c6f4f72b154852639f26757?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Team 목록](<screens/09_sc_c3ed26151c6f4f72b154852639f26757.png>) | Integrations & Data로 전환 |
| 10 | [`sc_b8ed116f56354559846a960779fa7c5d`](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Integrations & Data 목록](<screens/10_sc_b8ed116f56354559846a960779fa7c5d.png>) | Subscription으로 전환 |
| 11 | [`sc_e7be88f9e1fa42c28bf8dc0b9f1368a9`](https://gummble.com/screens/sc_e7be88f9e1fa42c28bf8dc0b9f1368a9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Subscription — 해지 예약](<screens/11_sc_e7be88f9e1fa42c28bf8dc0b9f1368a9.png>) | 동일 구독 페이지 아래로 스크롤 |
| 12 | [`sc_837573dab00e42459af5990de3b28044`](https://gummble.com/screens/sc_837573dab00e42459af5990de3b28044?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Subscription — 기능과 Tax](<screens/12_sc_837573dab00e42459af5990de3b28044.png>) | 플랜과 Tax 부가 상품 표시에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 프로필 메뉴

- Screen ID: `sc_25261ff6e5d44d70885c07b053f29685`
- 원본: [화면 페이지](https://gummble.com/screens/sc_25261ff6e5d44d70885c07b053f29685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8d2c0c65-3033-4e0f-90e9-39aa0de970ef.png)
- 로컬 이미지: [01_sc_25261ff6e5d44d70885c07b053f29685.png](<screens/01_sc_25261ff6e5d44d70885c07b053f29685.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f81cdd742f9d4d09b96c9de95c4d0390`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 앱 사이드바, 우측 상단 아바타 아래 흰색 드롭다운. 배경에 프로젝트 타임라인과 손익 그래프.
- 입력 항목·필수 표시·기본값: 입력 없음. Joe Studio 계정 표시.
- 버튼·메뉴·안내 문구: Help Center, Perks, Team, Subscription, Settings, Logout.
- 확인된 상태: 메뉴가 열린 정상 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 설정과 팀·구독으로 직접 이동하는 진입점이 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메뉴 항목별 역할 권한과 이동 URL 미확인.

#### 모델링 영향

- 후보와 근거: 계정 메뉴 라우팅과 워크스페이스 표시 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Profile Settings

- Screen ID: `sc_f81cdd742f9d4d09b96c9de95c4d0390`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8881986d-5358-4529-a8dc-52332465d205.png)
- 로컬 이미지: [02_sc_f81cdd742f9d4d09b96c9de95c4d0390.png](<screens/02_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_25261ff6e5d44d70885c07b053f29685` → 현재 → `sc_33fdc633ac3c432eb0934dddfe05a1f7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 5개 탭, Account 내부 왼쪽 7개 세부 메뉴, 오른쪽 프로필 카드와 하단 Delete Account 일부.
- 입력 항목·필수 표시·기본값: First name Joe, Last name Doe, Email, Title의 회색 Operations Director 예시. JD 아바타와 제거 X. 별표 없음.
- 버튼·메뉴·안내 문구: Save Changes, Update Password 접기/펼치기.
- 확인된 상태: Profile Settings 선택. 개인 사진은 이니셜 상태.
- 단계 간 변화: Settings 프로필 패널로 이동

#### 동작과 데이터

- 화면 관찰: 개인 이름·로그인 이메일·직함과 사진을 수정하는 화면.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인.

#### 모델링 영향

- 후보와 근거: 개인 프로필과 인증정보 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Company Settings — 공개 프로필과 주소

- Screen ID: `sc_33fdc633ac3c432eb0934dddfe05a1f7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33fdc633ac3c432eb0934dddfe05a1f7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6334edc6-4ba5-4953-86f3-4f95e2e23710.png)
- 로컬 이미지: [03_sc_33fdc633ac3c432eb0934dddfe05a1f7.png](<screens/03_sc_33fdc633ac3c432eb0934dddfe05a1f7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f81cdd742f9d4d09b96c9de95c4d0390` → 현재 → `sc_e9ce751aa491433ebc421be43501cc07`

#### 화면에서 직접 확인한 내용

- 레이아웃: Account 내부 Company Settings 선택. 회사명·담당자 2열, 공개 프로필/URL, 국가/주소 2열.
- 입력 항목·필수 표시·기본값: Company Name Joe Studio, Company Contact Joe Doe, Public Profile Enabled, URL joe-doe-10, Country Singapore. 주소 카드.
- 버튼·메뉴·안내 문구: Save Changes, Enabled/Disabled, View Profile. 회사명 비우면 사용자 이름 사용 안내.
- 확인된 상태: 공개 프로필 활성. 주소의 Singapore가 여러 줄에 중복 표시.
- 단계 간 변화: Company Settings로 전환

#### 동작과 데이터

- 화면 관찰: 운영 회사 이름·대표 연락 담당자·공개 URL·주소를 함께 관리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 공개 URL 중복 검증 및 담당자 선택 범위 미확인.

#### 모델링 영향

- 후보와 근거: 운영 회사 설정과 공개 프로필 가시성·slug 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Default Client Messages

- Screen ID: `sc_e9ce751aa491433ebc421be43501cc07`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e9ce751aa491433ebc421be43501cc07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5e8467e5-e45d-4c38-a0a5-ee0738a6c0af.png)
- 로컬 이미지: [04_sc_e9ce751aa491433ebc421be43501cc07.png](<screens/04_sc_e9ce751aa491433ebc421be43501cc07.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_33fdc633ac3c432eb0934dddfe05a1f7` → 현재 → `sc_5ed82da31d4542d1971fce527dc0584d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 기본 메시지 카드에 설명과 긴 textarea들이 세로 배치.
- 입력 항목·필수 표시·기본값: Default invoice message와 Default proposal message. 이메일·회사명·개인명 포함된 회색 예문; 입력값인지 placeholder인지 이미지 단독으로 불명.
- 버튼·메뉴·안내 문구: Save changes, More information here.
- 확인된 상태: 이메일 본문에 기본 개인화 메시지를 넣는다는 안내. 계약 영역은 화면 밖.
- 단계 간 변화: 기본 고객 메시지로 전환

#### 동작과 데이터

- 화면 관찰: 발송 문서 유형별 기본 메시지 구분.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 변수·자동 치환·사용자 편집 여부 미확인.

#### 모델링 영향

- 후보와 근거: 문서 종류별 기본 본문 후보; 변수 지원을 가정하지 않음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Notifications & Alerts

- Screen ID: `sc_5ed82da31d4542d1971fce527dc0584d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5ed82da31d4542d1971fce527dc0584d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/edf60083-6b0c-4f58-8daa-ef41461d5905.png)
- 로컬 이미지: [05_sc_5ed82da31d4542d1971fce527dc0584d.png](<screens/05_sc_5ed82da31d4542d1971fce527dc0584d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e9ce751aa491433ebc421be43501cc07` → 현재 → `sc_35ec0f745e63437994f49c24aa5aa8bb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 체크박스 5개, 구분선 아래 브라우저 알림과 타이머 임계값.
- 입력 항목·필수 표시·기본값: 앱 알림/리마인더, 프리랜싱 팁, 새 기능, 구독 결제 문제, 작업 기한 알림 모두 체크. 아래 360 minutes 일부 보임.
- 버튼·메뉴·안내 문구: Save Changes, Enable desktop notifications.
- 확인된 상태: 브라우저 권한 창은 없다.
- 단계 간 변화: Notifications & Alerts로 전환

#### 동작과 데이터

- 화면 관찰: 이메일 성격의 항목들과 브라우저 알림 진입이 분리됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 체크 항목별 전송 채널과 임계값 최소·최대 미확인.

#### 모델링 영향

- 후보와 근거: 알림 종류별 선호와 브라우저 권한, 타이머 임계값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Client Mode — Contractor

- Screen ID: `sc_35ec0f745e63437994f49c24aa5aa8bb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_35ec0f745e63437994f49c24aa5aa8bb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/699a6892-0949-433f-91b8-40c95ea5363c.png)
- 로컬 이미지: [06_sc_35ec0f745e63437994f49c24aa5aa8bb.png](<screens/06_sc_35ec0f745e63437994f49c24aa5aa8bb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5ed82da31d4542d1971fce527dc0584d` → 현재 → `sc_fbb3e484b00c48e4963ee43bbe214b80`

#### 화면에서 직접 확인한 내용

- 레이아웃: Account 하위 Client Mode 카드, 왕관 아이콘.
- 입력 항목·필수 표시·기본값: Account mode Contractor. 입력 필드 없음.
- 버튼·메뉴·안내 문구: Enable Dual-Mode. 고객 모드에서는 고객 입장 계약 관리와 지급을 할 수 있다는 설명.
- 확인된 상태: Contractor 기본 상태.
- 단계 간 변화: Client Mode로 전환

#### 동작과 데이터

- 화면 관찰: 이 계정이 고객과 공급자 양쪽 역할을 수행하는 모드 전환 진입.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클라이언트 포털 접근과 동일 개념인지·플랜 제한 미확인.

#### 모델링 영향

- 후보와 근거: 계정의 사용 모드와 고객 포털 권한을 별개 후보로 검토.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — Two-factor Authentication

- Screen ID: `sc_fbb3e484b00c48e4963ee43bbe214b80`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fbb3e484b00c48e4963ee43bbe214b80?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5ffa4a3-2ac5-4061-9be2-d3bec7d1ec64.png)
- 로컬 이미지: [07_sc_fbb3e484b00c48e4963ee43bbe214b80.png](<screens/07_sc_fbb3e484b00c48e4963ee43bbe214b80.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_35ec0f745e63437994f49c24aa5aa8bb` → 현재 → `sc_a2d30da474bc43909f17e726b0559b83`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 2FA 카드, 하단 장치 기억 체크박스.
- 입력 항목·필수 표시·기본값: Enabled/Disabled가 흐리게 표시. Email Verification 선택, SMS 미선택. 30일 장치 기억 체크.
- 버튼·메뉴·안내 문구: 이메일 또는 휴대폰에 무작위 6자리 코드 전송 안내.
- 확인된 상태: 이메일 방식이 선택됨. 실제 코드 입력이나 설정 변경 없음.
- 단계 간 변화: 2FA 패널로 전환

#### 동작과 데이터

- 화면 관찰: 로그인 장치 기억 옵션과 2FA 전달 방식이 별도.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 흐린 상태의 원인·SMS 번호 등록·재인증 경계 미확인.

#### 모델링 영향

- 후보와 근거: 인증 방식과 장치 신뢰 만료 후보; 해제 가능으로 모델링하지 않음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Brand Settings

- Screen ID: `sc_a2d30da474bc43909f17e726b0559b83`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a2d30da474bc43909f17e726b0559b83?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d32a37ed-4ba5-4daf-bb38-10a0ce50321b.png)
- 로컬 이미지: [08_sc_a2d30da474bc43909f17e726b0559b83.png](<screens/08_sc_a2d30da474bc43909f17e726b0559b83.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fbb3e484b00c48e4963ee43bbe214b80` → 현재 → `sc_c3ed26151c6f4f72b154852639f26757`

#### 화면에서 직접 확인한 내용

- 레이아웃: Branding 탭. 왼쪽 설정, 오른쪽 Sample Invoice 미리보기.
- 입력 항목·필수 표시·기본값: Company Logo spencer.png, Small Square 84×84, Header Image No image, Brand Font 미선택, Brand Color #22AD01 일부.
- 버튼·메뉴·안내 문구: Save Changes, 파일 제거 X, 로고 크기·헤더·폰트 드롭다운. 폰트·색 왕관.
- 확인된 상태: 새로 만드는 문서에만 변경 적용 안내. 샘플 invoice1001.
- 단계 간 변화: Branding 탭으로 전환

#### 동작과 데이터

- 화면 관찰: 운영 회사의 브랜드 기본값과 미리보기.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 왕관 기능의 제한 동작·미리보기와 저장 차이 미확인.

#### 모델링 영향

- 후보와 근거: 브랜드 설정·asset·문서 생성 당시 기본값 복사 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — Team 목록

- Screen ID: `sc_c3ed26151c6f4f72b154852639f26757`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c3ed26151c6f4f72b154852639f26757?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0a9d91f2-ab27-47f4-8f27-ebad4ced137f.png)
- 로컬 이미지: [09_sc_c3ed26151c6f4f72b154852639f26757.png](<screens/09_sc_c3ed26151c6f4f72b154852639f26757.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a2d30da474bc43909f17e726b0559b83` → 현재 → `sc_b8ed116f56354559846a960779fa7c5d`

#### 화면에서 직접 확인한 내용

- 레이아웃: Team 탭과 우측 Invite Member. Name/Email/Role/Projects/Joined 표.
- 입력 항목·필수 표시·기본값: Owner Joe Doe All Projects; Collaborator 4행. 3행은 Invite Pending, 다른 행은 날짜. 같은 Jon Smith 이름에 다른 이메일.
- 버튼·메뉴·안내 문구: 행별 점3개 메뉴, Invite Member, 상단 Upgrade Now.
- 확인된 상태: 초대 대기와 가입 완료가 공존. 화면 표시 날짜는2024년2월.
- 단계 간 변화: Team 탭; 상단 Upgrade Now가 보여 계정 상태 연속성은 미확인

#### 동작과 데이터

- 화면 관찰: 멤버명·이메일·역할·프로젝트 범위·초대 상태가 구분됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 소유자 변경, 초대 중복, 좌석 과금 시점 미확인.

#### 모델링 영향

- 후보와 근거: 멤버십과 초대 수명주기·프로젝트 배정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — Integrations & Data 목록

- Screen ID: `sc_b8ed116f56354559846a960779fa7c5d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/29e0bf0a-7762-4cc6-88b3-83f024820c4f.png)
- 로컬 이미지: [10_sc_b8ed116f56354559846a960779fa7c5d.png](<screens/10_sc_b8ed116f56354559846a960779fa7c5d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c3ed26151c6f4f72b154852639f26757` → 현재 → `sc_e7be88f9e1fa42c28bf8dc0b9f1368a9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 카드 그리드. Gmail/Google Calendar/Zapier, Slack/QuickBooks Online/Calendly, ClickUp/Trello/Google Drive 일부.
- 입력 항목·필수 표시·기본값: 현재 연결 상태나 토큰 입력 없음.
- 버튼·메뉴·안내 문구: 서비스 카드와 간단한 연동 목적 설명.
- 확인된 상태: 스크롤 상단. Import 영역은 아직 보이지 않음.
- 단계 간 변화: Integrations & Data로 전환

#### 동작과 데이터

- 화면 관찰: 클라이언트 발송 이메일·알림·인보이스 동기화·외부 작업 자동화 등 목적이 다름.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인.

#### 모델링 영향

- 후보와 근거: 외부 연결 계정·상태와 자동화 설정을 분리할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — Subscription — 해지 예약

- Screen ID: `sc_e7be88f9e1fa42c28bf8dc0b9f1368a9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e7be88f9e1fa42c28bf8dc0b9f1368a9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6fba1371-4d11-4ea9-9807-1e1fc7d6884b.png)
- 로컬 이미지: [11_sc_e7be88f9e1fa42c28bf8dc0b9f1368a9.png](<screens/11_sc_e7be88f9e1fa42c28bf8dc0b9f1368a9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b8ed116f56354559846a960779fa7c5d` → 현재 → `sc_837573dab00e42459af5990de3b28044`

#### 화면에서 직접 확인한 내용

- 레이아웃: Current Subscription Starter 카드와 아래3열 플랜 비교.
- 입력 항목·필수 표시·기본값: Starter $25 monthly. 종료 예정 Mar8 2024. 플랜25/39/79달러.
- 버튼·메뉴·안내 문구: 해지 취소 click here, 플랜 비교.
- 확인된 상태: 현재 결제 기간 말 종료 예약됨. 유효 플랜 Starter가 계속 표시.
- 단계 간 변화: Subscription으로 전환

#### 동작과 데이터

- 화면 관찰: 취소 예약과 유효 종료일을 별도로 보여줌.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 재활성화·환불·실제 종료 후 권한 미확인.

#### 모델링 영향

- 후보와 근거: 구독 상태, cancel_at_period_end, 유효 기간 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 12 — Subscription — 기능과 Tax

- Screen ID: `sc_837573dab00e42459af5990de3b28044`
- 원본: [화면 페이지](https://gummble.com/screens/sc_837573dab00e42459af5990de3b28044?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0d5bf456-6d4f-4b83-b455-1f1f57eb22dc.png)
- 로컬 이미지: [12_sc_837573dab00e42459af5990de3b28044.png](<screens/12_sc_837573dab00e42459af5990de3b28044.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e7be88f9e1fa42c28bf8dc0b9f1368a9` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 구독 페이지 아래 스크롤,3열 플랜 기능/버튼, Tax 가로 카드.
- 입력 항목·필수 표시·기본값: Starter25, Professional39, Business79 USD/월, Tax10/월. 캡처 당시 표시값.
- 버튼·메뉴·안내 문구: Current Plan 비활성, Upgrade Plan2개, Tax Start Free Trial.
- 확인된 상태: 플랜별 문서/CRM/자동화/브랜딩/하도급 기능 구분.
- 단계 간 변화: 동일 구독 페이지 아래로 스크롤

#### 동작과 데이터

- 화면 관찰: 기본 구독과 별도 Tax 부가 상품이 표시됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재 플랜·지역별 가격/세금·좌석 계산 미확인.

#### 모델링 영향

- 후보와 근거: 플랜 기능 자격과 부가 구독 후보; 가격 하드코딩 금지.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 개인·운영 회사·고객 CRM 설정은 다른 업무 범위다.
- Brand Settings 안내는 변경이 새 문서에만 적용된다고 말한다.
- Invite Pending과 실제 가입일은 구분된다. 동일 이름으로 다른 이메일 행이 존재한다.
- 해지 예약과 현재 이용 플랜이 동시에 표시된다. 해지 즉시 모든 권한이 사라졌다고 볼 수 없다.

## 6. 공식 도움말과 API 대조

- [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information): 자신의 회사 이름·주소·통화 등은 Company Settings에서 저장하며 향후 문서/업무에 적용한다고 설명한다. 고객사 Companies 리소스와 구분한다.
- [회사 로고·문서 헤더](https://help.hellobonsai.com/en/articles/1977524-how-to-update-your-company-logo-and-header-on-your-documents): 회사 로고/문서 표시와 크기·헤더 설정을 설명한다. 캡처는 온보딩의 간단한 업로드이며 전체 Branding 설정과 다르다.
- [2FA 관리](https://help.hellobonsai.com/en/articles/7935122-managing-two-factor-authentication-2fa-on-your-account): 현재 도움말은 2FA 필수·해제 불가를 명시한다. 캡처의 Enabled/Disabled 모양만으로 해제가 가능하다고 해석하지 않는다.
- [사용자 권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai): 역할과 프로젝트 접근을 구분하며 초대 수락 후 접근한다. 현재 권한·요금 정책과 과거 캡처의 플랜 구성을 구분한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.
- [기본 발송 메시지](https://help.hellobonsai.com/en/articles/2397460-how-to-set-default-messages-when-sending-documents-to-clients): 현재 도움말은 동적 변수 미지원. 화면 속 기본 문구의 개인 이름을 변수 지원 근거로 삼지 않는다.

## 7. 데이터 모델링 시사점

- UserProfile, 운영 Workspace 설정, 문서 종류별 발송 기본값, 개인 알림 선호, 브랜드 기본값을 분리하는 후보.
- 멤버십 역할·프로젝트 접근·초대 상태·구독 유효 종료일과 해지 예약 상태가 별도 후보.
- 탭을 DB 테이블과 일대일로 대응시키지 않는다.

## 8. 미확인 사항과 검토 질문

- 설정별 권한과 저장 범위는 역할별 실제 계정에서 확인할 것.
- 2FA의 장치 기억 30일은 로그인 이외 민감 작업에도 적용되는지 확인할 것.
- 새 브랜드 기본값이 기존 문서에 적용되지 않는 경계를 문서 생성 시점과 대조할 것.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 12개와 실제 이미지 12개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 12단계 재조회 및 원본 12개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

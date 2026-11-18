# Disabling public profile 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `eb5394cb-70d0-4286-be72-3a6a0c240fd2` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=eb5394cb-70d0-4286-be72-3a6a0c240fd2) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

운영 회사 공개 프로필을 Disabled로 바꾸고 저장한다.

- 계정 삭제·고객 포털 비활성화와 다른 공개 페이지 설정.
- 공개 URL은 비활성화 선택 이후에도 입력칸에 남는다.

- 상위 분석: [Settings](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings/Disabling public profile`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_33fdc633ac3c432eb0934dddfe05a1f7`](https://gummble.com/screens/sc_33fdc633ac3c432eb0934dddfe05a1f7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Company Settings — 공개 프로필과 주소](<screens/01_sc_33fdc633ac3c432eb0934dddfe05a1f7.png>) | Public Profile Disabled 선택 |
| 02 | [`sc_7e58d6db65a84809a0233590eded6c40`](https://gummble.com/screens/sc_7e58d6db65a84809a0233590eded6c40?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Public Profile Disabled 선택](<screens/02_sc_7e58d6db65a84809a0233590eded6c40.png>) | Save Changes 후 성공 토스트 |
| 03 | [`sc_bef52adfe91d4df8b41775a538088b3a`](https://gummble.com/screens/sc_bef52adfe91d4df8b41775a538088b3a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [공개 프로필 비활성 저장](<screens/03_sc_bef52adfe91d4df8b41775a538088b3a.png>) | 비활성 상태 저장에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — Company Settings — 공개 프로필과 주소

- Screen ID: `sc_33fdc633ac3c432eb0934dddfe05a1f7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33fdc633ac3c432eb0934dddfe05a1f7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6334edc6-4ba5-4953-86f3-4f95e2e23710.png)
- 로컬 이미지: [01_sc_33fdc633ac3c432eb0934dddfe05a1f7.png](<screens/01_sc_33fdc633ac3c432eb0934dddfe05a1f7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7e58d6db65a84809a0233590eded6c40`

#### 화면에서 직접 확인한 내용

- 레이아웃: Account 내부 Company Settings 선택. 회사명·담당자 2열, 공개 프로필/URL, 국가/주소 2열.
- 입력 항목·필수 표시·기본값: Company Name Joe Studio, Company Contact Joe Doe, Public Profile Enabled, URL joe-doe-10, Country Singapore. 주소 카드.
- 버튼·메뉴·안내 문구: Save Changes, Enabled/Disabled, View Profile. 회사명 비우면 사용자 이름 사용 안내.
- 확인된 상태: 공개 프로필 활성. 주소의 Singapore가 여러 줄에 중복 표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 운영 회사 이름·대표 연락 담당자·공개 URL·주소를 함께 관리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 공개 URL 중복 검증 및 담당자 선택 범위 미확인.

#### 모델링 영향

- 후보와 근거: 운영 회사 설정과 공개 프로필 가시성·slug 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Public Profile Disabled 선택

- Screen ID: `sc_7e58d6db65a84809a0233590eded6c40`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7e58d6db65a84809a0233590eded6c40?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/25aa2cec-41f4-41be-b725-8549c6f2d6c3.png)
- 로컬 이미지: [02_sc_7e58d6db65a84809a0233590eded6c40.png](<screens/02_sc_7e58d6db65a84809a0233590eded6c40.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_33fdc633ac3c432eb0934dddfe05a1f7` → 현재 → `sc_bef52adfe91d4df8b41775a538088b3a`

#### 화면에서 직접 확인한 내용

- 레이아웃: Company Settings2열 폼 유지.
- 입력 항목·필수 표시·기본값: Disabled가 빨간 글자 선택. joe-doe-10 URL,회사명·주소 유지.
- 버튼·메뉴·안내 문구: Save Changes, View Profile.
- 확인된 상태: 저장 토스트 전.
- 단계 간 변화: Public Profile Disabled 선택

#### 동작과 데이터

- 화면 관찰: 공개 여부만 바뀌고 URL은 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 공개 접근 즉시 차단 여부 미확인.

#### 모델링 영향

- 후보와 근거: 공개 여부와 URL 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 공개 프로필 비활성 저장

- Screen ID: `sc_bef52adfe91d4df8b41775a538088b3a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bef52adfe91d4df8b41775a538088b3a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c91b16e8-6c5d-4add-9a4b-ad8db4a0e0df.png)
- 로컬 이미지: [03_sc_bef52adfe91d4df8b41775a538088b3a.png](<screens/03_sc_bef52adfe91d4df8b41775a538088b3a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7e58d6db65a84809a0233590eded6c40` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 Company Settings, 우하단 회사 변경 저장 성공 토스트.
- 입력 항목·필수 표시·기본값: Disabled 유지.
- 버튼·메뉴·안내 문구: Save Changes, 토스트 닫기.
- 확인된 상태: 저장 성공.
- 단계 간 변화: Save Changes 후 성공 토스트

#### 동작과 데이터

- 화면 관찰: 회사 설정 갱신 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 공개 페이지 접근 결과 미확인.

#### 모델링 영향

- 후보와 근거: 공개 프로필 상태 저장 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 공개 프로필 끄기는 회사 정보를 지우는 작업으로 보이지 않는다.
- 저장 후에도 View Profile 링크와 slug가 표시된다. 익명 접근 결과는 수록되지 않음.

## 6. 공식 도움말과 API 대조

- [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information): 자신의 회사 이름·주소·통화 등은 Company Settings에서 저장하며 향후 문서/업무에 적용한다고 설명한다. 고객사 Companies 리소스와 구분한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- public_profile_enabled와 slug를 분리할 후보.
- 프로필 접근 정책은 계정 활성 여부와 별개.

## 8. 미확인 사항과 검토 질문

- 비활성 URL 응답은404/안내/리디렉션 중 무엇인지 익명 접근으로 확인.
- 다시 켜면 기존slug와 콘텐츠를 복구하는지 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

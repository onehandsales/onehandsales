# Deleting account 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `3d51760e-2893-42a1-ada6-a2c44849a54d` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=3d51760e-2893-42a1-ada6-a2c44849a54d) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

개인 설정 하단에서 계정 삭제 안내와 비밀번호 확인을 거쳐 로그인 페이지로 나가는 캡처다. 서버의 완전 삭제 결과는 이미지로 검증할 수 없다.

- Profile Settings에서 시작. 삭제 실행을 실제 계정에서 수행하지 않았다.
- 현재 공식 문서는 비활성화와 지원팀을 통한 영구 삭제를 구분하므로 과거 UI 문구와 동일 정책으로 취급하지 않는다.

- 상위 분석: [Settings](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings/Deleting account`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_f81cdd742f9d4d09b96c9de95c4d0390`](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Profile Settings](<screens/01_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>) | 하단 Delete Account로 스크롤 |
| 02 | [`sc_333de9739d2740deba8e20dda49a7443`](https://gummble.com/screens/sc_333de9739d2740deba8e20dda49a7443?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Profile Settings 하단 삭제 진입](<screens/02_sc_333de9739d2740deba8e20dda49a7443.png>) | 삭제 확인 모달 |
| 03 | [`sc_7e6f8362d63b405a88ccff1cd6bf8b1b`](https://gummble.com/screens/sc_7e6f8362d63b405a88ccff1cd6bf8b1b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Confirm Account Deletion — 빈 비밀번호](<screens/03_sc_7e6f8362d63b405a88ccff1cd6bf8b1b.png>) | Current Password 입력 |
| 04 | [`sc_5b20d97add43411d9b934127f294db18`](https://gummble.com/screens/sc_5b20d97add43411d9b934127f294db18?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Confirm Account Deletion — 비밀번호 입력](<screens/04_sc_5b20d97add43411d9b934127f294db18.png>) | 로그인 화면으로 전환 |
| 05 | [`sc_9d353458318e43e7b25ebbf88fefeaa9`](https://gummble.com/screens/sc_9d353458318e43e7b25ebbf88fefeaa9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 — 빈 인증 폼](<screens/05_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | 로그인 화면에서 종료; 삭제된 데이터 조회 없음 |

## 4. 화면별 상세 분석

### 단계 01 — Profile Settings

- Screen ID: `sc_f81cdd742f9d4d09b96c9de95c4d0390`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8881986d-5358-4529-a8dc-52332465d205.png)
- 로컬 이미지: [01_sc_f81cdd742f9d4d09b96c9de95c4d0390.png](<screens/01_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_333de9739d2740deba8e20dda49a7443`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 5개 탭, Account 내부 왼쪽 7개 세부 메뉴, 오른쪽 프로필 카드와 하단 Delete Account 일부.
- 입력 항목·필수 표시·기본값: First name Joe, Last name Doe, Email, Title의 회색 Operations Director 예시. JD 아바타와 제거 X. 별표 없음.
- 버튼·메뉴·안내 문구: Save Changes, Update Password 접기/펼치기.
- 확인된 상태: Profile Settings 선택. 개인 사진은 이니셜 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 개인 이름·로그인 이메일·직함과 사진을 수정하는 화면.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인.

#### 모델링 영향

- 후보와 근거: 개인 프로필과 인증정보 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Profile Settings 하단 삭제 진입

- Screen ID: `sc_333de9739d2740deba8e20dda49a7443`
- 원본: [화면 페이지](https://gummble.com/screens/sc_333de9739d2740deba8e20dda49a7443?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1b652aeb-8619-4f1a-8c31-41a7bb92491b.png)
- 로컬 이미지: [02_sc_333de9739d2740deba8e20dda49a7443.png](<screens/02_sc_333de9739d2740deba8e20dda49a7443.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f81cdd742f9d4d09b96c9de95c4d0390` → 현재 → `sc_7e6f8362d63b405a88ccff1cd6bf8b1b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로필 카드 아래 별도 Delete Account 카드. 빨간 테두리 버튼.
- 입력 항목·필수 표시·기본값: 프로필 입력은 그대로. 삭제 전 추가 입력 없음.
- 버튼·메뉴·안내 문구: Delete Account; 계정과 데이터를 삭제한다는 짧은 설명.
- 확인된 상태: 상단 탭이 스크롤 밖, 삭제 카드가 완전히 노출.
- 단계 간 변화: 하단 Delete Account로 스크롤

#### 동작과 데이터

- 화면 관찰: 개인 정보 저장과 계정 삭제가 별도 액션.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 삭제 권한·유료 구독 경고 미확인.

#### 모델링 영향

- 후보와 근거: 고위험 계정 작업 별도 경로 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Confirm Account Deletion — 빈 비밀번호

- Screen ID: `sc_7e6f8362d63b405a88ccff1cd6bf8b1b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7e6f8362d63b405a88ccff1cd6bf8b1b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d0cfadd5-b14a-42da-9dfa-4920626b9275.png)
- 로컬 이미지: [03_sc_7e6f8362d63b405a88ccff1cd6bf8b1b.png](<screens/03_sc_7e6f8362d63b405a88ccff1cd6bf8b1b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_333de9739d2740deba8e20dda49a7443` → 현재 → `sc_5b20d97add43411d9b934127f294db18`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경 위 중앙 좁은 모달, 우측 외부 닫기 X.
- 입력 항목·필수 표시·기본값: Current Password 빈 필드, 필수 별표 없음.
- 버튼·메뉴·안내 문구: Yes, Delete My Account 빨간 버튼. 고객은 서명 계약·결제 완료 청구서 기록에 계속 접근 안내.
- 확인된 상태: 삭제 전 확인 상태.
- 단계 간 변화: 삭제 확인 모달

#### 동작과 데이터

- 화면 관찰: 삭제 대상 안내와 수신자 접근 보존 안내가 공존.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 보관 객체·삭제 지연·복구 여부 미확인.

#### 모델링 영향

- 후보와 근거: 삭제 요청과 문서 보존 예외 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Confirm Account Deletion — 비밀번호 입력

- Screen ID: `sc_5b20d97add43411d9b934127f294db18`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5b20d97add43411d9b934127f294db18?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6a4011f0-950d-4b2b-8f5a-a99b6c8e283b.png)
- 로컬 이미지: [04_sc_5b20d97add43411d9b934127f294db18.png](<screens/04_sc_5b20d97add43411d9b934127f294db18.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7e6f8362d63b405a88ccff1cd6bf8b1b` → 현재 → `sc_9d353458318e43e7b25ebbf88fefeaa9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 삭제 모달.
- 입력 항목·필수 표시·기본값: Current Password가 마스킹됨.
- 버튼·메뉴·안내 문구: 빨간 최종 삭제 버튼과 X.
- 확인된 상태: 에러 없이 비밀번호 입력된 상태.
- 단계 간 변화: Current Password 입력

#### 동작과 데이터

- 화면 관찰: 확인 입력만 보이며 이 단계에서는 삭제 결과 없음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 비밀번호 재인증 성공 여부·2FA 필요 여부 미확인.

#### 모델링 영향

- 후보와 근거: 민감 작업 재인증 후보; 비밀번호 원문 저장 가정 없음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 로그인 — 빈 인증 폼

- Screen ID: `sc_9d353458318e43e7b25ebbf88fefeaa9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9d353458318e43e7b25ebbf88fefeaa9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b509948c-e5f3-488b-aa87-4b9c6560fb90.png)
- 로컬 이미지: [05_sc_9d353458318e43e7b25ebbf88fefeaa9.png](<screens/05_sc_9d353458318e43e7b25ebbf88fefeaa9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5b20d97add43411d9b934127f294db18` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 왼쪽 로고와 오른쪽 Log In·Sign Up. 본문 왼쪽은 스크롤 가능한 The Changelog 카드, 오른쪽은 세로 로그인 카드다.
- 입력 항목·필수 표시·기본값: Email·Password는 비어 있고 reCAPTCHA 체크박스는 선택되지 않았다. 이 캡처에서 입력 필수 별표나 오류 문구는 보이지 않는다.
- 버튼·메뉴·안내 문구: Sign in with Google·Sign in with Apple, 초록색 Log in, Reset Password·Resend Verification Email. Changelog에는 여러 New 표시와 Bonsai updates 링크가 있다.
- 확인된 상태: 로그인 입력 전 화면이다. 계정 삭제 완료나 비밀번호 재설정 완료 안내는 없다.
- 단계 간 변화: 로그인 화면으로 전환

#### 동작과 데이터

- 화면 관찰: 인증 방식 선택과 이메일·비밀번호 입력 진입점을 확인한다. 로그인·비밀번호 재설정·계정 삭제 플로우가 같은 이미지를 다른 맥락에서 사용한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 화면으로 이동하기 전의 서버 처리, 인증 세션 종료 사유, 계정 존재·삭제 상태는 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 인증 제공자, 자격 증명 입력과 검증 오류, 비밀번호 재설정·메일 확인 경로 후보. 화면 이동과 계정의 삭제 상태는 별도로 판단한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 모달은 프로젝트·제안·계약·청구서 삭제를 안내하면서 고객의 서명된 계약과 결제된 청구서 접근은 남긴다고 표시한다.
- 비밀번호가 가려져 입력되며 잘못된 비밀번호·빈 값 오류는 수록되지 않았다.
- 로그인 화면 도달은 세션 이탈 근거이며 물리 삭제·보존 기간의 증거는 아니다.

## 6. 공식 도움말과 API 대조

- [계정 비활성화·삭제](https://help.hellobonsai.com/en/articles/1021483-how-to-deactivate-or-delete-your-bonsai-account): 2026-08-14 문서는 비활성화의 데이터 보관 및 지원팀 영구 삭제를 분리한다. 캡처와 정책 차이를 재확인해야 한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 계정 비활성 상태·세션 종료·삭제 요청과 문서 수신자 접근권을 분리하는 후보.
- 서명·지급 완료 문서의 보존 경계는 사용자 계정 삭제 cascade로 확정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 현재 정책을 기준으로 복제할지 캡처 UI를 기준으로 할지 구현 전에 결정할 것.
- 삭제 후 수신자 문서 링크, 다른 멤버, 결제 이력 보존 여부는 지원 문서와 테스트 계정으로 확인할 것.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

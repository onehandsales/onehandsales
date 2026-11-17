# Onboarding 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f714101f-db6b-4bfe-9ed1-74d6b0d6243c` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f714101f-db6b-4bfe-9ed1-74d6b0d6243c) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

랜딩의 이메일 입력을 가입 폼으로 전달하고 이름·비밀번호·CAPTCHA를 검증한 뒤 사업 설문으로 이동한다.

- 계정 생성과 사업 설정은 분리된 흐름. 하위 Completing account setup이 이어진다.
- Google 가입 대안은 보이지만 실제 연동은 수록되지 않았다.

- 하위 플로우: [Completing account setup](Completing%20account%20setup/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_07904520440b4dc7ad7d6d31bf3a03e9`](https://gummble.com/screens/sc_07904520440b4dc7ad7d6d31bf3a03e9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 공개 랜딩 히어로 | 랜딩 이메일 입력 |
| 02 | [`sc_e0a408a1e1dd4ea39f54dcef37d2bbf7`](https://gummble.com/screens/sc_e0a408a1e1dd4ea39f54dcef37d2bbf7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 랜딩 이메일 입력 | 이메일이 채워진 가입 폼 |
| 03 | [`sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838`](https://gummble.com/screens/sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 이메일 선입력 가입 폼 | 이름 입력 |
| 04 | [`sc_75b60a729ef7491186049534632edfe4`](https://gummble.com/screens/sc_75b60a729ef7491186049534632edfe4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 이름 입력 | 짧은 비밀번호 강도 표시 |
| 05 | [`sc_3381bd3528ea401e94549c86a8f80af8`](https://gummble.com/screens/sc_3381bd3528ea401e94549c86a8f80af8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비밀번호 Too Weak | 최소 길이 오류 |
| 06 | [`sc_2adb02c3443f4da292d72c200694c1c9`](https://gummble.com/screens/sc_2adb02c3443f4da292d72c200694c1c9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비밀번호 길이 오류 | 비밀번호 수정 |
| 07 | [`sc_ca23a435daac40318703fcf7360a09d2`](https://gummble.com/screens/sc_ca23a435daac40318703fcf7360a09d2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비밀번호 수정 | Strong·CAPTCHA완료 |
| 08 | [`sc_de06dffb50094b20bee94b68be710837`](https://gummble.com/screens/sc_de06dffb50094b20bee94b68be710837?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 가입 제출 준비 | 가입 처리 중 |
| 09 | [`sc_817952152d2a4b62b44bf1a21bf44509`](https://gummble.com/screens/sc_817952152d2a4b62b44bf1a21bf44509?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 가입 처리 중 | 사업 설문 첫 단계 |
| 10 | [`sc_33b333fba9d34edbbd66ddfadf29dcb4`](https://gummble.com/screens/sc_33b333fba9d34edbbd66ddfadf29dcb4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 사업 설정 시작 | 하위 계정 설정으로 연결 |

## 4. 화면별 상세 분석

### 단계 01 — 공개 랜딩 히어로

- Screen ID: `sc_07904520440b4dc7ad7d6d31bf3a03e9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_07904520440b4dc7ad7d6d31bf3a03e9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d329f184-0b0c-43f3-b3d4-2cf6c78242f1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_e0a408a1e1dd4ea39f54dcef37d2bbf7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 로고/주메뉴, 보조 고객군 링크. 좌측 대형 제목·이메일 CTA, 우측 인물과 식물·알림 그래픽.
- 입력 항목·필수 표시·기본값: Enter your email 빈 입력.
- 버튼·메뉴·안내 문구: Log in, Start free, Product/Industries/Templates/Pricing/Resources/Reviews.
- 확인된 상태: 미인증 마케팅 페이지. 그래픽의 인보이스·비용은 실제 계정 데이터가 아님.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 가입과 로그인 진입점 분리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이메일 전달 방식·쿠키·반응형 미확인.

#### 모델링 영향

- 후보와 근거: 공개 콘텐츠와 가입 진입 UI 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 랜딩 이메일 입력

- Screen ID: `sc_e0a408a1e1dd4ea39f54dcef37d2bbf7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e0a408a1e1dd4ea39f54dcef37d2bbf7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9a1f9b3c-b62c-4c68-a5da-b39a53f90a3c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_07904520440b4dc7ad7d6d31bf3a03e9` → 현재 → `sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838`

#### 화면에서 직접 확인한 내용

- 레이아웃: 히어로 이메일 CTA 영역.
- 입력 항목·필수 표시·기본값: jdoe.mobbin@gmail.com 입력.
- 버튼·메뉴·안내 문구: Start free, 상단 Log in.
- 확인된 상태: 가입 전 랜딩.
- 단계 간 변화: 랜딩 이메일 입력

#### 동작과 데이터

- 화면 관찰: 입력 이메일이 다음 가입 폼에 유지된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: URL/스토리지 전달 방식 미확인.

#### 모델링 영향

- 후보와 근거: 가입 유입 컨텍스트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 이메일 선입력 가입 폼

- Screen ID: `sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fcec59ed-9a62-4dec-a7d2-ac2683d76d1d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e0a408a1e1dd4ea39f54dcef37d2bbf7` → 현재 → `sc_75b60a729ef7491186049534632edfe4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 카드, 상단 Google 가입, 아래 Email/Full Name/Password/CAPTCHA.
- 입력 항목·필수 표시·기본값: 이메일 미리 채움. 이름 Jane Smith 예시, 비밀번호 회색 placeholder. 최소10자 안내.
- 버튼·메뉴·안내 문구: Create Free Account, 눈아이콘, 약관, Log in.
- 확인된 상태: 가입 전.
- 단계 간 변화: 이메일이 채워진 가입 폼

#### 동작과 데이터

- 화면 관찰: 랜딩에서 입력한 이메일 전달.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 개인 이름 분리 방식·필수 조건 미확인.

#### 모델링 영향

- 후보와 근거: 계정 생성 입력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 이름 입력

- Screen ID: `sc_75b60a729ef7491186049534632edfe4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_75b60a729ef7491186049534632edfe4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/02c95150-f7a9-430d-b86d-3e51f73e28e7.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838` → 현재 → `sc_3381bd3528ea401e94549c86a8f80af8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 가입 카드.
- 입력 항목·필수 표시·기본값: Full Name Joe Doe, 이메일 유지. 비밀번호 예시.
- 버튼·메뉴·안내 문구: Create Free Account.
- 확인된 상태: 이름 채움.
- 단계 간 변화: 이름 입력

#### 동작과 데이터

- 화면 관찰: 단일 Full Name 필드로 입력 받음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: First/Last 분리 규칙 미확인.

#### 모델링 영향

- 후보와 근거: full name 수집과 프로필 성/이름 변환 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 비밀번호 Too Weak

- Screen ID: `sc_3381bd3528ea401e94549c86a8f80af8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3381bd3528ea401e94549c86a8f80af8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c744740c-1995-4fd0-8e51-5076f8243c85.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_75b60a729ef7491186049534632edfe4` → 현재 → `sc_2adb02c3443f4da292d72c200694c1c9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 비밀번호 라벨 옆 빨간 강도 표시.
- 입력 항목·필수 표시·기본값: 짧은 마스킹 값, CAPTCHA 미체크.
- 버튼·메뉴·안내 문구: Too Weak, 최소10자 안내.
- 확인된 상태: 입력 중 강도 낮음.
- 단계 간 변화: 짧은 비밀번호 강도 표시

#### 동작과 데이터

- 화면 관찰: 강도 피드백 표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 원문·정확 길이 판단 불가.

#### 모델링 영향

- 후보와 근거: 강도 평가 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 비밀번호 길이 오류

- Screen ID: `sc_2adb02c3443f4da292d72c200694c1c9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2adb02c3443f4da292d72c200694c1c9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ac29dbd1-5d7a-48f3-a76c-08fd94d16273.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3381bd3528ea401e94549c86a8f80af8` → 현재 → `sc_ca23a435daac40318703fcf7360a09d2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 비밀번호 위 빨간 말풍선.
- 입력 항목·필수 표시·기본값: 이전 마스킹 값 유지.
- 버튼·메뉴·안내 문구: 10자 이상 필요 문구, Create Free Account.
- 확인된 상태: 검증 오류.
- 단계 간 변화: 최소 길이 오류

#### 동작과 데이터

- 화면 관찰: 최소 길이가 직접 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검증 트리거·다른 조합 규칙 미확인.

#### 모델링 영향

- 후보와 근거: 필드별 오류와 값 보존.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 비밀번호 수정

- Screen ID: `sc_ca23a435daac40318703fcf7360a09d2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ca23a435daac40318703fcf7360a09d2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/917b760c-4d05-46d9-9bb8-1427debdc735.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_2adb02c3443f4da292d72c200694c1c9` → 현재 → `sc_de06dffb50094b20bee94b68be710837`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오류 말풍선 사라진 폼.
- 입력 항목·필수 표시·기본값: 더 긴 마스킹 값, CAPTCHA 미체크.
- 버튼·메뉴·안내 문구: Create Free Account, 눈아이콘.
- 확인된 상태: 재입력 완료.
- 단계 간 변화: 비밀번호 수정

#### 동작과 데이터

- 화면 관찰: 입력 수정 후 길이 오류가 사라짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 강도 확정 시점 미확인.

#### 모델링 영향

- 후보와 근거: 검증 상태 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 가입 제출 준비

- Screen ID: `sc_de06dffb50094b20bee94b68be710837`
- 원본: [화면 페이지](https://gummble.com/screens/sc_de06dffb50094b20bee94b68be710837?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/95404ec0-df80-4762-ac6e-418f94194668.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ca23a435daac40318703fcf7360a09d2` → 현재 → `sc_817952152d2a4b62b44bf1a21bf44509`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 폼.
- 입력 항목·필수 표시·기본값: Password Strong, CAPTCHA 녹색 체크.
- 버튼·메뉴·안내 문구: Create Free Account.
- 확인된 상태: 입력·봇 검증 완료 표시.
- 단계 간 변화: Strong·CAPTCHA완료

#### 동작과 데이터

- 화면 관찰: 가입 요청 전 준비 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버 검증 성공은 아직 아님.

#### 모델링 영향

- 후보와 근거: 클라이언트 검증과 서버 처리 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 가입 처리 중

- Screen ID: `sc_817952152d2a4b62b44bf1a21bf44509`
- 원본: [화면 페이지](https://gummble.com/screens/sc_817952152d2a4b62b44bf1a21bf44509?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f26e3372-c3cd-4ed4-85cb-3373517442a0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_de06dffb50094b20bee94b68be710837` → 현재 → `sc_33b333fba9d34edbbd66ddfadf29dcb4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 폼 전체를 희게 덮고 중앙 화분 아이콘·대기 문구.
- 입력 항목·필수 표시·기본값: 배경 입력값 흐리게 유지.
- 버튼·메뉴·안내 문구: Hold tight / bonsai being planted 안내.
- 확인된 상태: 로딩 오버레이.
- 단계 간 변화: 가입 처리 중

#### 동작과 데이터

- 화면 관찰: 중복 제출 차단처럼 보이는 처리 중 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 타임아웃·오류 복귀·재시도 미확인.

#### 모델링 영향

- 후보와 근거: 계정 provision 진행 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 사업 설정 시작

- Screen ID: `sc_33b333fba9d34edbbd66ddfadf29dcb4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33b333fba9d34edbbd66ddfadf29dcb4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8887aa97-8db2-4046-b3c2-897983f8d066.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_817952152d2a4b62b44bf1a21bf44509` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 설문·5개 진행 표시, 우측 인물 사진·평점 소개.
- 입력 항목·필수 표시·기본값: Welcome Joe, 업무 종류 Type or select an option 빈 선택.
- 버튼·메뉴·안내 문구: Next 연한색.
- 확인된 상태: 첫 진행 표시만 녹색.
- 단계 간 변화: 사업 설문 첫 단계

#### 동작과 데이터

- 화면 관찰: 계정 가입 뒤 사업 맞춤 설정 진입.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 국가 초기값·설문 생략 여부 미확인.

#### 모델링 영향

- 후보와 근거: 온보딩 진행 상태와 사업 분류 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 최소10자 안내와 Too Weak/Strong 표시가 각각 존재한다.
- 최소 길이 오류는 비밀번호 입력 근처 말풍선이며 입력값은 유지.
- 약관 동의는 계정 생성 시 수락 문구 형태; 별도 체크박스가 보이지 않음.
- 가입 완료 후 설문 진입을 확인했으나 이메일 인증 과정은 수록되지 않음.

## 6. 공식 도움말과 API 대조

- [계정 설정 가이드](https://help.hellobonsai.com/en/articles/5588945-how-to-set-up-your-account-in-bonsai): 운영 회사·브랜딩·팀·고객·프로젝트 등 후속 설정을 안내한다. 캡처의 설문 단계·필수값·체험 일수와 동일한 현재 가입 계약을 제공하지는 않는다.
- [공개 API 인증](https://docs.hellobonsai.com/api): API key/OAuth 인증 설명은 앱의 로그인·가입·비밀번호 재설정 endpoint 계약이 아니다. 해당 웹 인증 요청·응답 필드는 미확인.

## 7. 데이터 모델링 시사점

- 사용자 계정·가입 입력·약관 수락과 사업 설문 응답을 분리하는 후보.
- 랜딩 이메일 선입력 전달과 가입 진행 상태 후보.

## 8. 미확인 사항과 검토 질문

- 가입 중복·이메일 인증·소셜 계정 연결·동의 버전 저장 방식 확인.
- 비밀번호 강도 판정과 최소 길이를 현재 정책으로 검증.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

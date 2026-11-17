# Giving a response 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **9/9단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b3f0ee03-c692-4960-8ed0-a8e15c1b4def` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b3f0ee03-c692-4960-8ed0-a8e15c1b4def) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 9단계 / 9단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

공개 폼에서 연락처와 업무 요구 사항을 입력하고 검증 오류를 해결해 제출한다.

- 관리자 편집 UI 없이 공개 응답 페이지에서 시작한다. 실제 계정에 우리가 제출한 것이 아니다.
- 제출 이메일은 응답 상세 Jane Studio 행과 같지만 입력 이름 Amanda Soh와 표시명이 달라 연결 규칙은 미확인.

- 상위 분석: [Form responses](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a45b5166d1c6437ba2e1fd1d4d87b10f`](https://gummble.com/screens/sc_a45b5166d1c6437ba2e1fd1d4d87b10f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 공개 폼 상단·미입력 | 필수 이름·이메일을 입력한다. |
| 02 | [`sc_f523de3696234de3a12d4cf76ac0a196`](https://gummble.com/screens/sc_f523de3696234de3a12d4cf76ac0a196?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 연락처 입력 | 중간 선택 질문으로 스크롤한다. |
| 03 | [`sc_398e7acbbe0a4cf4894e1a1ab20de108`](https://gummble.com/screens/sc_398e7acbbe0a4cf4894e1a1ab20de108?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 매체·파일 형식 질문 | 매체 3개를 선택한다. |
| 04 | [`sc_e4f7f6e9b4a4415a981a8e1e0087faa6`](https://gummble.com/screens/sc_e4f7f6e9b4a4415a981a8e1e0087faa6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 매체 복수 선택 | 파일 형식 2개를 선택한다. |
| 05 | [`sc_cf8f4af472bd48ab96758fd5eaaaac13`](https://gummble.com/screens/sc_cf8f4af472bd48ab96758fd5eaaaac13?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 파일 형식 복수 선택 | 하단으로 이동하고 결제 수단을 선택한다. 중간 브랜드 질문 선택은 미수록. |
| 06 | [`sc_b00e6cb760fc40cca163b65d7e7e7131`](https://gummble.com/screens/sc_b00e6cb760fc40cca163b65d7e7e7131?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 공개 폼 하단 | Submit 후 예산 숫자 오류가 나타난다. |
| 07 | [`sc_6bdb747ea183452fa342c126c23bd853`](https://gummble.com/screens/sc_6bdb747ea183452fa342c126c23bd853?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 숫자 필수 검증 오류 | 예산 200을 입력한다. |
| 08 | [`sc_71befab91e544228af7388e7ab2f8fa0`](https://gummble.com/screens/sc_71befab91e544228af7388e7ab2f8fa0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 예산 200 입력 | 다시 제출해 성공 화면으로 이동한다. |
| 09 | [`sc_6b71b0df7a1f4054b911d5b6b1328229`](https://gummble.com/screens/sc_6b71b0df7a1f4054b911d5b6b1328229?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 제출 완료 | 응답 제출 성공. Bonsai 가입 유도는 별도 후속 행동이다. |

## 4. 화면별 상세 분석

### 단계 01 — 공개 폼 상단·미입력

- Screen ID: `sc_a45b5166d1c6437ba2e1fd1d4d87b10f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a45b5166d1c6437ba2e1fd1d4d87b10f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/479cb153-69f6-42b1-9920-9fcd08c83044.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f523de3696234de3a12d4cf76ac0a196`

#### 화면에서 직접 확인한 내용

- 레이아웃: 브랜드 배경 위 중앙 흰 카드, 로고·제목·설명. 관리자 메뉴/사이드바가 없다.
- 입력 항목·필수 표시·기본값: First Name*, Last Name*, Email*에 회색 예시; 사업 웹사이트·법적 이름 질문에는 별표가 보이지 않는다.
- 버튼·메뉴·안내 문구: 텍스트 입력, 페이지 스크롤.
- 확인된 상태: 공개 페이지에서 필수 별표가 명시된다. 편집기 표시와 다르다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 실제 응답 입력 화면이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 옵션 변경 경로·로그인 요구·URL 유효성은 미확인.

#### 모델링 영향

- 후보와 근거: 질문 정의의 필수 여부와 공개 렌더링 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 연락처 입력

- Screen ID: `sc_f523de3696234de3a12d4cf76ac0a196`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f523de3696234de3a12d4cf76ac0a196?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c8036afb-bdb9-4acb-b576-a0f0f6658eea.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a45b5166d1c6437ba2e1fd1d4d87b10f` → 현재 → `sc_398e7acbbe0a4cf4894e1a1ab20de108`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 공개 폼 상단.
- 입력 항목·필수 표시·기본값: First Name Amanda, Last Name Soh, Email janesmith1.mobbin@gmail.com. 웹사이트/사업명은 비어 있다.
- 버튼·메뉴·안내 문구: 각 입력란, 스크롤.
- 확인된 상태: 필수 연락처 값이 채워졌다.
- 단계 간 변화: 필수 이름·이메일을 입력한다.

#### 동작과 데이터

- 화면 관찰: 응답 초안 입력이며 아직 제출되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이메일 검증·동일 이메일 고객 매칭은 미확인.

#### 모델링 영향

- 후보와 근거: 제출된 이름/이메일과 기존 고객 정보 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 매체·파일 형식 질문

- Screen ID: `sc_398e7acbbe0a4cf4894e1a1ab20de108`
- 원본: [화면 페이지](https://gummble.com/screens/sc_398e7acbbe0a4cf4894e1a1ab20de108?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d1276e5d-ff45-4135-876c-45a2f38e4dd0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f523de3696234de3a12d4cf76ac0a196` → 현재 → `sc_e4f7f6e9b4a4415a981a8e1e0087faa6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중간 부분에 체크박스가 세로로 나열된다.
- 입력 항목·필수 표시·기본값: 매체: Logo, Illustrations/Infographics, 1 or 2-pager, Multi-page booklet, Map, Printed ad, Postcard, Powerpoint, E-newsletter, Poster, Other. 파일 형식*: .ppt, PDF, .png, Word doc, .eps, .jpg, .gif. 모두 미선택.
- 버튼·메뉴·안내 문구: 각 체크박스, 스크롤.
- 확인된 상태: 매체는 별표가 없고 파일 형식은 필수다.
- 단계 간 변화: 중간 선택 질문으로 스크롤한다.

#### 동작과 데이터

- 화면 관찰: 여러 값 선택 가능한 질문 구조를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 선택 개수 상한·Other 입력 확장 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 선택지 ID/라벨/순서와 다중 답변 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 매체 복수 선택

- Screen ID: `sc_e4f7f6e9b4a4415a981a8e1e0087faa6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e4f7f6e9b4a4415a981a8e1e0087faa6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b7fee55f-8e15-4cfa-a091-2de196b58160.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_398e7acbbe0a4cf4894e1a1ab20de108` → 현재 → `sc_cf8f4af472bd48ab96758fd5eaaaac13`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 체크박스 영역.
- 입력 항목·필수 표시·기본값: Logo, E-newsletter, Poster 선택. 나머지 매체와 파일 형식은 미선택.
- 버튼·메뉴·안내 문구: 체크박스.
- 확인된 상태: 세 항목이 동시에 체크되어 있다.
- 단계 간 변화: 매체 3개를 선택한다.

#### 동작과 데이터

- 화면 관찰: 매체 답변 집합 변화.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미선택 해제 시 저장·다른 선택 영향은 미확인.

#### 모델링 영향

- 후보와 근거: 다대다 또는 배열 등 표현은 설계 후보이며 아직 확정하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 파일 형식 복수 선택

- Screen ID: `sc_cf8f4af472bd48ab96758fd5eaaaac13`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cf8f4af472bd48ab96758fd5eaaaac13?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a77b6c12-5309-456e-bee9-336bbfba74bc.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e4f7f6e9b4a4415a981a8e1e0087faa6` → 현재 → `sc_b00e6cb760fc40cca163b65d7e7e7131`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 중간 영역.
- 입력 항목·필수 표시·기본값: 매체 3개 유지, 필수 파일 형식 PDF와 .png 선택.
- 버튼·메뉴·안내 문구: 체크박스, 스크롤.
- 확인된 상태: 파일 형식 2개가 선택되었다.
- 단계 간 변화: 파일 형식 2개를 선택한다.

#### 동작과 데이터

- 화면 관찰: 필수 질문도 다중 값 답변을 허용하는 예시다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 최소/최대 선택 제약 전체는 미확인.

#### 모델링 영향

- 후보와 근거: 질문 필수 여부와 답변 cardinality를 별도 표현할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 공개 폼 하단

- Screen ID: `sc_b00e6cb760fc40cca163b65d7e7e7131`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b00e6cb760fc40cca163b65d7e7e7131?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8fc24fc3-875a-4ee6-b375-3694e229ebd9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_cf8f4af472bd48ab96758fd5eaaaac13` → 현재 → `sc_6bdb747ea183452fa342c126c23bd853`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첨부·예산·결제·날짜 질문 및 Submit, Powered by Bonsai footer.
- 입력 항목·필수 표시·기본값: 선택 파일 없음; 예산(USD)* 회색0; 결제 수단* Credit card 선택(6개 라디오); 시작일 YYYY-MM-DD 비어 있음.
- 버튼·메뉴·안내 문구: Add a new file, 날짜 달력, Submit.
- 확인된 상태: 별표 없는 첨부/날짜와 필수 숫자/단일선택을 확인한다.
- 단계 간 변화: 하단으로 이동하고 결제 수단을 선택한다. 중간 브랜드 질문 선택은 미수록.

#### 동작과 데이터

- 화면 관찰: 아직 제출 전이며 예산은 입력되지 않은 상태로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 중간 브랜드 재작업 질문 선택 단계는 미수록.

#### 모델링 영향

- 후보와 근거: 첨부 답변·숫자 답변·날짜 답변의 선택/필수 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 숫자 필수 검증 오류

- Screen ID: `sc_6bdb747ea183452fa342c126c23bd853`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6bdb747ea183452fa342c126c23bd853?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4bd88672-c124-46f2-a06c-85a2000a487a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b00e6cb760fc40cca163b65d7e7e7131` → 현재 → `sc_71befab91e544228af7388e7ab2f8fa0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 예산란 빨간 테두리 및 아래 오류; Submit 아래 일반 오류.
- 입력 항목·필수 표시·기본값: 예산 회색0 유지, Credit card 선택, 날짜 비어 있음.
- 버튼·메뉴·안내 문구: Submit, 예산 입력.
- 확인된 상태: Please enter a number value 및 상단 오류 수정 요청이 나타난다.
- 단계 간 변화: Submit 후 예산 숫자 오류가 나타난다.

#### 동작과 데이터

- 화면 관찰: 제출 시 빈 숫자 입력을 막는 검증을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 0 자체를 금지하는 규칙이라는 증거는 아니다. 서버/클라이언트 검증 위치 미확인.

#### 모델링 영향

- 후보와 근거: 빈 값/실제0/숫자 형식을 구분하는 검증 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 예산 200 입력

- Screen ID: `sc_71befab91e544228af7388e7ab2f8fa0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_71befab91e544228af7388e7ab2f8fa0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e1db65ca-f5e2-4941-aa38-b943568be97c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_6bdb747ea183452fa342c126c23bd853` → 현재 → `sc_6b71b0df7a1f4054b911d5b6b1328229`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 하단 폼.
- 입력 항목·필수 표시·기본값: 예산 검은200 입력, Credit card 유지, 날짜 비어 있음.
- 버튼·메뉴·안내 문구: Submit, 숫자 입력.
- 확인된 상태: 200 입력 후에도 이전 빨간 오류가 남아 있는 순간이다.
- 단계 간 변화: 예산 200을 입력한다.

#### 동작과 데이터

- 화면 관찰: 입력 변경과 오류 해제 타이밍이 별개다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: blur 또는 재제출 시 해제되는지 미확인.

#### 모델링 영향

- 후보와 근거: 검증 메시지 갱신 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 응답 제출 완료

- Screen ID: `sc_6b71b0df7a1f4054b911d5b6b1328229`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6b71b0df7a1f4054b911d5b6b1328229?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/084cbe8a-62fe-4187-a375-df995e9964c9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_71befab91e544228af7388e7ab2f8fa0` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 브랜드 배경의 성공 카드와 가입 유도 박스.
- 입력 항목·필수 표시·기본값: Thank you, 제출 성공 안내. Create your own form with Bonsai 아래 제출 이메일이 채워져 있다.
- 버튼·메뉴·안내 문구: Continue(가입 유도), 이메일 입력.
- 확인된 상태: 응답 폼은 사라지고 성공 화면이 된다.
- 단계 간 변화: 다시 제출해 성공 화면으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 제출 성공 확인. Continue는 제출 확정 버튼이 아니라 후속 가입 행동이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 고객 생성/알림/중복/뒤로 가기·재제출은 미확인.

#### 모델링 영향

- 후보와 근거: 응답 완료 상태와 별도 가입 전환을 분리한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 공개 폼에는 First Name/Last Name/Email, 파일 형식, 예산, 결제 수단에 별표가 있다.
- [관찰] 회색 0은 예산 기본값으로 취급하면 안 된다. 빈 숫자 검증 오류 후 200 입력으로 제출된다.
- [관찰] 매체/파일 형식은 복수 선택, 결제 수단은 단일 선택이다.
- [관찰] 제출 후 Thank you와 성공 문구, 응답 이메일이 채워진 Bonsai 가입 CTA가 나타난다.
- [미확인] 중복 제출 방지·고객 자동 생성/매칭·알림·자동화 실행은 이 흐름에서 확인되지 않는다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 폼을 통한 구조화 정보 수집과 질문별 필수 설정을 설명한다.
- [공개 API 문서](https://docs.hellobonsai.com/api): 검토한 공개 리소스 목록에서 Forms/Questions/Responses 전용 endpoint와 필드 계약을 확인하지 못했다. Documents API를 폼 API로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 제출자 정보와 고객 참조, 응답 묶음/제출시각, 질문별 타입·필수 검증 및 다중 선택 답변 후보.
- 숫자 0·빈 값·검증 실패를 구분하고 응답 제출 성공과 마케팅 가입을 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 기존 고객 이메일 일치 시 이름 갱신/매칭·새 고객 생성 여부를 확인한다.
- 이메일·이름·숫자 범위/소수·날짜 검증, 필수 선택 최소 개수와 파일 제한을 확인한다.
- 공개 링크의 반복 제출·봇 방지·만료·권한·성공 메시지 커스터마이징을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 9개와 실제 이미지 9개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

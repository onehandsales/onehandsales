# Using invoice generator 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `1a82151c-9539-4a12-8a4d-706c8557370b` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=1a82151c-9539-4a12-8a4d-706c8557370b) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

공개 방문자가 고객·항목을 입력해 합계를 확인하고 다운로드 진입을 시도하는 흐름이다. 마지막은 가입 화면이다.

- 앱 내부 Invoicing 작성과 달리 공개 단순 계산 폼이다.
- 5단계 가입으로 이동하지만 실제 다운로드 파일·앱 저장 완료는 없다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b1b6a664a9bd4989b0250ed10b1bc18e`](https://gummble.com/screens/sc_b1b6a664a9bd4989b0250ed10b1bc18e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 공개 Invoice Generator 빈 폼 | 고객명·주소 입력 |
| 02 | [`sc_52707e230d0b4795928f1d906838bf74`](https://gummble.com/screens/sc_52707e230d0b4795928f1d906838bf74?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 정보 입력 | Poster Design 1×10 입력, 합계11.50 표시 |
| 03 | [`sc_8215ecb188434108956b1e25f408c5ce`](https://gummble.com/screens/sc_8215ecb188434108956b1e25f408c5ce?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 첫 항목과 합계 | 빈 항목 행이 하나 추가됨 |
| 04 | [`sc_14f6d99be9f242d086fa899d0b1c04a6`](https://gummble.com/screens/sc_14f6d99be9f242d086fa899d0b1c04a6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 두 번째 빈 항목 추가 | 가입 화면으로 전환; 다운로드 클릭 자체·파일 결과 미수록 |
| 05 | [`sc_fb989694d5964b2aa7081a4902cbbd29`](https://gummble.com/screens/sc_fb989694d5964b2aa7081a4902cbbd29?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 계정 생성 화면으로 전환 | 가입 전 빈 폼에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 공개 Invoice Generator 빈 폼

- Screen ID: `sc_b1b6a664a9bd4989b0250ed10b1bc18e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b1b6a664a9bd4989b0250ed10b1bc18e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c98af851-8e87-4e74-8864-7c9040a9f00b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_52707e230d0b4795928f1d906838bf74`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 회색 둥근 패널·제목, 고객 필드, 큰 여백 뒤 항목 표·합계·기한.
- 입력 항목·필수 표시·기본값: Client Name 단일칸, Client Address 다중칸, Description·Quantity·Unit Price 빈값. Subtotal/Tax15%/Total0. Due Date15/02/2024. 별표 없음.
- 버튼·메뉴·안내 문구: 행 Remove, Add Item, 하단 다운로드 버튼 일부.
- 확인된 상태: 로그인 없이 보이는 단순 생성기 형태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 필수 표시 없음은 저장 시 선택값임을 증명하지 않는다. 15%는 이 도구 표시다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 통화·필수값·세율 변경·기한 기본값 기준 미확인.

#### 모델링 영향

- 후보와 근거: 익명 문서 입력 상태·항목·표시 합계 후보; 앱 Invoice와 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 고객 정보 입력

- Screen ID: `sc_52707e230d0b4795928f1d906838bf74`
- 원본: [화면 페이지](https://gummble.com/screens/sc_52707e230d0b4795928f1d906838bf74?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/23bfaa5c-0ccd-4ac1-8938-533912ff27b5.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b1b6a664a9bd4989b0250ed10b1bc18e` → 현재 → `sc_8215ecb188434108956b1e25f408c5ce`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 폼에서 고객명·주소만 채워진다.
- 입력 항목·필수 표시·기본값: Jane Studio, 1226 University Dr, Menlo Park, CA 94025, USA. 항목은 빈값.
- 버튼·메뉴·안내 문구: Remove·Add Item.
- 확인된 상태: 합계0, 기한 동일.
- 단계 간 변화: 고객명·주소 입력

#### 동작과 데이터

- 화면 관찰: 고객 검색/자동완성 증거 없이 문자열 입력만 관찰된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: CRM 고객 생성·저장·브라우저 보존 미확인.

#### 모델링 영향

- 후보와 근거: 문서에 기입한 고객정보 스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 첫 항목과 합계

- Screen ID: `sc_8215ecb188434108956b1e25f408c5ce`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8215ecb188434108956b1e25f408c5ce?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/214f5aaf-aacf-49e9-9b38-ac5fca1f3560.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_52707e230d0b4795928f1d906838bf74` → 현재 → `sc_14f6d99be9f242d086fa899d0b1c04a6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 스크롤되어 항목 표·합계·Download Invoice가 보인다.
- 입력 항목·필수 표시·기본값: Poster Design, Quantity1, Unit Price10. 행10.00·Subtotal10.00·Tax1.50·Total11.50.
- 버튼·메뉴·안내 문구: Remove·Add Item·Download Invoice; Unit Price 포커스.
- 확인된 상태: 표시값은1×10과15%세금 계산에 맞는다.
- 단계 간 변화: Poster Design 1×10 입력, 합계11.50 표시

#### 동작과 데이터

- 화면 관찰: 입력 변경에 합계가 갱신됐으나 계산 위치·정밀도는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 반올림·음수/0·다중 통화·세율 수정 미확인.

#### 모델링 영향

- 후보와 근거: 항목 단가·수량·세금·총액 후보; 통화/정밀도 추가 확인.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 두 번째 빈 항목 추가

- Screen ID: `sc_14f6d99be9f242d086fa899d0b1c04a6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_14f6d99be9f242d086fa899d0b1c04a6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/880bd588-f7e3-4918-963d-efee957c105e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8215ecb188434108956b1e25f408c5ce` → 현재 → `sc_fb989694d5964b2aa7081a4902cbbd29`

#### 화면에서 직접 확인한 내용

- 레이아웃: 항목 표가2행으로 늘고 합계 영역이 내려간다.
- 입력 항목·필수 표시·기본값: 첫 행1×10 유지; 둘째 Description·Quantity·Unit Price 빈값. Total11.50 유지.
- 버튼·메뉴·안내 문구: 각 행 Remove, Add Item, Download Invoice.
- 확인된 상태: 빈 행 추가가 기존 합계에 영향을 주지 않는다.
- 단계 간 변화: 빈 항목 행이 하나 추가됨

#### 동작과 데이터

- 화면 관찰: 행 추가 UI만 확인하며 실제 문서 저장은 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 행 다운로드 허용·최대 행수·삭제 후 합계 미확인.

#### 모델링 영향

- 후보와 근거: 가변 길이 항목 배열·빈 편집행 처리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 계정 생성 화면으로 전환

- Screen ID: `sc_fb989694d5964b2aa7081a4902cbbd29`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fb989694d5964b2aa7081a4902cbbd29?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f402ea91-e942-4778-b261-5c04a0d2a6ef.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_14f6d99be9f242d086fa899d0b1c04a6` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 단순 로고 헤더·중앙 가입 카드·하단 잎 장식.
- 입력 항목·필수 표시·기본값: Work Email·Full Name·Password 빈/placeholder, 최소10자 안내, reCAPTCHA 미선택.
- 버튼·메뉴·안내 문구: Google 가입·비밀번호 표시·약관 링크·Create Free Account·Log in.
- 확인된 상태: 이메일·이름·이전 청구서 정보가 명시적으로 넘어온 표시는 없다.
- 단계 간 변화: 가입 화면으로 전환; 다운로드 클릭 자체·파일 결과 미수록

#### 동작과 데이터

- 화면 관찰: 다운로드 대신 가입 화면이 마지막에 나타난다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전환 트리거·파일 생성 여부·이전 입력 보존·가입 후 복구 미확인.

#### 모델링 영향

- 후보와 근거: 가입 유입과 익명 초안 인계 후보; 저장을 가정하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰값10×15%=1.50, 총11.50이다. 세율15%를 모든 앱 청구서의 고정 세율로 적용하지 않는다.
- 빈 항목 추가 후 총액은 유지되며 저장 검증 정책은 미확인이다.
- 마지막 화면은 계정 생성 유도다. 다운로드 성공·DB Invoice 생성·CRM Client 생성으로 기록하지 않는다.
- 필드의 회색 Jane Smith·점들은 placeholder일 가능성이 있으므로 실제 개인정보 입력으로 단정하지 않는다.

## 6. 공식 도움말과 API 대조

- [공식 Invoice Generator](https://www.hellobonsai.com/invoice-generator): 현재 고객·항목·세금·기한 폼과 다운로드 진입을 확인했다. 현재 세금은 입력칸으로 표시되고 FAQ는 반복 청구·결제 추적·알림을 앱 기능과 구분한다. 캡처의 가입 전환과 현재 다운로드 실제 결과는 재현하지 않았다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.
- [공개 API 인증](https://docs.hellobonsai.com/api): API key/OAuth 인증 설명은 앱의 로그인·가입·비밀번호 재설정 endpoint 계약이 아니다. 해당 웹 인증 요청·응답 필드는 미확인.

## 7. 데이터 모델링 시사점

- 문서 입력 초안·고객정보 스냅샷·항목·계산 합계·가입 유입 후보.
- 익명 입력을 서버 저장하는지·가입 후 복구하는지·Invoice API를 호출하는지는 미확정.

## 8. 미확인 사항과 검토 질문

- 다운로드가 가입을 요구하는 조건과 파일 형식·입력 보존을 확인한다.
- 빈 행·음수·소수·필수값·반올림·세율 변경·통화·날짜 기준을 검증한다.
- Remove 실행·기한 수정·새로고침 후 상태·다운로드 실패 상태는 미수록이다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

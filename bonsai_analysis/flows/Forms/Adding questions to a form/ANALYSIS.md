# Adding questions to a form 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `0452bfda-8ddd-4d2f-8314-7370006c6c68` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=0452bfda-8ddd-4d2f-8314-7370006c6c68) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

기존 폼에 짧은 텍스트 질문과 날짜 질문을 추가한다.

- Graphic Design Brief 편집기에서 시작한다. 폼 자체 생성 과정은 이 흐름에 없다.
- 질문 응답 입력 UI처럼 보이는 부분은 편집기 미리보기이며 실제 제출값이 아니다.

- 상위 분석: [Forms](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_56bf12a78bd64f6b972ecb048efd8d14`](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 폼 편집기 상단 | Short Text Question을 선택한다. |
| 02 | [`sc_3e69691bb66b49979eaa625062680a36`](https://gummble.com/screens/sc_3e69691bb66b49979eaa625062680a36?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 짧은 텍스트 타입 선택 | 하단에 빈 짧은 텍스트 질문이 추가된다. |
| 03 | [`sc_2b9e21e119da49c9b9d9a6b749ad096a`](https://gummble.com/screens/sc_2b9e21e119da49c9b9d9a6b749ad096a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 빈 텍스트 질문 추가 | 질문 제목을 입력한다. |
| 04 | [`sc_7c915922ebe245faa672ea99c24272d6`](https://gummble.com/screens/sc_7c915922ebe245faa672ea99c24272d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 질문 제목 작성 | Date Select Question을 추가하고 날짜 질문 제목을 입력한다. 중간 클릭은 미수록. |
| 05 | [`sc_d1b24e0b191f46eaa9c392aeca812d49`](https://gummble.com/screens/sc_d1b24e0b191f46eaa9c392aeca812d49?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 날짜 질문 추가 | 두 질문이 하단에 추가된 상태로 끝난다. |

## 4. 화면별 상세 분석

### 단계 01 — 폼 편집기 상단

- Screen ID: `sc_56bf12a78bd64f6b972ecb048efd8d14`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cffd3242-bc9f-4d5b-89c4-617f504f36b3.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_3e69691bb66b49979eaa625062680a36`

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

### 단계 02 — 짧은 텍스트 타입 선택

- Screen ID: `sc_3e69691bb66b49979eaa625062680a36`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3e69691bb66b49979eaa625062680a36?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2c26f9f4-7279-4aba-8548-890f12a92636.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_56bf12a78bd64f6b972ecb048efd8d14` → 현재 → `sc_2b9e21e119da49c9b9d9a6b749ad096a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 편집기 상단 레이아웃 동일.
- 입력 항목·필수 표시·기본값: 기존 폼 내용 유지.
- 버튼·메뉴·안내 문구: Short Text Question 타일이 초록 테두리로 강조된다.
- 확인된 상태: 타입 선택 직후 또는 포커스 상태. 새 질문은 현재 뷰포트에 보이지 않는다.
- 단계 간 변화: Short Text Question을 선택한다.

#### 동작과 데이터

- 화면 관찰: 선택 신호만 확인되며 다음 화면에서 추가 결과를 대조한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 강조만으로 생성 완료를 판정하지 않는다.

#### 모델링 영향

- 후보와 근거: 질문 추가 명령과 선택 UI 상태 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 빈 텍스트 질문 추가

- Screen ID: `sc_2b9e21e119da49c9b9d9a6b749ad096a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2b9e21e119da49c9b9d9a6b749ad096a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/70399e16-9467-4028-8f32-8927e525b0d6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3e69691bb66b49979eaa625062680a36` → 현재 → `sc_7c915922ebe245faa672ea99c24272d6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 폼 하단으로 이동, 오른쪽 타입 목록 유지.
- 입력 항목·필수 표시·기본값: 기존 선호 결제 수단 라디오 Cash/Cheque·Credit card·Debit card·Bank transfer·Paypal/Stripe·Other. 그 아래 Enter a question… 및 한 줄 답변 입력.
- 버튼·메뉴·안내 문구: Add New Option, 새 질문 옆 설정/위/아래/삭제, Submit.
- 확인된 상태: 결제 수단 아래 새로운 빈 짧은 텍스트 질문이 있다.
- 단계 간 변화: 하단에 빈 짧은 텍스트 질문이 추가된다.

#### 동작과 데이터

- 화면 관찰: 질문 요소가 추가되었지만 답변 데이터 생성은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 제목 상태 저장 허용·Submit의 편집기 동작은 미확인.

#### 모델링 영향

- 후보와 근거: 질문 제목과 답변 타입을 별도 속성으로 다룰 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 질문 제목 작성

- Screen ID: `sc_7c915922ebe245faa672ea99c24272d6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7c915922ebe245faa672ea99c24272d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9aacd4f7-1053-4595-b731-d2b38e524ae6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_2b9e21e119da49c9b9d9a6b749ad096a` → 현재 → `sc_d1b24e0b191f46eaa9c392aeca812d49`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 하단 편집 위치.
- 입력 항목·필수 표시·기본값: Do you have any question for us? 제목 입력. 답변란은 Type your answer here… 회색.
- 버튼·메뉴·안내 문구: 질문 설정/이동/삭제, Submit, 타입 목록.
- 확인된 상태: 질문 제목이 채워지고 입력 커서가 끝에 있다.
- 단계 간 변화: 질문 제목을 입력한다.

#### 동작과 데이터

- 화면 관찰: 폼 정의의 라벨이 바뀌었다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 저장 요청·길이 제한·필수 상태는 미확인.

#### 모델링 영향

- 후보와 근거: 질문 라벨과 안정적인 질문 ID를 구분할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 날짜 질문 추가

- Screen ID: `sc_d1b24e0b191f46eaa9c392aeca812d49`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d1b24e0b191f46eaa9c392aeca812d49?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4349c7fb-e347-400b-99f5-e81d75ea85ab.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_7c915922ebe245faa672ea99c24272d6` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 기존 새 텍스트 질문 아래 날짜 질문이 생겼다.
- 입력 항목·필수 표시·기본값: When are you planning to kickstart the project?; 날짜 placeholder YYYY-MM-DD와 달력 아이콘. 위 질문 유지.
- 버튼·메뉴·안내 문구: Submit, Date Select Question, 목록 하단 Phone Number도 보인다.
- 확인된 상태: 짧은 텍스트 다음 날짜 순서가 확인된다.
- 단계 간 변화: Date Select Question을 추가하고 날짜 질문 제목을 입력한다. 중간 클릭은 미수록.

#### 동작과 데이터

- 화면 관찰: 두 질문 정의가 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 제한·시간대·기본 날짜·필수값 및 저장은 미확인.

#### 모델링 영향

- 후보와 근거: 날짜 전용 답변 타입과 질문 순서 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 질문 타입 목록과 질문별 설정·위아래·삭제 도구가 있다.
- [관찰] 마지막 화면에 날짜 질문이 추가되지만 선택·생성 중간 과정은 없다.
- [문서] 질문 필수 여부는 설정에서 조절할 수 있다. 이 흐름에서는 해당 설정을 열지 않았다.
- [미확인] 저장 버튼/완료 토스트가 없어 자동 저장을 구현 사실로 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 다양한 질문 타입 및 필수·순서·삭제 편집을 설명한다.
- [공개 API 문서](https://docs.hellobonsai.com/api): 검토한 공개 리소스 목록에서 Forms/Questions/Responses 전용 endpoint와 필드 계약을 확인하지 못했다. Documents API를 폼 API로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 폼 요소의 타입·제목·순서·필수 여부·선택지·표시 설정 후보.
- 응답 값을 가지는 질문과 Custom Content/Files Download 같은 설명 요소를 구분할 후보.

## 8. 미확인 사항과 검토 질문

- 필수 질문 표시, 검증 규칙, 중복 제목·빈 제목 처리 및 저장 타이밍을 확인한다.
- 질문 변경/삭제 후 기존 답변의 참조와 버전 보존을 확인한다.
- Phone Number·Website 등 전용 타입과 일반 텍스트 질문의 검증 차이를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

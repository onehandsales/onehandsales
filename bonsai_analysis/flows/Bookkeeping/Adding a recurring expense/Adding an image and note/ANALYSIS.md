# Adding an image and note 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `9fcdb469-f302-4610-b0b9-a5af091b5b26` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=9fcdb469-f302-4610-b0b9-a5af091b5b26) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

비용 생성 폼에 이미지와 메모를 추가하여 생성 전에 검토한다.

- 시작: 반복 30 Days가 입력된 New Expense 폼. 종료: 이미지 미리보기와 메모가 채워진 폼.
- 최종 비용 저장은 상위 반복 비용 생성의 Create Expense 이후 결과에서 확인한다.
- 프론트 구현: 이미지 선택 입력·미리보기·제거와 메모 필드의 독립 표시.

- 상위 분석: [Adding a recurring expense](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Bookkeeping/Adding a recurring expense/Adding an image and note`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b043c6159c5c471cbe94f4348870bdf7`](https://gummble.com/screens/sc_b043c6159c5c471cbe94f4348870bdf7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [반복 간격 수정](<screens/01_sc_b043c6159c5c471cbe94f4348870bdf7.png>) | 이미지 추가 컨트롤 활성. |
| 02 | [`sc_ea6533acea52451c8f19c819584eab7b`](https://gummble.com/screens/sc_ea6533acea52451c8f19c819584eab7b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 이미지 선택 진입](<screens/02_sc_ea6533acea52451c8f19c819584eab7b.png>) | 선택 이미지 미리보기와 Remove Image 표시. |
| 03 | [`sc_a3a06c2d5128407cadeefd3bd41b200c`](https://gummble.com/screens/sc_a3a06c2d5128407cadeefd3bd41b200c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 이미지 미리보기](<screens/03_sc_a3a06c2d5128407cadeefd3bd41b200c.png>) | Notes textarea 표시. |
| 04 | [`sc_68ada77e821c4aaaaa5f86ea891e9b3f`](https://gummble.com/screens/sc_68ada77e821c4aaaaa5f86ea891e9b3f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 메모 입력 영역](<screens/04_sc_68ada77e821c4aaaaa5f86ea891e9b3f.png>) | Travel notes 입력. |
| 05 | [`sc_6a379149894d4eaca9a9de59332165c3`](https://gummble.com/screens/sc_6a379149894d4eaca9a9de59332165c3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이미지·메모를 포함한 비용 폼](<screens/05_sc_6a379149894d4eaca9a9de59332165c3.png>) | 저장 전 폼 상태에서 하위 기록 종료. 상위 흐름으로 복귀. |

## 4. 화면별 상세 분석

### 단계 01 — 반복 간격 수정

- Screen ID: `sc_b043c6159c5c471cbe94f4348870bdf7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b043c6159c5c471cbe94f4348870bdf7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/36b9aeaa-ae20-4de4-9418-f8b8280be7ce.png)
- 로컬 이미지: [01_sc_b043c6159c5c471cbe94f4348870bdf7.png](<screens/01_sc_b043c6159c5c471cbe94f4348870bdf7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_ea6533acea52451c8f19c819584eab7b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Repeat Every 30 / Days, Billable·Recurring 선택. 프로젝트는 Select...
- 버튼·메뉴·안내 문구: Create Expense, Add Image/Receipt, Add Note.
- 확인된 상태: 오류 배너가 사라진 폼.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 30일 반복값의 한 사례. 매월과 30일을 같은 규칙으로 가정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 비용 이미지 선택 진입

- Screen ID: `sc_ea6533acea52451c8f19c819584eab7b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ea6533acea52451c8f19c819584eab7b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/666e965d-38db-4501-b897-89d32fc8189f.png)
- 로컬 이미지: [02_sc_ea6533acea52451c8f19c819584eab7b.png](<screens/02_sc_ea6533acea52451c8f19c819584eab7b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b043c6159c5c471cbe94f4348870bdf7` → 현재 → `sc_a3a06c2d5128407cadeefd3bd41b200c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: 비용 폼 유지, 우측 Add an image 입력 버튼.
- 버튼·메뉴·안내 문구: Add an image / Add Note / Create Expense.
- 확인된 상태: 이미지 선택 컨트롤 활성.
- 단계 간 변화: 이미지 추가 컨트롤 활성.

#### 동작과 데이터

- 화면 관찰: 운영체제 파일 선택창은 기록에 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 허용 확장자·파일 크기·복수 파일·드래그앤드롭·업로드 실패.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 비용 이미지 미리보기

- Screen ID: `sc_a3a06c2d5128407cadeefd3bd41b200c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a3a06c2d5128407cadeefd3bd41b200c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d79e6d9c-350b-4d2e-8983-9cb88fcc61fe.png)
- 로컬 이미지: [03_sc_a3a06c2d5128407cadeefd3bd41b200c.png](<screens/03_sc_a3a06c2d5128407cadeefd3bd41b200c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ea6533acea52451c8f19c819584eab7b` → 현재 → `sc_68ada77e821c4aaaaa5f86ea891e9b3f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: 우측 이미지 썸네일 표시. 메모 영역은 아직 없다.
- 버튼·메뉴·안내 문구: Remove Image / Add Note / Create Expense.
- 확인된 상태: 선택 이미지가 보이는 저장 전 폼.
- 단계 간 변화: 선택 이미지 미리보기와 Remove Image 표시.

#### 동작과 데이터

- 화면 관찰: 이미지 선택 결과가 표시되지만 업로드 응답·원본 저장 위치는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 비용 메모 입력 영역

- Screen ID: `sc_68ada77e821c4aaaaa5f86ea891e9b3f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_68ada77e821c4aaaaa5f86ea891e9b3f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e746d562-c68c-4cca-91e8-7be6bb30d755.png)
- 로컬 이미지: [04_sc_68ada77e821c4aaaaa5f86ea891e9b3f.png](<screens/04_sc_68ada77e821c4aaaaa5f86ea891e9b3f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a3a06c2d5128407cadeefd3bd41b200c` → 현재 → `sc_6a379149894d4eaca9a9de59332165c3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Notes 제목과 Add a description... 빈 textarea. 이미지 유지.
- 버튼·메뉴·안내 문구: Remove Image / 메모 입력 / Create Expense.
- 확인된 상태: 메모 필드가 펼쳐진 상태.
- 단계 간 변화: Notes textarea 표시.

#### 동작과 데이터

- 화면 관찰: 이미지와 메모는 각각 독립적으로 추가하는 UI로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메모 글자 수·서식·공개 범위·첨부와의 저장 원자성.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 이미지·메모를 포함한 비용 폼

- Screen ID: `sc_6a379149894d4eaca9a9de59332165c3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6a379149894d4eaca9a9de59332165c3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5ded1c45-67ba-456d-a114-381bfae6c8d8.png)
- 로컬 이미지: [05_sc_6a379149894d4eaca9a9de59332165c3.png](<screens/05_sc_6a379149894d4eaca9a9de59332165c3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_68ada77e821c4aaaaa5f86ea891e9b3f` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: 오른쪽 이미지 미리보기와 Notes에 Travel notes. 반복 30 Days와 비용 125 USD 유지.
- 버튼·메뉴·안내 문구: Remove Image / Create Expense / 닫기.
- 확인된 상태: 첨부와 메모가 채워졌고 비용 모달은 아직 열려 있다.
- 단계 간 변화: Travel notes 입력.

#### 동작과 데이터

- 화면 관찰: 미리보기를 파일 영구 저장 완료로 해석하지 않는다. 생성은 별도 Create Expense 진입점.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 이미지와 메모는 별도 추가 컨트롤이다.
- 관찰: 이미지 선택 후 미리보기·Remove Image가 나타난다.
- 관찰: 메모 입력은 다른 비용 값과 반복 설정을 유지한다.
- 미확인: 실제 업로드 완료 시점·이미지 삭제 시 서버 파일 제거·비용 취소 시 임시 파일 정리·고객 공개 여부.

## 6. 공식 도움말과 API 대조

- [비용과 청구서 연결 도움말](https://help.hellobonsai.com/en/articles/1262317-how-to-add-expenses-to-an-invoice)은 비용 작성 시 선택적 이미지와 메모를 설명한다. 파일 타입·용량·메모 공개 범위는 이 자료만으로 확정하지 않는다.
- 공개 API의 비용 이미지 업로드·메모 저장 endpoint는 미확인. 공개 URL·영구 저장·복수 첨부를 가정하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정: 비용과 파일 참조, 업로드/미리보기 상태, 메모 텍스트 후보.
- 파일 업로드와 비용 생성의 시간적 분리, 임시 파일 정리·소유 범위·서명 URL 정책을 별도로 확인한다.
- 이미지 한 장이 보인다고 최대 첨부 수를 1로 제한하지 않는다.

## 8. 미확인 사항과 검토 질문

- 이미지는 어떤 파일 타입·크기·개수를 허용하는가? 파일 선택창과 오류 화면 확인.
- Remove Image는 임시 참조 제거인가 저장 파일 삭제인가? 재진입과 네트워크 응답 확인.
- 메모·영수증이 청구서 또는 고객 포털에 노출되는가? 고객 관점 비교.
- 비용 생성 실패·모달 취소 후 업로드한 파일은 어떻게 정리되는가? 실제 계정 재현.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

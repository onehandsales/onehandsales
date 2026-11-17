# Editing invoice header 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **2/2단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `8eb71ff6-6686-4e7f-8092-5036ebff452f` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=8eb71ff6-6686-4e7f-8092-5036ebff452f) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 2단계 / 2단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

인보이스 상단에 브랜드용 배경 이미지를 적용한다.

- Setup > Header Image의 빈 상태와 적용 결과 두 장만 수록됐다.
- 파일 선택·유효성 검사·저장 진행은 중간에 없다.

- 상위 분석: [Adding a new invoice](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_aa221ac7066a427db6aae5b18f0acab4`](https://gummble.com/screens/sc_aa221ac7066a427db6aae5b18f0acab4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구독 인보이스 초안 편집 상단 | Header Image에 파일이 연결되고 문서 맨 위 배경이 나타난다. |
| 02 | [`sc_da340557d84c4add8ac139af9a629557`](https://gummble.com/screens/sc_da340557d84c4add8ac139af9a629557?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 헤더 이미지 적용 | 헤더 적용 결과에서 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 구독 인보이스 초안 편집 상단

- Screen ID: `sc_aa221ac7066a427db6aae5b18f0acab4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aa221ac7066a427db6aae5b18f0acab4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/00abe9ef-b389-490a-a2c9-6f9bbf1b2064.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_da340557d84c4add8ac139af9a629557`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 문서 작업바, 중앙 흰 종이, 오른쪽 Overview/Setup/Payments. 일반 사이드바 숨김.
- 입력 항목·필수 표시·기본값: Drafted $0.00, #1001, Feb7 발행·Mar8 만기, 2주 반복·Mar21 종료. From Joe Doe/Joe Studio, To Jane Doe/Doe Company, 주소 placeholder. Logo on, Late Fee off, Tax ID on.
- 버튼·메뉴·안내 문구: Preview, Automation, Send Now와 달력, …, Add Recipient, Unbilled Hours 안내 닫기, Advanced Settings Edit, Enable Online Payments.
- 확인된 상태: 초안. 빈 항목명·수량1·단가/합계0. 미청구 시간 안내가 존재.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 구독 설정이 Overview에 반영되고 청구서가 생성됐다. 시간은 자동 포함되지 않았다는 안내.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주소/Tax ID 회색값의 저장 여부·항목 자동저장·발송 조건 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 헤더·수신자·항목·세금표시·초안 상태·미청구 원천 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 인보이스 헤더 이미지 적용

- Screen ID: `sc_da340557d84c4add8ac139af9a629557`
- 원본: [화면 페이지](https://gummble.com/screens/sc_da340557d84c4add8ac139af9a629557?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/57cf3a04-0854-47bd-b301-989752e8f621.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_aa221ac7066a427db6aae5b18f0acab4` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 위에 가로 그라데이션 이미지가 추가되고 본문이 아래로 밀린다. 로고는 우상단.
- 입력 항목·필수 표시·기본값: Drafted0, 2주 반복/Mar21 종료, Header Image 파일명 gradienta-… 표시. Logo on·Late off·Tax ID on.
- 버튼·메뉴·안내 문구: Header Image 제거 X, Preview·Automation·Send Now·달력·… 유지.
- 확인된 상태: 헤더 파일 적용 상태. 업로드 선택창·진행률은 없음.
- 단계 간 변화: Header Image에 파일이 연결되고 문서 맨 위 배경이 나타난다.

#### 동작과 데이터

- 화면 관찰: 헤더가 추가됐지만 금액·상태는0 초안 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일명 전체·용량·자르기·오류·저장시점 미확인.

#### 모델링 영향

- 후보와 근거: 문서별 헤더 미디어와 로고 표시를 독립 후보로 둔다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Display Logo와 Header Image는 서로 다른 설정이다. 헤더 추가 후 로고는 유지된다.
- [문서] 편집 가능한 문서에서 배경 업로드를 지원한다. 이 자료에서는 발송 후 편집 제한을 실제로 재현하지 않았다.

## 6. 공식 도움말과 API 대조

- [문서 배경 이미지 도움말](https://help.hellobonsai.com/en/articles/2880183-adding-your-background-to-proposals-and-invoices): JPG/JPEG/PNG, 10MB 이하와 인보이스 권장 658×150 또는1316×300을 제시한다. 캡처 원본 이미지 크기와 업로드 파일 크기는 다른 개념이다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 문서 헤더 파일 참조·표시 상태·업로드 검증 후보. 계정 로고와 개별 문서 헤더를 구분한다.

## 8. 미확인 사항과 검토 질문

- 권장 비율과 다른 파일의 자르기·맞춤·삭제 복원·모바일 표시를 확인해야 한다.
- 이미 발송한 문서의 이미지 교체 및 과거 PDF 유지 규칙을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 2개와 실제 이미지 2개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

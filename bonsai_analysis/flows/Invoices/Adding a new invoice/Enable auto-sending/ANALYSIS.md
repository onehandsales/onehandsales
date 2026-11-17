# Enable auto-sending 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `20115575-4590-4c0c-a009-7062c5f936ab` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=20115575-4590-4c0c-a009-7062c5f936ab) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

발행일 기준 자동 발송을 예약하려 하지만 미래 발행일 조건을 충족하지 못하는 경로다.

- 구독형 초안과 상단 달력 아이콘에서 시작한다.
- 초반과 다음 화면 사이 테마·금액 변경은 별도 편집이 생략된 것이며 달력 hover 결과로 해석하지 않는다.

- 상위 분석: [Adding a new invoice](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_da340557d84c4add8ac139af9a629557`](https://gummble.com/screens/sc_da340557d84c4add8ac139af9a629557?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 헤더 이미지 적용 | 테마·금액이 다른 캡처로 이어지며 달력 위 예약 발송 툴팁이 보인다. 중간 항목 편집은 미수록. |
| 02 | [`sc_edd0e1fe0ae94729b1f89df4d408d4d5`](https://gummble.com/screens/sc_edd0e1fe0ae94729b1f89df4d408d4d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 자동 발송 예약 툴팁 | 달력 선택 후 미래 발행일 요구 오류가 나타난다. |
| 03 | [`sc_5a622720f93446aba70e58c7e88a468d`](https://gummble.com/screens/sc_5a622720f93446aba70e58c7e88a468d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 미래 발행일 검증 오류 | Drafted 상태로 종료. 자동 발송 활성화 성공 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 인보이스 헤더 이미지 적용

- Screen ID: `sc_da340557d84c4add8ac139af9a629557`
- 원본: [화면 페이지](https://gummble.com/screens/sc_da340557d84c4add8ac139af9a629557?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/57cf3a04-0854-47bd-b301-989752e8f621.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_edd0e1fe0ae94729b1f89df4d408d4d5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 위에 가로 그라데이션 이미지가 추가되고 본문이 아래로 밀린다. 로고는 우상단.
- 입력 항목·필수 표시·기본값: Drafted0, 2주 반복/Mar21 종료, Header Image 파일명 gradienta-… 표시. Logo on·Late off·Tax ID on.
- 버튼·메뉴·안내 문구: Header Image 제거 X, Preview·Automation·Send Now·달력·… 유지.
- 확인된 상태: 헤더 파일 적용 상태. 업로드 선택창·진행률은 없음.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 헤더가 추가됐지만 금액·상태는0 초안 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일명 전체·용량·자르기·오류·저장시점 미확인.

#### 모델링 영향

- 후보와 근거: 문서별 헤더 미디어와 로고 표시를 독립 후보로 둔다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 자동 발송 예약 툴팁

- Screen ID: `sc_edd0e1fe0ae94729b1f89df4d408d4d5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_edd0e1fe0ae94729b1f89df4d408d4d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aaa27893-a4a0-48b0-af6b-4d98d7ee1b6b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_da340557d84c4add8ac139af9a629557` → 현재 → `sc_5a622720f93446aba70e58c7e88a468d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Send Now 옆 달력 아래 검은 툴팁. 문서 Foundation 배치와 그라데이션 유지.
- 입력 항목·필수 표시·기본값: Amount70.04, Drafted, 발행Feb7, 만기Mar8, 종료Mar21.
- 버튼·메뉴·안내 문구: Schedule to send automatically 툴팁. 달력·Send Now·…
- 확인된 상태: 예약 기능 진입 전 hover/포커스 상태.
- 단계 간 변화: 테마·금액이 다른 캡처로 이어지며 달력 위 예약 발송 툴팁이 보인다. 중간 항목 편집은 미수록.

#### 동작과 데이터

- 화면 관찰: 달력 아이콘의 목적이 자동 발송 예약임을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 0→70.04/테마 변경 과정과 정확한 트리거는 수록 안 됨.

#### 모델링 영향

- 후보와 근거: 예약 발송 UI 접근점·문서 발행일 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 미래 발행일 검증 오류

- Screen ID: `sc_5a622720f93446aba70e58c7e88a468d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5a622720f93446aba70e58c7e88a468d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b33afeda-33ba-43aa-ac35-3851b0a7b3b8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_edd0e1fe0ae94729b1f89df4d408d4d5` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 편집 화면 우하단 빨간 테두리 토스트.
- 입력 항목·필수 표시·기본값: 발행Feb7 유지, Drafted70.04. 변경용 날짜 UI는 열리지 않음.
- 버튼·메뉴·안내 문구: Your invoice must be issued in the future to enable auto-sending. 닫기 X.
- 확인된 상태: 예약 실패/차단 상태.
- 단계 간 변화: 달력 선택 후 미래 발행일 요구 오류가 나타난다.

#### 동작과 데이터

- 화면 관찰: 미래 Issue Date 요구가 오류로 직접 제시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재 계정시각·시간대·예약시간 및 오류코드 미확인.

#### 모델링 영향

- 후보와 근거: 예약 유효성 검사·발행일과 반복 종료일 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰·문서] 자동 발송은 발행일이 미래여야 한다. 반복 종료일이 미래라는 것만으로 충분하지 않다.
- [관찰] 빨간 오류 토스트만 나타나며 Schedule 확인·메일 작성 화면은 없다.
- [문서] 성공 경로는 예약 확인 후 메일 작성과 Scheduled 표시를 포함하나 이 캡처에서 확인한 것은 아니다.

## 6. 공식 도움말과 API 대조

- [자동 발송 도움말](https://help.hellobonsai.com/en/articles/476673-how-to-schedule-an-invoice-to-auto-send): 2026-08-14 문서의 미래 Issue Date 조건이 오류 메시지와 일치한다. 예약 취소와 전날 알림도 설명하지만 화면 재현은 안 했다.
- [반복과 구독 청구](https://help.hellobonsai.com/en/articles/1065297-understanding-the-difference-between-subscription-and-recurring-invoices): 반복 청구서는 주기에 따라 복제되며 발송 설정이 별개다. 구독 자동 결제는 고객의 결제수단 저장·동의가 필요하다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 청구 반복 일정·발행일·예약 발송 상태·메일 내용·예약 취소를 구분할 후보.
- 서버 시간대와 미래 비교·중복 발송 방지·작업 재시도는 설계 필요하지만 정책 미확정.

## 8. 미확인 사항과 검토 질문

- 오늘 날짜의 예약 가능 여부와 시간대 경계를 실제 계정에서 확인한다.
- 예약 이후 문서 금액/수신자 수정이 발송본에 반영되는지, 실패/재시도 기록을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

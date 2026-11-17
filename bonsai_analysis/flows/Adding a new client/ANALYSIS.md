# Adding a new client 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **7/7단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a5f7a722-8a0c-4528-966a-903e7e0873fb` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a5f7a722-8a0c-4528-966a-903e7e0873fb) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 7단계 / 7단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

전역 +New 메뉴에서 회사·담당자·이메일·태그를 입력하여 고객을 생성하고 고객 상세의 업무 연결을 확인한다.

- 이 캡처는 Client 생성 시 회사와 기본 연락처를 함께 입력하는 과거 UI다.
- 시작 Dashboard → New Client → Doe Company 상세. 프로젝트·노트·인보이스·폼은 아직 비어 있다.
- 실제 계정에 고객을 추가하거나 알림을 보내지 않았다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a0fa68609b634defb4a2ccd18b63a4a2`](https://gummble.com/screens/sc_a0fa68609b634defb4a2ccd18b63a4a2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 초기 대시보드 | +New 전역 메뉴 펼침. |
| 02 | [`sc_40ff225f161846249b5cf8c2c55423b6`](https://gummble.com/screens/sc_40ff225f161846249b5cf8c2c55423b6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 전역 신규 생성 메뉴 | Client 선택 맥락의 New Client 모달. |
| 03 | [`sc_3e2640e1d9ca4b59a7f1c79cb628a502`](https://gummble.com/screens/sc_3e2640e1d9ca4b59a7f1c79cb628a502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 생성 빈 폼 | 회사·담당자·이메일 입력. |
| 04 | [`sc_7435a1d441654b5fa2a8428533fd5d87`](https://gummble.com/screens/sc_7435a1d441654b5fa2a8428533fd5d87?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 기본정보 입력 | Client 태그 적용. 입력 선택 과정은 생략. |
| 05 | [`sc_225e25a9ba6745be98341cf77524fa23`](https://gummble.com/screens/sc_225e25a9ba6745be98341cf77524fa23?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 태그 선택 후 | Doe Company 상세와1명 추가 성공 토스트. |
| 06 | [`sc_b1619b6b9fc3405e8ad67fd26f405b62`](https://gummble.com/screens/sc_b1619b6b9fc3405e8ad67fd26f405b62?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 생성 완료 상세 | 아래로 스크롤하여 노트·인보이스·추가정보·폼의 빈 상태 확인. |
| 07 | [`sc_9e5c9989e48d45459e62cc2fe0b886fb`](https://gummble.com/screens/sc_9e5c9989e48d45459e62cc2fe0b886fb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 상세 하단의 빈 업무 영역 | 생성 후 상세 조회 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 초기 대시보드

- Screen ID: `sc_a0fa68609b634defb4a2ccd18b63a4a2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a0fa68609b634defb4a2ccd18b63a4a2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/eeabd71e-ccf7-4d3a-857e-4e5e79e466c4.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_40ff225f161846249b5cf8c2c55423b6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 내비게이션, 상단 Search/Upgrade/Track Time/+New, 인사말·프로젝트 타임라인·손익 그래프·퀵 액션.
- 입력 항목·필수 표시·기본값: Feb6 아침. 타임라인은 현재 기간 활동 없음. 손익은 USD/Last6Months.
- 버튼·메뉴·안내 문구: +New, 퀵 액션 인보이스·제안서·계약·폼.
- 확인된 상태: 신규 고객 진입 전. 타임라인 빈 상태와 손익 그래프는 별도 영역.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 고객 생성 전 특정 시점의 대시보드로 공통 Feb14 캡처와 다르다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 손익 데이터가 실제/샘플인지·조회기간.

#### 모델링 영향

- 후보와 근거: 전역 생성 액션과 대시보드 조회 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 전역 신규 생성 메뉴

- Screen ID: `sc_40ff225f161846249b5cf8c2c55423b6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_40ff225f161846249b5cf8c2c55423b6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de124575-8e10-4abd-baeb-f678b6805b52.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a0fa68609b634defb4a2ccd18b63a4a2` → 현재 → `sc_3e2640e1d9ca4b59a7f1c79cb628a502`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단+New 아래 오른쪽 세로 드롭다운.
- 입력 항목·필수 표시·기본값: 입력 항목 없음.
- 버튼·메뉴·안내 문구: Client, Project, Invoice, Proposal, Contract, Form, Expense.
- 확인된 상태: Client 항목이 초록으로 강조됨.
- 단계 간 변화: +New 전역 메뉴 펼침.

#### 동작과 데이터

- 화면 관찰: 고객 외 여러 업무 생성 진입이 공통 메뉴에 모여 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할·요금제별 항목 노출·키보드 이동.

#### 모델링 영향

- 후보와 근거: 공통 생성 메뉴와 각 업무 폼 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 고객 생성 빈 폼

- Screen ID: `sc_3e2640e1d9ca4b59a7f1c79cb628a502`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3e2640e1d9ca4b59a7f1c79cb628a502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/af1badaa-5af2-4dd1-9506-31bb7300677f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_40ff225f161846249b5cf8c2c55423b6` → 현재 → `sc_7435a1d441654b5fa2a8428533fd5d87`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 중앙 New Client 모달. 설명 아래 회사·담당자·이메일·태그, 하단 Add Client.
- 입력 항목·필수 표시·기본값: Company Name 회색 Smith Co.; Contact Name* Jane Smith; Email* jane@smith.com; Tags없음.
- 버튼·메뉴·안내 문구: Add Client, +Add Tag, 바깥 닫기X. 고객 추가만으로 통지하지 않는다는 안내.
- 확인된 상태: 필수 별표와 placeholder가 있는 초기 입력.
- 단계 간 변화: Client 선택 맥락의 New Client 모달.

#### 동작과 데이터

- 화면 관찰: 담당자·이메일 필수 표시는 직접 관찰했다. 회사 필수는 표시되지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 제출·이메일 검증·중복·취소.

#### 모델링 영향

- 후보와 근거: 폼 검증과 회사/담당자 입력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 고객 기본정보 입력

- Screen ID: `sc_7435a1d441654b5fa2a8428533fd5d87`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7435a1d441654b5fa2a8428533fd5d87?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2601669e-cd40-43ca-909d-484828824051.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3e2640e1d9ca4b59a7f1c79cb628a502` → 현재 → `sc_225e25a9ba6745be98341cf77524fa23`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 모달. 이메일 입력 포커스.
- 입력 항목·필수 표시·기본값: Doe Company, Jane Doe, 샘플 이메일 janesmith1.mobbin@gmail.com. 태그는 없음.
- 버튼·메뉴·안내 문구: Add Client, +Add Tag.
- 확인된 상태: 실제 입력값이 진하게 표시되고 이메일 테두리 초록.
- 단계 간 변화: 회사·담당자·이메일 입력.

#### 동작과 데이터

- 화면 관찰: 샘플 데이터를 화면 값으로 기록하며 실제 사용자의 정보로 취급하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이메일검증·이름/이메일일치 요구·회사미입력.

#### 모델링 영향

- 후보와 근거: 회사명·연락처명·이메일을 별도 필드로 보는 근거.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 고객 태그 선택 후

- Screen ID: `sc_225e25a9ba6745be98341cf77524fa23`
- 원본: [화면 페이지](https://gummble.com/screens/sc_225e25a9ba6745be98341cf77524fa23?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5ffe3478-dc05-4531-8d5f-cb4b3fa4b0c2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_7435a1d441654b5fa2a8428533fd5d87` → 현재 → `sc_b1619b6b9fc3405e8ad67fd26f405b62`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tags에 Client 칩과 EDIT. 나머지 입력 유지.
- 입력 항목·필수 표시·기본값: Client 태그1개.
- 버튼·메뉴·안내 문구: EDIT, Add Client 버튼이 연한 초록.
- 확인된 상태: 태그 적용 상태. 버튼색만으로 처리중/비활성 원인은 알 수 없음.
- 단계 간 변화: Client 태그 적용. 입력 선택 과정은 생략.

#### 동작과 데이터

- 화면 관찰: 회사·연락처 입력과 태그 연결이 같은 폼에 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 태그 생성/선택 과정·버튼상태·중복요청.

#### 모델링 영향

- 후보와 근거: 고객-태그 연결과 생성폼 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 고객 생성 완료 상세

- Screen ID: `sc_b1619b6b9fc3405e8ad67fd26f405b62`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b1619b6b9fc3405e8ad67fd26f405b62?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d9454e4f-6a97-48e2-a6b3-193652751095.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_225e25a9ba6745be98341cf77524fa23` → 현재 → `sc_9e5c9989e48d45459e62cc2fe0b886fb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 아바타·Doe Company·Client태그. 왼쪽Projects/Notes/Invoices, 오른쪽Active·연락처카드·AdditionalInfo/Forms.
- 입력 항목·필수 표시·기본값: Jane Doe 기본 연락처, 이메일, Active. 프로젝트/노트없음. JS아바타의 생성규칙 미확인.
- 버튼·메뉴·안내 문구: Add New Contact, 연락처/고객말줄임, 프로젝트+, NotesEdit, Edit Fields, 생성성공토스트.
- 확인된 상태: 1client추가성공과 빈 업무 상세.
- 단계 간 변화: Doe Company 상세와1명 추가 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 한 고객에 추가 연락처를 연결할 수 있는 진입점과 기본 연락처 표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아바타이니셜·추가연락처카디널리티·기본연락처정책.

#### 모델링 영향

- 후보와 근거: 회사와 기본/추가 연락처, 상태·태그·연관업무 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 고객 상세 하단의 빈 업무 영역

- Screen ID: `sc_9e5c9989e48d45459e62cc2fe0b886fb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9e5c9989e48d45459e62cc2fe0b886fb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3883239b-6859-4373-be09-f8c6a8b3c8b3.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b1619b6b9fc3405e8ad67fd26f405b62` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 본문 아래로 스크롤. 왼쪽Notes/Invoices, 오른쪽AdditionalInfo/Forms. 사이드바 유지.
- 입력 항목·필수 표시·기본값: Invoices Outstanding/Overdue/Paid-Pending 모두$0, USD. 추가정보 Company Title/Phone/Website/Address. Forms미완료.
- 버튼·메뉴·안내 문구: 노트Edit, 인보이스+, 통화선택, 각 필드Edit, Add Address, Edit Fields, Send Form.
- 확인된 상태: 노트·인보이스·완료된 폼이 없는 상태.
- 단계 간 변화: 아래로 스크롤하여 노트·인보이스·추가정보·폼의 빈 상태 확인.

#### 동작과 데이터

- 화면 관찰: 문서에 미리 채워지는 Company Title 안내를 별도 필드로 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한금액집계·공개범위·기본/사용자정의필드구분.

#### 모델링 영향

- 후보와 근거: 고객 프로필·확장필드·청구집계·폼응답 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: Contact Name과 Email에 별표가 있고 Company Name에는 없다. 이 폼의 표시와 현재 API 제약을 분리한다.
- 관찰: 단순 고객 추가로 알림을 보내지 않는다고 모달이 안내한다. 문서 발송·포털 공유와 같은 후속 액션은 별도다.
- 관찰: 생성된 상세는 Active 상태와 Default Contact를 표시하며 Add New Contact를 제공한다.
- 관찰: Client 태그는 별도 라벨이다. Active 상태·기본 연락처와 혼합하지 않는다.
- 미확인: 회사명 미입력의 표시명 생성·이메일 중복·태그 선택·저장중 버튼 색 변화의 정확한 의미.

## 6. 공식 도움말과 API 대조

- [회사·연락처 도움말](https://help.hellobonsai.com/en/articles/452120-how-to-create-and-manage-companies-and-contacts): 현행 회사는 이름만 필수이며 회사·연락처를 독립적으로 생성하고 다중 회사 연결과 기본 연락처를 지원한다. 이 캡처의 담당자명·이메일 필수 폼과 버전 차이가 있다.
- [명칭 변경 안내](https://help.hellobonsai.com/en/articles/15166148-clients-is-now-companies-what-s-changing-in-bonsai): 2026-08-27 Clients→Companies는 명칭 변경이며 기존 데이터·관계는 유지한다고 설명한다. 다만 별도 회사/연락처 생성 변화까지 이 명칭 변경 때문이라고 단정하지 않는다.
- [Companies API](https://docs.hellobonsai.com/api/tag/companies): GET/POST `/public-api/v1/companies`, GET/PATCH `/public-api/v1/companies/{id}`, GET `/public-api/v1/companies/{id}/activities`를 확인했다.
- [Contacts API](https://docs.hellobonsai.com/api/tag/contacts): GET/POST `/public-api/v1/contacts`, GET/PATCH `/public-api/v1/contacts/{id}`, 활동 조회를 확인했다. 연락처는0개 또는 여러 회사에 연결될 수 있다고 명시한다. 요청 필드의 실제 필수값은 이 그룹 페이지에 없어 미확인.

## 7. 데이터 모델링 시사점

- Company/Client와 Contact를 별도 업무 개념으로 두고 관계·기본 연락처를 검토한다. 현행 문서는 다대다 가능성을 명시하므로 단순 contact.company_id 하나로 제한하지 않는다.
- 생성 화면에서 함께 입력한다고 동일 테이블·동일 API라는 근거는 없다. 한 사용자 액션의 저장 경계는 추후 확인한다.
- 회사 표시명·문서에 쓰는 Company Title·기본 연락처·고객 상태·태그·주소·추가필드를 구분한다.
- FE 후보: 전역 생성메뉴, 필수 표시·입력값/placeholder, 태그 편집, 생성 성공·빈 상세·연락처 카드.

## 8. 미확인 사항과 검토 질문

- 회사명을 비우면 연락처명을 고객명으로 쓰는가? 같은 버전의 계정에서 검증한다.
- 동일 이메일을 여러 고객의 연락처로 추가하면 동일 Contact에 연결되는가? 생성/중복 정책을 API와 대조한다.
- 기본 연락처를 바꾸면 기존 문서와 미래 문서 수신자가 각각 어떻게 달라지는가? 문서 생성 시점별 확인이 필요하다.
- 고객의 Active/보관/삭제와 포털 접근·연결 프로젝트·청구 기록의 관계를 별도 검토한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 7개와 실제 이미지 7개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

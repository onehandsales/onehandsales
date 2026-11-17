# Adding company details 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a346e78b-8075-4537-ae03-d377056d237a` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a346e78b-8075-4537-ae03-d377056d237a) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

자신의 사업체 이름·주소·기본 통화·로고를 온보딩에서 입력한다.

- CRM 고객사 생성이 아니라 서비스 사용 사업체의 설정이다.
- 주소 내부 Save Address와 전체 모달 Save가 별도로 존재한다.

- 상위 분석: [Dashboard](../ANALYSIS.md)
- 하위 플로우: [Uploading company logo](Uploading%20company%20logo/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_7c8264e8239e464abd4219d7b9828199`](https://gummble.com/screens/sc_7c8264e8239e464abd4219d7b9828199?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 회사 정보 온보딩 | Add Details를 선택한다. |
| 02 | [`sc_1f34f6436d754f598f9c0893c847470c`](https://gummble.com/screens/sc_1f34f6436d754f598f9c0893c847470c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Company Details 기본 모달 | Add Address에 진입한다. |
| 03 | [`sc_3359f1c009534062b0d7633a05512d37`](https://gummble.com/screens/sc_3359f1c009534062b0d7633a05512d37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 주소 영역 선택 | 주소 입력 영역이 확장된다. |
| 04 | [`sc_d39ae19f83f54237aaba13bc601c1221`](https://gummble.com/screens/sc_d39ae19f83f54237aaba13bc601c1221?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구조화 주소 입력 | 주소와 국가를 입력한다. |
| 05 | [`sc_eded37284763437b9f04ff234ccabc1c`](https://gummble.com/screens/sc_eded37284763437b9f04ff234ccabc1c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 주소 입력 완료 전 | Save Address로 요약 표시로 돌아간다. |
| 06 | [`sc_dbe1912daeaa417aa5c274542ae16219`](https://gummble.com/screens/sc_dbe1912daeaa417aa5c274542ae16219?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 주소 요약 저장 | 로고를 업로드한다. 세부 과정은 하위 흐름에 있다. |
| 07 | [`sc_d7d2128b74c74ca88e2515942e5cdc36`](https://gummble.com/screens/sc_d7d2128b74c74ca88e2515942e5cdc36?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 회사 로고 표시 | Save 후 대시보드 다음 온보딩으로 이동한다. |
| 08 | [`sc_855aa87503994667b3fd5b8d6be847e2`](https://gummble.com/screens/sc_855aa87503994667b3fd5b8d6be847e2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 예약 온보딩 | 회사 정보 완료 표시를 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — 회사 정보 온보딩

- Screen ID: `sc_7c8264e8239e464abd4219d7b9828199`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7c8264e8239e464abd4219d7b9828199?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/df97bb3b-81d2-4f09-b018-8ee967d02134.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_1f34f6436d754f598f9c0893c847470c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의5단계 안내,1번 선택.
- 입력 항목·필수 표시·기본값: Add company details; 회사 정보·로고·브랜딩을 계약/제안/청구서에 자동 추가한다는 안내.팀초대는 완료표시.
- 버튼·메뉴·안내 문구: Add Details, Next Step, Hide, Upgrade Now.
- 확인된 상태: 자기 사업체 설정 안내.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 온보딩 진입점 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 단계 완료 기준 미확인.

#### 모델링 영향

- 후보와 근거: 자기 사업체와 고객사 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Company Details 기본 모달

- Screen ID: `sc_1f34f6436d754f598f9c0893c847470c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1f34f6436d754f598f9c0893c847470c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6c747379-e7d4-4596-8c98-88c8b33e5de2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_7c8264e8239e464abd4219d7b9828199` → 현재 → `sc_3359f1c009534062b0d7633a05512d37`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 모달에 이름·주소 요약·로고.
- 입력 항목·필수 표시·기본값: 회사명 Joe Studio,주소없음,로고없음.별표없음.
- 버튼·메뉴·안내 문구: Add Address, Add An Image, Save, 외부X.
- 확인된 상태: 기존 회사명이 채워진 상태.
- 단계 간 변화: Add Details를 선택한다.

#### 동작과 데이터

- 화면 관찰: 사업체 설정 편집 시작.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이름 초기값 출처·필수검증 미확인.

#### 모델링 영향

- 후보와 근거: 사업체 프로필 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 주소 영역 선택

- Screen ID: `sc_3359f1c009534062b0d7633a05512d37`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3359f1c009534062b0d7633a05512d37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7f9d5f8f-9e2c-4509-bbfb-ef40720887db.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1f34f6436d754f598f9c0893c847470c` → 현재 → `sc_d39ae19f83f54237aaba13bc601c1221`

#### 화면에서 직접 확인한 내용

- 레이아웃: Add Address 박스가 초록 점선으로 강조된다.
- 입력 항목·필수 표시·기본값: Joe Studio 유지,주소/로고없음.
- 버튼·메뉴·안내 문구: Add Address,Save,X.
- 확인된 상태: 주소 편집 진입 전 강조 상태.
- 단계 간 변화: Add Address에 진입한다.

#### 동작과 데이터

- 화면 관찰: 선택 UI만 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: hover/클릭 구분 미확인.

#### 모델링 영향

- 후보와 근거: 표시 상태와 주소 레코드 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 구조화 주소 입력

- Screen ID: `sc_d39ae19f83f54237aaba13bc601c1221`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d39ae19f83f54237aaba13bc601c1221?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/56fc4e47-d178-4a1d-bc63-086032f5a058.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3359f1c009534062b0d7633a05512d37` → 현재 → `sc_eded37284763437b9f04ff234ccabc1c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달이 길어지고 주소 필드 패널이 펼쳐진다.
- 입력 항목·필수 표시·기본값: Address1/Address2/City/PostalCode/Region-State 비어 있음;Country Malaysia,Currency USD.
- 버튼·메뉴·안내 문구: Save Address,국가/통화선택,외부X;로고영역은 아래.
- 확인된 상태: 별표/필수 오류는 보이지 않는다.
- 단계 간 변화: 주소 입력 영역이 확장된다.

#### 동작과 데이터

- 화면 관찰: 구조화 주소와 국가/통화를 받는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주소 필수값·국가별 필드변화는 미확인.

#### 모델링 영향

- 후보와 근거: 주소 필드·기본통화 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 주소 입력 완료 전

- Screen ID: `sc_eded37284763437b9f04ff234ccabc1c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eded37284763437b9f04ff234ccabc1c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/89ed0bda-2a39-48bc-8aef-f877e1338d8d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d39ae19f83f54237aaba13bc601c1221` → 현재 → `sc_dbe1912daeaa417aa5c274542ae16219`

#### 화면에서 직접 확인한 내용

- 레이아웃: 주소 확장 패널.
- 입력 항목·필수 표시·기본값: Address1에75AyerRajahCrescent,#02-02,Singapore…;Address2빈칸;City/RegionSingapore;Postal139953;CountrySingapore;CurrencyUSD.
- 버튼·메뉴·안내 문구: Save Address,각입력/선택.
- 확인된 상태: 국가가Singapore로 바뀌고 통화는USD 유지.
- 단계 간 변화: 주소와 국가를 입력한다.

#### 동작과 데이터

- 화면 관찰: 국가/통화가 독립 선택 가능함을 시사한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잘린Address1전체는 다음요약에서 확인한다.

#### 모델링 영향

- 후보와 근거: 국가와 통화 결합 강제 금지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 주소 요약 저장

- Screen ID: `sc_dbe1912daeaa417aa5c274542ae16219`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dbe1912daeaa417aa5c274542ae16219?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3c270d8a-f9be-4dd9-b371-34bee834f134.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_eded37284763437b9f04ff234ccabc1c` → 현재 → `sc_d7d2128b74c74ca88e2515942e5cdc36`

#### 화면에서 직접 확인한 내용

- 레이아웃: 확장 패널이 닫히고 초록 요약 문자열.
- 입력 항목·필수 표시·기본값: Address1 전체75 Ayer Rajah Crescent,#02-02,Singapore,139953;다음줄Singapore,Singapore,139953;SG.로고없음.
- 버튼·메뉴·안내 문구: 주소 요약 클릭,Add An Image,Save,X.
- 확인된 상태: 주소 요약에 중복 도시/우편번호가 그대로 있다.
- 단계 간 변화: Save Address로 요약 표시로 돌아간다.

#### 동작과 데이터

- 화면 관찰: 구조화 입력의 합성 표시를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체모달 저장 전 서버영속 여부 미확인.

#### 모델링 영향

- 후보와 근거: 원시 입력과 주소 표시 포맷 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 회사 로고 표시

- Screen ID: `sc_d7d2128b74c74ca88e2515942e5cdc36`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d7d2128b74c74ca88e2515942e5cdc36?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e4f13474-94f0-4366-9d07-c20eedb0c23c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_dbe1912daeaa417aa5c274542ae16219` → 현재 → `sc_855aa87503994667b3fd5b8d6be847e2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 주소 요약 아래 작은 로고 썸네일.
- 입력 항목·필수 표시·기본값: Joe Studio/주소 유지,베이지 로고이미지.
- 버튼·메뉴·안내 문구: 로고제거X,Save,외부X.
- 확인된 상태: 로고 미리보기 추가. 아직 전체 Save 전이다.
- 단계 간 변화: 로고를 업로드한다. 세부 과정은 하위 흐름에 있다.

#### 동작과 데이터

- 화면 관찰: 브랜드 자산 참조 준비 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일형식/용량·실제저장 요청 미확인.

#### 모델링 영향

- 후보와 근거: 회사 로고와 설정 저장 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 대시보드 예약 온보딩

- Screen ID: `sc_855aa87503994667b3fd5b8d6be847e2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_855aa87503994667b3fd5b8d6be847e2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1331e529-400c-493e-a630-49486471d7f0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d7d2128b74c74ca88e2515942e5cdc36` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 사이드바, 체험 종료7일 배너, 인사말, 5단계 온보딩 카드.
- 입력 항목·필수 표시·기본값: 1회사정보/2팀초대는 완료 표시;3 Create your booking page 선택;4 contact form,5 bookkeeping.
- 버튼·메뉴·안내 문구: Get Started, Next Step, Hide, Upgrade Now.
- 확인된 상태: 예약 페이지 생성 단계의 안내 화면. 아래 Timeline은 현재 활동 없음.
- 단계 간 변화: Save 후 대시보드 다음 온보딩으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 온보딩 진행 표시와 실제 캘린더 연결은 아직 분리된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 완료 표시 자동/수동 조건은 미확인.

#### 모델링 영향

- 후보와 근거: 온보딩 단계 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 초기 국가 Malaysia/통화USD에서 국가Singapore로 바꿔도 통화USD는 유지된다.
- [관찰] 주소는1/2줄·도시·우편번호·지역·국가로 나뉘며 요약에서 합성된다.
- [관찰] 주소1에 도시/우편번호까지 입력해 요약에 중복 표시된다. 자동 주소 정규화가 있었다고 볼 수 없다.
- [미확인] Save Address가 즉시 서버 저장인지 전체 Save의 임시 값인지 미확인.

## 6. 공식 도움말과 API 대조

- [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information): 자신의 회사 이름·주소·통화 등은 Company Settings에서 저장하며 향후 문서/업무에 적용한다고 설명한다. 고객사 Companies 리소스와 구분한다.
- [회사 로고·문서 헤더](https://help.hellobonsai.com/en/articles/1977524-how-to-update-your-company-logo-and-header-on-your-documents): 회사 로고/문서 표시와 크기·헤더 설정을 설명한다. 캡처는 온보딩의 간단한 업로드이며 전체 Branding 설정과 다르다.
- [공개 API](https://docs.hellobonsai.com/api): 고객사 Companies endpoint를 자신의 워크스페이스 설정 endpoint로 간주하지 않는다. 자기 회사 설정의 필드 계약은 미확인.

## 7. 데이터 모델링 시사점

- 워크스페이스 사업체 프로필·구조화 주소·국가·기본통화·브랜드 자산 후보.
- 온보딩 완료 상태와 실제 설정 저장 성공을 구분할 후보.

## 8. 미확인 사항과 검토 질문

- 필수 항목·주소 국가별 검증·통화 초기값·저장 권한을 확인한다.
- 기존 문서의 당사자 정보/로고 갱신 범위와 발송 완료 문서 스냅샷 정책을 확인한다.
- 모달 X/Save Address/Save 각각의 저장·취소 경계를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

# Editing an item 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `be9884fd-760f-4d30-b3e0-92b55ad8274c` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=be9884fd-760f-4d30-b3e0-92b55ad8274c) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

빈 항목 오류를 확인하고 서비스 라이브러리에서 Flyer Design을 선택해 청구 항목을 채운다.

- 금액0 초안에서 시작하며 발송 또는 검증 시도의 정확한 클릭은 수록되지 않았다.
- 항목 입력의 서비스 추천 드롭다운과 선택 결과가 핵심이다.

- 상위 분석: [Adding a new invoice](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_da340557d84c4add8ac139af9a629557`](https://gummble.com/screens/sc_da340557d84c4add8ac139af9a629557?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 헤더 이미지 적용 | 일반 검증 오류 토스트가 나타난다. Studio→Foundation 변경 과정은 미수록. |
| 02 | [`sc_17b08f7253554c8e9691e71faebf58de`](https://gummble.com/screens/sc_17b08f7253554c8e9691e71faebf58de?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 일반 검증 오류 | 항목 위치로 이동하면 빈 이름에 빨간 테두리와 경고 아이콘이 보인다. |
| 03 | [`sc_352b14335c44407885e9d014228f98ec`](https://gummble.com/screens/sc_352b14335c44407885e9d014228f98ec?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 빈 항목명 오류 | 이름 입력 아래 서비스 추천 목록을 연다. |
| 04 | [`sc_c4c151b48433485587c49123d3cc56f6`](https://gummble.com/screens/sc_c4c151b48433485587c49123d3cc56f6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 서비스 라이브러리 추천 | Flyer Design 선택 후 이름·설명·가격이 채워지고 금액50으로 바뀐다. |
| 05 | [`sc_3588b6b5ac2447fdbc7ecb2454855fcf`](https://gummble.com/screens/sc_3588b6b5ac2447fdbc7ecb2454855fcf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Flyer Design 항목 적용 | 항목 작성 결과에서 종료. 발송 성공은 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 인보이스 헤더 이미지 적용

- Screen ID: `sc_da340557d84c4add8ac139af9a629557`
- 원본: [화면 페이지](https://gummble.com/screens/sc_da340557d84c4add8ac139af9a629557?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/57cf3a04-0854-47bd-b301-989752e8f621.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_17b08f7253554c8e9691e71faebf58de`

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

### 단계 02 — 인보이스 일반 검증 오류

- Screen ID: `sc_17b08f7253554c8e9691e71faebf58de`
- 원본: [화면 페이지](https://gummble.com/screens/sc_17b08f7253554c8e9691e71faebf58de?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/21e6fcb2-0e66-4b49-b0f6-a557a0758d49.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_da340557d84c4add8ac139af9a629557` → 현재 → `sc_352b14335c44407885e9d014228f98ec`

#### 화면에서 직접 확인한 내용

- 레이아웃: Setup이 접힌 오른쪽 패널과 본문 헤더. 우하단 빨간 토스트.
- 입력 항목·필수 표시·기본값: Drafted0, 결제 미활성 상태.
- 버튼·메뉴·안내 문구: Please check the invoice for errors. Send Now 유지.
- 확인된 상태: 검증 실패. 아직 어느 필드인지 화면 상단에서는 드러나지 않음.
- 단계 간 변화: 일반 검증 오류 토스트가 나타난다. Studio→Foundation 변경 과정은 미수록.

#### 동작과 데이터

- 화면 관찰: 오류 요약 알림이 나타난다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 어떤 버튼이 검증을 일으켰는지와 다른 동시 오류는 미확인.

#### 모델링 영향

- 후보와 근거: 폼 전체 오류와 필드 오류 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 빈 항목명 오류

- Screen ID: `sc_352b14335c44407885e9d014228f98ec`
- 원본: [화면 페이지](https://gummble.com/screens/sc_352b14335c44407885e9d014228f98ec?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c02c938f-2189-42c2-b1a1-40573958bf50.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_17b08f7253554c8e9691e71faebf58de` → 현재 → `sc_c4c151b48433485587c49123d3cc56f6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 본문 중간 프로젝트 아래 항목 표. 왼쪽 경고 아이콘과 빨간 테두리 입력.
- 입력 항목·필수 표시·기본값: Item name 빈 값, description optional, QTY1, PRICE0, TOTAL0. Tax0, 전체0.
- 버튼·메뉴·안내 문구: Add New Row, Add Unbilled Time, Add Discount, Add Expenses, 통화USD.
- 확인된 상태: 빈 이름 유효성 오류.
- 단계 간 변화: 항목 위치로 이동하면 빈 이름에 빨간 테두리와 경고 아이콘이 보인다.

#### 동작과 데이터

- 화면 관찰: 항목명 누락이 최소 하나의 오류 원인으로 직접 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 가격0 허용 여부나 다른 오류는 이 표시만으로 확정 불가.

#### 모델링 영향

- 후보와 근거: 항목명 검증과 선택적 설명·숫자 필드 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 서비스 라이브러리 추천

- Screen ID: `sc_c4c151b48433485587c49123d3cc56f6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c4c151b48433485587c49123d3cc56f6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/83e664e3-2939-4d27-9ac5-2ba1b3accf2a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_352b14335c44407885e9d014228f98ec` → 현재 → `sc_3588b6b5ac2447fdbc7ecb2454855fcf`

#### 화면에서 직접 확인한 내용

- 레이아웃: Item name 아래 초록 경계 드롭다운. 배경 항목 오류 유지.
- 입력 항목·필수 표시·기본값: Brand Design2500, Business Card Design100, Deck Design200, Flyer Design50. 설명은 일부 생략.
- 버튼·메뉴·안내 문구: 서비스 선택 행, Manage Services 외부 이동 아이콘.
- 확인된 상태: 서비스 선택 전.
- 단계 간 변화: 이름 입력 아래 서비스 추천 목록을 연다.

#### 동작과 데이터

- 화면 관찰: 이름 입력이 카탈로그 선택 진입점 역할을 한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색 필터·페이지네이션·통화·서비스 삭제 후 목록 처리 미확인.

#### 모델링 영향

- 후보와 근거: 서비스 카탈로그 조회와 문서 항목 복사 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Flyer Design 항목 적용

- Screen ID: `sc_3588b6b5ac2447fdbc7ecb2454855fcf`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3588b6b5ac2447fdbc7ecb2454855fcf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cce6a84f-0a83-4c8a-ade7-0a0cb700b762.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c4c151b48433485587c49123d3cc56f6` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 드롭다운 닫힌 항목 표, 오른쪽 요약 Amount50.
- 입력 항목·필수 표시·기본값: Flyer Design, 설명은 브랜드 가이드 기반 전단 디자인/레이아웃/카피와 원본 파일 제공. QTY1·PRICE50/item·TOTAL50, 소계/합계50USD, Tax0.
- 버튼·메뉴·안내 문구: Add New Row/Add Unbilled Time/가격단위 드롭다운, 할인·비용 추가.
- 확인된 상태: 이름 오류 테두리가 사라진 정상 입력 상태.
- 단계 간 변화: Flyer Design 선택 후 이름·설명·가격이 채워지고 금액50으로 바뀐다.

#### 동작과 데이터

- 화면 관찰: 카탈로그 선택 후 설명과 가격까지 채워지고 계산값이50으로 바뀜.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 별도 저장 버튼이 없어도 서버 저장 방식은 단정하지 않는다.

#### 모델링 영향

- 후보와 근거: 카탈로그 값의 문서별 스냅샷 및 수량×단가 계산 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 별표 대신 제출 검증에서 빈 Item name 오류를 표시한다. 설명에는 optional 표시가 있다.
- [관찰] 선택한 서비스의 이름·설명·단가가 함께 입력된다. 수량1, $50/item으로 총50.
- [문서] 서비스 라이브러리 수정은 미래 사용에 적용되며 이미 문서에 넣은 항목을 소급 변경하지 않는다고 설명한다.

## 6. 공식 도움말과 API 대조

- [Services library](https://help.hellobonsai.com/en/articles/12824095-services-library): 서비스 선택으로 속성을 채우고 문서 내에서 수정할 수 있다. 기존 문서의 값은 라이브러리 변경과 분리됨을 대조했다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 서비스 카탈로그와 인보이스 항목 스냅샷 분리 후보. 항목명·설명·수량·단가·단위·총액·정렬 순서.
- 필수 이름 검증을 생성 시점/발송 시점 어느 단계에 적용할지 확인 필요.

## 8. 미확인 사항과 검토 질문

- 카탈로그 없이 자유 입력 가능한지, 단위 변경·음수/0·소수 수량·할인 순서를 확인한다.
- 중복 선택·삭제·드래그 순서와 자동 저장 실패 복구를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

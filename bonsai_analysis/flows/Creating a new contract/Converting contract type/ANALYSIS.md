# Converting contract type 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `3903d09f-3610-46dd-808a-2e1017a411d5` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=3903d09f-3610-46dd-808a-2e1017a411d5) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

표준 계약을 전체 편집 가능한 문서로 전환한다.

- Drafted/Standardized 계약에서 시작해 Drafted/Fully Editable로 끝난다. 서명은 다음 하위 흐름에서 확인한다.

- 상위 분석: [Creating a new contract](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a new contract/Converting contract type`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_8e868b8f4bf24c25ba59cbdb3a6094dd`](https://gummble.com/screens/sc_8e868b8f4bf24c25ba59cbdb3a6094dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [계약 초안·첫 안내](<screens/01_sc_8e868b8f4bf24c25ba59cbdb3a6094dd.png>) | Convert to Fully Editable를 선택한다. 첫 화면의 투어 닫기는 미수록. |
| 02 | [`sc_849fda8a22f045908d632e7a577d6c12`](https://gummble.com/screens/sc_849fda8a22f045908d632e7a577d6c12?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [계약 타입 전환 확인](<screens/02_sc_849fda8a22f045908d632e7a577d6c12.png>) | Confirm Change 후 전환 결과를 확인한다. |
| 03 | [`sc_eddad5fbd6db473080c167790ff3bd1c`](https://gummble.com/screens/sc_eddad5fbd6db473080c167790ff3bd1c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Fully Editable 전환 완료](<screens/03_sc_eddad5fbd6db473080c167790ff3bd1c.png>) | 타입 변경 성공, 초안 상태 유지. |

## 4. 화면별 상세 분석

### 단계 01 — 계약 초안·첫 안내

- Screen ID: `sc_8e868b8f4bf24c25ba59cbdb3a6094dd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8e868b8f4bf24c25ba59cbdb3a6094dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e6ac0cb2-aba6-4e80-848c-76c4a7abb4af.png)
- 로컬 이미지: [01_sc_8e868b8f4bf24c25ba59cbdb3a6094dd.png](<screens/01_sc_8e868b8f4bf24c25ba59cbdb3a6094dd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_849fda8a22f045908d632e7a577d6c12`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 문서, 오른쪽 Overview/Settings/Payments, 위 툴바와 첫 투어 말풍선.
- 입력 항목·필수 표시·기본값: Drafted, Standardized, $20 USD/hour; 로고 on, Font FF Meta Serif, Single recipient(no co-signer). 본문에 당사자·범위·2/6~3/8·시급20·15일·10% 반영.
- 버튼·메뉴·안내 문구: Preview, Automation, Sign Contract, …; Add Custom Clause, Convert to Fully Editable; 투어 Next/X.
- 확인된 상태: 입력 부분은 노란 강조. 본문에는 비용 사전 승인 불필요·지원 미제공 등 마법사에서 직접 보지 못한 조항도 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 초안 생성과 조건의 본문 반영을 확인했다. 안내의 변호사 검토 문구는 제품 설명이지 본 분석의 법적 평가가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본 조항 출처, 전체 문서 하단, 실제 저장 요청 및 지급 설정 하단은 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 기본 조항과 사용자 입력의 출처, 문서 타입/상태/스타일 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 계약 타입 전환 확인

- Screen ID: `sc_849fda8a22f045908d632e7a577d6c12`
- 원본: [화면 페이지](https://gummble.com/screens/sc_849fda8a22f045908d632e7a577d6c12?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d127a9b3-6cc4-4e56-8ea8-09f3c28252c4.png)
- 로컬 이미지: [02_sc_849fda8a22f045908d632e7a577d6c12.png](<screens/02_sc_849fda8a22f045908d632e7a577d6c12.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8e868b8f4bf24c25ba59cbdb3a6094dd` → 현재 → `sc_eddad5fbd6db473080c167790ff3bd1c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좁은 중앙 모달, 어두운 문서 배경.
- 입력 항목·필수 표시·기본값: 입력란 없음. 전체 편집 허용·구조화 편집 불가·되돌릴 수 없음 안내.
- 버튼·메뉴·안내 문구: Confirm Change, 외부 X.
- 확인된 상태: 변경 전 영향과 비가역성을 명시한다.
- 단계 간 변화: Convert to Fully Editable를 선택한다. 첫 화면의 투어 닫기는 미수록.

#### 동작과 데이터

- 화면 관찰: 확인 전에는 전환 완료가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 취소 후 상태 및 권한 제약은 미수록.

#### 모델링 영향

- 후보와 근거: 변환 확인과 처리 이벤트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Fully Editable 전환 완료

- Screen ID: `sc_eddad5fbd6db473080c167790ff3bd1c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eddad5fbd6db473080c167790ff3bd1c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/085a6a13-3e30-4146-bfbc-72dcd922124e.png)
- 로컬 이미지: [03_sc_eddad5fbd6db473080c167790ff3bd1c.png](<screens/03_sc_eddad5fbd6db473080c167790ff3bd1c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_849fda8a22f045908d632e7a577d6c12` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 본문 강조가 없어지고 우측 설정이 간소화된다.
- 입력 항목·필수 표시·기본값: Drafted 유지, Type Fully Editable; 로고 on, FF Meta Serif, Single recipient, Currency USD. Overview의 Amount가 보이지 않는다.
- 버튼·메뉴·안내 문구: Sign Contract, Preview, Automation, …; 기존 Add Custom Clause/Convert 도구는 없어졌다.
- 확인된 상태: Contract has been successfully updated 토스트. 본문 계약 조건은 남아 있다.
- 단계 간 변화: Confirm Change 후 전환 결과를 확인한다.

#### 동작과 데이터

- 화면 관찰: 편집 타입 변경 성공을 확인했다. 금액 표시 제거가 데이터 삭제 증거는 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전환 이후 실제 본문 수정과 저장은 미수록.

#### 모델링 영향

- 후보와 근거: 자유 본문·타입·계약 상태의 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 확인 모달은 전체 문서 편집이 가능해지는 대신 구조화된 편집이 없어지고 되돌릴 수 없다고 안내한다.
- [관찰] 전환 후 노란 강조·Addendum·Contract Type 전환 도구가 사라지고 Type Fully Editable가 된다.
- [미확인] 기존 구조화 값의 내부 삭제 여부는 UI로 알 수 없다.

## 6. 공식 도움말과 API 대조

- [표준·사용자 정의 계약](https://help.hellobonsai.com/en/articles/918802-creating-completely-custom-contracts): Basic Info·Scope of Work·Payment 입력과 표준 계약의 부분 편집, 작성자 서명 후 발송 순서를 설명한다. 2026-07-27 이후 생성 계정은 통합 Document builder를 사용하므로 캡처의 구형 계약 편집기와 구분한다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인. 계약 타입 변환 전용 endpoint·필드는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 문서 편집 타입, 되돌릴 수 없는 변환 이벤트, 본문 스냅샷/버전 후보.
- 구조화 조건과 자유 본문 사이 연결을 잃는 시점 및 자동 청구 의존성을 검토할 후보.

## 8. 미확인 사항과 검토 질문

- 전환 후 청구 일정/시급 메타데이터가 유지되는지 확인한다.
- 일반 텍스트 편집 툴바·변수·서명 블록 제한과 저장 방식, 복제 후 표준형 복구 가능 여부를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

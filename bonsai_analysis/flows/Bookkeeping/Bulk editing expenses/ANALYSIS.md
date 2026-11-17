# Bulk editing expenses 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **7/7단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `91d17dc8-8701-405e-9133-a41f0f55c37c` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=91d17dc8-8701-405e-9133-a41f0f55c37c) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 7단계 / 7단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

여러 비용을 선택하여 분류를 한 번에 변경하고 선택·적용·종료 상태를 확인한다.

- 시작: 비용 목록. 종료: 두 비용의 분류 갱신 성공 알림과 일반 목록.
- 행위자: 비용 수정 권한이 있는 내부 사용자로 추정. 실제 역할 확인은 없다.
- 같은 선택 바에 삭제 버튼이 있지만 이 캡처는 분류 수정만 실행한 결과를 보여준다.
- 프론트 구현: 행 호버 체크, 다중 선택·개수, 고정 작업 바, Business/Personal 모달, 종료 후 선택 해제.

- 상위 분석: [Bookkeeping](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_762c1f934fdf40c0a61898b036cf4616`](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 등록 목록 | 첫 행 체크박스 노출. 두 번째 행 분류의 중간 변경은 생략됨. |
| 02 | [`sc_dfc7cc24d5e44970aef83904461fb9b3`](https://gummble.com/screens/sc_dfc7cc24d5e44970aef83904461fb9b3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 행 선택 진입 | 첫 행 선택 후 선택 모드·하단 작업 바 표시. |
| 03 | [`sc_f7e30f0ed4d948ceb5b3974adaad12dd`](https://gummble.com/screens/sc_f7e30f0ed4d948ceb5b3974adaad12dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 한 건 선택 | 두 번째 행도 선택되어 선택 수가 2로 변경. |
| 04 | [`sc_60bd6b02cf7b4dfaa405d4420f1b0122`](https://gummble.com/screens/sc_60bd6b02cf7b4dfaa405d4420f1b0122?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 두 건 선택 | Bulk Edit 2 Expenses 모달 표시. |
| 05 | [`sc_8f3583b359d745948b724f5308184f7f`](https://gummble.com/screens/sc_8f3583b359d745948b724f5308184f7f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 일괄 분류 수정 모달 | Personal 선택과 Category Personal 반영. |
| 06 | [`sc_c29c33560d4f4e15bdf1c7771979b0a5`](https://gummble.com/screens/sc_c29c33560d4f4e15bdf1c7771979b0a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Personal 일괄 분류 선택 | 일반 목록 복귀, 두 행 Personal 변경과 성공 알림. |
| 07 | [`sc_30a856c3cb1b43bbb51a56cffe5fd65e`](https://gummble.com/screens/sc_30a856c3cb1b43bbb51a56cffe5fd65e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 일괄 분류 수정 성공 | 선택 해제된 목록에서 기록 종료. |

## 4. 화면별 상세 분석

### 단계 01 — Expenses 등록 목록

- Screen ID: `sc_762c1f934fdf40c0a61898b036cf4616`
- 원본: [화면 페이지](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/549dc499-2f3b-4b0d-9534-73c488617a77.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_dfc7cc24d5e44970aef83904461fb9b3`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭, 검색·Filters·더보기·New Expense, Name/Date/Category/Amount 테이블.
- 입력 항목·필수 표시·기본값: 비용 세 행, Non-billable 보조 문구, Personal/Advertising 분류 칩과 금액, 영수증·반복처럼 보이는 상태 아이콘.
- 버튼·메뉴·안내 문구: 검색, Filters, New Expense, 목록 및 행의 더보기.
- 확인된 상태: 실데이터가 있는 목록. 이전 시작 안내와 달리 세 비용을 표시한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 전후 이미지 사이에 등록 과정이 빠져 있다. 앞선 CTA를 누르기만 하면 세 항목이 자동 생성된다고 해석하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아이콘의 정확한 의미, 정렬·검색 범위, 청구 연결과 세금.

#### 모델링 영향

- 후보와 근거: 비용·분류·프로젝트 청구 상태·첨부·반복 관련 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 비용 행 선택 진입

- Screen ID: `sc_dfc7cc24d5e44970aef83904461fb9b3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dfc7cc24d5e44970aef83904461fb9b3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4e9d4eb3-bb1b-48dc-9d43-ab5cd3cce437.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_762c1f934fdf40c0a61898b036cf4616` → 현재 → `sc_f7e30f0ed4d948ceb5b3974adaad12dd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 목록 첫 행 왼쪽 체크박스가 드러난 상태.
- 입력 항목·필수 표시·기본값: 분류는 Personal / Design Resources / Advertising.
- 버튼·메뉴·안내 문구: 행 체크박스, 더보기·New Expense.
- 확인된 상태: 선택 체크는 아직 없다.
- 단계 간 변화: 첫 행 체크박스 노출. 두 번째 행 분류의 중간 변경은 생략됨.

#### 동작과 데이터

- 화면 관찰: 첫 캡처와 달리 두 번째 비용 분류가 바뀌어 있다. 중간 편집 경위는 생략됐다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 호버로 체크박스가 나타나는지, 선택 모드 진입의 다른 경로.

#### 모델링 영향

- 후보와 근거: 선택 대상 ID 집합과 표시 데이터의 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 비용 한 건 선택

- Screen ID: `sc_f7e30f0ed4d948ceb5b3974adaad12dd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f7e30f0ed4d948ceb5b3974adaad12dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4fc532eb-47c7-4f9f-8466-1c22b70da0f9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_dfc7cc24d5e44970aef83904461fb9b3` → 현재 → `sc_60bd6b02cf7b4dfaa405d4420f1b0122`

#### 화면에서 직접 확인한 내용

- 레이아웃: 행별 및 헤더 체크박스, 우상단 Cancel editing, 하단 고정 작업 바.
- 입력 항목·필수 표시·기본값: 첫 행만 선택; 1 expenses selected.
- 버튼·메뉴·안내 문구: Edit Category / Delete Expense / Cancel editing.
- 확인된 상태: 선택 모드, 한 건 선택.
- 단계 간 변화: 첫 행 선택 후 선택 모드·하단 작업 바 표시.

#### 동작과 데이터

- 화면 관찰: 선택 수에 맞춰 하단 작업 이름이 단수로 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 선택 범위·선택 0건 상태·필터 변경 시 선택 유지.

#### 모델링 영향

- 후보와 근거: 선택 상태와 명령 대상 목록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 비용 두 건 선택

- Screen ID: `sc_60bd6b02cf7b4dfaa405d4420f1b0122`
- 원본: [화면 페이지](https://gummble.com/screens/sc_60bd6b02cf7b4dfaa405d4420f1b0122?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6c0f1a71-28c8-48e2-8f3b-54a1462de18b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f7e30f0ed4d948ceb5b3974adaad12dd` → 현재 → `sc_8f3583b359d745948b724f5308184f7f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 목록에 첫 두 행 체크와 하단 작업 바.
- 입력 항목·필수 표시·기본값: 2 expenses selected.
- 버튼·메뉴·안내 문구: Edit Category / Delete Expenses / Cancel editing.
- 확인된 상태: 두 건 선택; 세 번째 행은 미선택.
- 단계 간 변화: 두 번째 행도 선택되어 선택 수가 2로 변경.

#### 동작과 데이터

- 화면 관찰: 선택 수가 2로 바뀌며 삭제 버튼 문구도 복수로 바뀐다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다중 페이지 선택과 권한이 다른 항목 혼합 시 처리.

#### 모델링 영향

- 후보와 근거: 다중 비용 ID와 작업별 결과 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 비용 일괄 분류 수정 모달

- Screen ID: `sc_8f3583b359d745948b724f5308184f7f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8f3583b359d745948b724f5308184f7f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/927a1108-3308-4167-94ab-1418a5a503aa.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_60bd6b02cf7b4dfaa405d4420f1b0122` → 현재 → `sc_c29c33560d4f4e15bdf1c7771979b0a5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Bulk Edit 2 Expenses 모달, 어두운 배경.
- 입력 항목·필수 표시·기본값: Business/Personal 세그먼트 중 Business, Category Select.
- 버튼·메뉴·안내 문구: Update Category / 닫기.
- 확인된 상태: 두 비용에 적용할 새 분류를 아직 선택하지 않음.
- 단계 간 변화: Bulk Edit 2 Expenses 모달 표시.

#### 동작과 데이터

- 화면 관찰: 기존 두 행의 서로 다른 분류 대신 적용할 단일 새 값을 받는 폼으로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 분류 미선택 제출 검증·부분 성공·닫기 후 선택 유지.

#### 모델링 영향

- 후보와 근거: 일괄 수정 대상 집합과 공통 변경값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Personal 일괄 분류 선택

- Screen ID: `sc_c29c33560d4f4e15bdf1c7771979b0a5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c29c33560d4f4e15bdf1c7771979b0a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d66af5b9-eb87-43f5-a5f4-9326c7d9a7de.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8f3583b359d745948b724f5308184f7f` → 현재 → `sc_30a856c3cb1b43bbb51a56cffe5fd65e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달에서 Personal 세그먼트 활성.
- 입력 항목·필수 표시·기본값: Category가 Personal로 표시됨.
- 버튼·메뉴·안내 문구: Update Category / 닫기.
- 확인된 상태: Personal 선택 후 저장 전.
- 단계 간 변화: Personal 선택과 Category Personal 반영.

#### 동작과 데이터

- 화면 관찰: Business/Personal 선택에 따라 Category 값도 달라진다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Personal 고정값인지 추가 하위 분류 선택 가능한지.

#### 모델링 영향

- 후보와 근거: 비용 용도와 분류의 관계 후보; 중복 상태 저장 여부 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 일괄 분류 수정 성공

- Screen ID: `sc_30a856c3cb1b43bbb51a56cffe5fd65e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_30a856c3cb1b43bbb51a56cffe5fd65e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0c9baa90-5260-4113-9566-a513f1379db9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c29c33560d4f4e15bdf1c7771979b0a5` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 일반 목록 복귀, 하단 선택 바 제거, 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: 첫 두 비용 모두 Personal, 금액 10/30 유지. 세 번째 Advertising 유지.
- 버튼·메뉴·안내 문구: New Expense와 일반 더보기 복원.
- 확인된 상태: 2 expenses updated category successfully 알림.
- 단계 간 변화: 일반 목록 복귀, 두 행 Personal 변경과 성공 알림.

#### 동작과 데이터

- 화면 관찰: 선택 대상 두 행의 분류 적용과 비대상 유지가 확인된다. 전체 transaction 성공 규칙은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 부분 실패·동시 변경·이미 청구된 비용의 오류 UI.

#### 모델링 영향

- 후보와 근거: 변경 대상별 결과·권한 검증·선택 해제와 캐시 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 선택 대상 두 행의 금액은 유지되고 분류가 Personal로 바뀐다. 비선택 행은 유지된다.
- 관찰: 선택 수가 제목·하단 문구·삭제 버튼의 단복수에 반영된다.
- 문서 확인: 이미 청구된 비용은 일괄 수정·삭제 제한이 있다. 이 캡처는 제한 오류를 보여주지 않는다.
- 미확인: 일부 대상 실패 시 전체 rollback 여부·동시 수정·전체 선택 범위·Cancel editing의 구체 결과.

## 6. 공식 도움말과 API 대조

- [비용 일괄 편집](https://help.hellobonsai.com/en/articles/1865151-how-to-bulk-edit-your-expenses): 다중 선택 후 분류 변경·삭제를 제공하며 이미 청구된 비용의 변경을 제한한다고 안내한다. 화면은 분류 수정의 정상 경로만 수록한다.
- [비용 분류 관리](https://help.hellobonsai.com/en/articles/3184359-how-to-add-expense-categories): 분류는 기존 비용에도 적용할 수 있다.
- [공식 API 목록](https://docs.hellobonsai.com/api)에서 비용 bulk update endpoint·부분 실패 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 설계 가정: 명시적 대상 ID 배열과 적용할 분류 ID를 가진 일괄 변경 명령 후보.
- 설계 가정: 이미 청구됨 상태에 따른 변경 가능성 검증. 화면의 Non-billable과 이미 청구됨을 같은 상태로 취급하지 않는다.
- 선택 집합은 UI 상태이며, transaction 범위·버전 충돌·개별 결과는 실제 계약 확인 전 미확정.

## 8. 미확인 사항과 검토 질문

- 청구된 항목과 미청구 항목을 함께 선택하면 어떻게 표시·거절하는가? 혼합 상태 계정 시험.
- 전체 선택은 현재 페이지인가 전체 필터 결과인가? 페이지가 여러 개인 목록 조사.
- 취소하면 선택만 해제되는가 폼 값도 사라지는가? 모달 닫기와 Cancel editing 각각 확인.
- 반복 비용의 한 건 분류 변경이 다음 발생분에도 반영되는가? 반복 설정과 발생분 관계 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 7개와 실제 이미지 7개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

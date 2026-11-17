# Adding a bookkeeping category 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `3a74090f-e360-4fb9-9b79-c1ca197708ba` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=3a74090f-e360-4fb9-9b79-c1ca197708ba) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

사용자 비용 분류를 이름과 색상으로 생성하고, 목록의 새 행과 편집·삭제 진입점을 확인한다.

- 시작: Manage Categories 화면. 종료: 생성 성공 토스트와 Other Expenses 그룹의 새 행.
- 행위자: 로그인한 내부 사용자. 계정 역할별 생성 권한은 미확인.
- 비용 자체의 생성·분류 적용은 이 흐름에 없다. 생성한 분류를 선택하는 별도 비용 편집과 연결된다.
- 프론트 구현: 모달 폼, 포커스, 색상 선택 체크, 저장 후 토스트와 스크롤 하단 새 행.

- 상위 분석: [Bookkeeping](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_f0127ee4970e49ffbd910ddfac504812`](https://gummble.com/screens/sc_f0127ee4970e49ffbd910ddfac504812?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 카테고리 관리 | New Category 모달로 전환. |
| 02 | [`sc_f2a7c3be441a4a95ab91fba511865483`](https://gummble.com/screens/sc_f2a7c3be441a4a95ab91fba511865483?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 새 비용 분류 모달 | 회색 예시 문구가 검은 입력값과 포커스 테두리로 바뀜. |
| 03 | [`sc_086fba724bae4db892400f6143884a6b`](https://gummble.com/screens/sc_086fba724bae4db892400f6143884a6b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 분류 이름 입력 | 팔레트 빨간색 칸에 선택 체크 표시. |
| 04 | [`sc_ca9be0cbcb06461b8ac05fc9b4ac4c82`](https://gummble.com/screens/sc_ca9be0cbcb06461b8ac05fc9b4ac4c82?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 분류 색상 선택 | 모달이 닫히며 생성 성공 토스트 표시. |
| 05 | [`sc_5cc7db97cb1e4603bf9a8bb575dc2771`](https://gummble.com/screens/sc_5cc7db97cb1e4603bf9a8bb575dc2771?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 분류 생성 성공 알림 | 목록 하단에서 새 분류와 Edit/Delete 확인. |
| 06 | [`sc_c4fdb168bca742cda9c29d382eb86995`](https://gummble.com/screens/sc_c4fdb168bca742cda9c29d382eb86995?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 생성된 사용자 분류 행 | 생성된 항목 확인으로 기록 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 비용 카테고리 관리

- Screen ID: `sc_f0127ee4970e49ffbd910ddfac504812`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f0127ee4970e49ffbd910ddfac504812?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bca8e895-6ad6-4a2f-a670-7833cad3c3cb.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f2a7c3be441a4a95ab91fba511865483`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭 안의 분류 관리 화면. All Expenses 복귀 버튼과 New Category, Personal Expenses 설정, 그룹별 카테고리 행.
- 입력 항목·필수 표시·기본값: Personal 비용을 장부와 보고서에 포함하는 체크가 선택됨. Advertising, Cost of Labor, Materials & Supplies 등의 분류에 색과 잠금 아이콘.
- 버튼·메뉴·안내 문구: All Expenses, New Category, 개인 비용 포함 체크박스.
- 확인된 상태: 기존 분류가 있는 목록. 잠금은 보이지만 수정 제한의 정확한 조건은 미확인.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 분류 목록과 보고서 포함 설정이 별도 요소로 나타난다. 체크 변경의 저장 시점은 캡처되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잠긴 기본 분류의 수정·삭제 범위, 사용자 분류가 사용 중일 때 삭제 정책.

#### 모델링 영향

- 후보와 근거: 카테고리 그룹·분류·색상·시스템 제공 여부, 개인 비용 집계 포함 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 비용 분류 모달

- Screen ID: `sc_f2a7c3be441a4a95ab91fba511865483`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f2a7c3be441a4a95ab91fba511865483?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/66c8e2c3-cb14-4076-ace0-17e16c2a2fb7.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f0127ee4970e49ffbd910ddfac504812` → 현재 → `sc_086fba724bae4db892400f6143884a6b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 배경을 어둡게 처리한 중앙 모달. 이름, 색상 팔레트, 하단 저장.
- 입력 항목·필수 표시·기본값: 이름 입력의 회색 Design Resources 텍스트. 필수 별표는 보이지 않는다.
- 버튼·메뉴·안내 문구: Save Category와 여러 색상 선택 칸.
- 확인된 상태: 입력 전으로 보이는 상태. 회색 문구는 placeholder 가능성이 있어 기본값으로 확정하지 않는다.
- 단계 간 변화: New Category 모달로 전환.

#### 동작과 데이터

- 화면 관찰: 이름과 색상이라는 두 입력 축이 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 이름·중복 이름 검증, 기본 색상, 닫기·바깥 클릭의 취소 효과.

#### 모델링 영향

- 후보와 근거: 분류의 표시 이름과 색상 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 분류 이름 입력

- Screen ID: `sc_086fba724bae4db892400f6143884a6b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_086fba724bae4db892400f6143884a6b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c2cf17c3-9510-4577-9a28-b8e3994bed7e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f2a7c3be441a4a95ab91fba511865483` → 현재 → `sc_ca9be0cbcb06461b8ac05fc9b4ac4c82`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달. 이름 필드에 녹색 포커스 테두리, 우상단 외부 닫기 아이콘.
- 입력 항목·필수 표시·기본값: Design Resources가 검은 입력값으로 보인다. 색상 체크는 아직 없다.
- 버튼·메뉴·안내 문구: Save Category, 닫기, 팔레트.
- 확인된 상태: 이름 입력 상태.
- 단계 간 변화: 회색 예시 문구가 검은 입력값과 포커스 테두리로 바뀜.

#### 동작과 데이터

- 화면 관찰: 이름이 채워졌지만 아직 저장 완료 화면은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 포커스·키보드 저장과 최대 길이·공백 정규화.

#### 모델링 영향

- 후보와 근거: 임시 폼 값과 저장된 분류를 구분할 필요.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 분류 색상 선택

- Screen ID: `sc_ca9be0cbcb06461b8ac05fc9b4ac4c82`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ca9be0cbcb06461b8ac05fc9b4ac4c82?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a608aa92-563f-47b2-91e7-1d0f02f2a08c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_086fba724bae4db892400f6143884a6b` → 현재 → `sc_5cc7db97cb1e4603bf9a8bb575dc2771`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달의 빨간색 칸에 흰 체크 표시.
- 입력 항목·필수 표시·기본값: 이름 유지, 선택 색상 한 개 표시.
- 버튼·메뉴·안내 문구: Save Category, 닫기, 색상 팔레트.
- 확인된 상태: 색상 선택 후 저장 전.
- 단계 간 변화: 팔레트 빨간색 칸에 선택 체크 표시.

#### 동작과 데이터

- 화면 관찰: 선택한 색상이 폼 상태로 표시된다. HEX·색상 토큰은 이미지로 읽을 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 색상 저장 형식과 임의 색 허용 여부.

#### 모델링 영향

- 후보와 근거: UI 팔레트 선택값 후보. 저장 형식을 먼저 고정하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 분류 생성 성공 알림

- Screen ID: `sc_5cc7db97cb1e4603bf9a8bb575dc2771`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5cc7db97cb1e4603bf9a8bb575dc2771?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bfa56a91-e548-4bf7-9d1a-0e094ef97492.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ca9be0cbcb06461b8ac05fc9b4ac4c82` → 현재 → `sc_c4fdb168bca742cda9c29d382eb86995`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달이 닫히고 기존 분류 목록 상단, 우하단 생성 성공 토스트.
- 입력 항목·필수 표시·기본값: 추가 폼 없음. 기존 분류는 유지된다.
- 버튼·메뉴·안내 문구: New Category, All Expenses, 토스트 닫기.
- 확인된 상태: Design Resources 생성 성공 문구.
- 단계 간 변화: 모달이 닫히며 생성 성공 토스트 표시.

#### 동작과 데이터

- 화면 관찰: 생성 성공이 명시돼 있다. 새 행은 현재 스크롤 위치에 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 중복 제출 처리와 생성된 항목으로 자동 스크롤 여부.

#### 모델링 영향

- 후보와 근거: 새 분류 생성과 목록 갱신/토스트 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 생성된 사용자 분류 행

- Screen ID: `sc_c4fdb168bca742cda9c29d382eb86995`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c4fdb168bca742cda9c29d382eb86995?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/46936d77-91b0-4046-aba9-403541e9854d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_5cc7db97cb1e4603bf9a8bb575dc2771` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 목록 아래 Other Expenses 그룹 안에 새 Design Resources 행.
- 입력 항목·필수 표시·기본값: 새 분류의 왼쪽 빨간색 선. 기본 항목들은 잠금 아이콘.
- 버튼·메뉴·안내 문구: 새 행 우측 Edit / Delete.
- 확인된 상태: 사용자 분류에 편집·삭제 작업이 보이며 생성 토스트가 남아 있다.
- 단계 간 변화: 목록 하단에서 새 분류와 Edit/Delete 확인.

#### 동작과 데이터

- 화면 관찰: 새 분류 이름과 선택 색상 반영을 함께 확인한다. 이 한 사례에서 모든 새 분류의 그룹을 확정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 그룹에 추가 가능 여부, 비용이 참조하는 분류 삭제 시 처리.

#### 모델링 영향

- 후보와 근거: 시스템 제공 분류와 사용자 분류의 변경 가능성 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 이름·색상과 명시적 Save Category 버튼이 있다. 폼 변경 즉시 저장으로 해석하지 않는다.
- 관찰: 생성된 분류가 선택한 이름·색상으로 나타난다.
- 문서 확인: 기본 분류의 잠금은 수정·삭제 제한을 뜻하고 사용자 분류는 편집·삭제할 수 있다.
- 미확인: 분류 이름 중복·최대 길이·색상 생략의 기본값·사용 중인 분류 삭제 영향.

## 6. 공식 도움말과 API 대조

- [비용 분류 관리](https://help.hellobonsai.com/en/articles/3184359-how-to-add-expense-categories): 이름과 선택적 색상으로 생성하며 기본 분류는 수정·삭제 불가라는 안내를 확인했다. 화면의 잠금 아이콘과 사용자 행의 Edit/Delete가 이에 대응한다.
- [공식 API 목록](https://docs.hellobonsai.com/api)에서 비용 분류 생성 endpoint·필드 계약은 확인하지 못했다. 화면의 색상 칸으로 HEX 저장을 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정: ExpenseCategory의 표시 이름·색상·시스템 제공 여부와 계정 소유 후보.
- 설계 가정: 기본 분류 그룹과 사용자 분류의 소속 관계. 이번 새 행은 Other Expenses에 있지만 모든 생성 규칙으로 일반화하지 않는다.
- 카테고리 삭제 시 비용의 분류를 비우거나 대체하는 정책은 별도 확인한다.

## 8. 미확인 사항과 검토 질문

- 색상 없이 저장하면 어떤 값이 지정되는가? 빈 폼·기본 선택·재진입 검증.
- 중복 이름과 공백 입력이 허용되는가? 오류 화면 확인.
- 새 분류의 그룹을 선택·이동할 수 있는가? 추가 편집 플로우 확인.
- 참조 중인 분류 삭제는 금지·미분류 전환·대체 중 무엇인가? 계정 재현 필요.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

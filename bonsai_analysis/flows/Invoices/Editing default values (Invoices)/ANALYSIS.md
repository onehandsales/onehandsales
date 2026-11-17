# Editing default values (Invoices) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a0f52cca-9fee-46e5-af2b-369e1db5e602` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a0f52cca-9fee-46e5-af2b-369e1db5e602) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

새 인보이스의 기본 연체료와 세율을 변경한다.

- Invoices > Default Values에서 시작한다.
- 샘플 값 Late Fee10%, Tax5%는 캡처 관찰이며 우리 제품의 법적·기본 정책으로 채택하지 않는다.

- 상위 분석: [Invoices](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_22fa89558d47416c89104f9b96182708`](https://gummble.com/screens/sc_22fa89558d47416c89104f9b96182708?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 향후 인보이스 기본값 | 아래로 스크롤해 Tax ID와 Default Note를 확인한다. |
| 02 | [`sc_1429ac3005b545e89627fc165c1bf87c`](https://gummble.com/screens/sc_1429ac3005b545e89627fc165c1bf87c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 기본값 하단 | Late Fee를10.0, Tax를5.0으로 수정한다. |
| 03 | [`sc_f0f1e695ecd84ecfa14c3110a6d1e97e`](https://gummble.com/screens/sc_f0f1e695ecd84ecfa14c3110a6d1e97e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기본 연체료10·세율5 입력 | Save Changes 후 상단으로 돌아오고 저장 성공 알림이 나타난다. |
| 04 | [`sc_faca016141424494ac9de7e2e0e9c66e`](https://gummble.com/screens/sc_faca016141424494ac9de7e2e0e9c66e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기본값 저장 성공 | 새 기본값 저장으로 종료. 기존 문서 변경은 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 향후 인보이스 기본값

- Screen ID: `sc_22fa89558d47416c89104f9b96182708`
- 원본: [화면 페이지](https://gummble.com/screens/sc_22fa89558d47416c89104f9b96182708?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f3b7b5e8-47ff-4a4c-aeb2-e49289acad4f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_1429ac3005b545e89627fc165c1bf87c`

#### 화면에서 직접 확인한 내용

- 레이아웃: Default Values 탭 아래 넓은 Invoice Defaults 카드. 좌측 설명·우측 입력, 상단 Save Changes.
- 입력 항목·필수 표시·기본값: 수수료 고객 부담 unchecked, Late Fee 0.0%, Tax 0.0%, Days Until Due 회색30, Tax ID 예시값 TAX-123. 별표 없음.
- 버튼·메뉴·안내 문구: Save Changes. 새로 만드는 인보이스에 적용된다는 설명. 연체료는 만기 다음날과 이후 매월, 세금은 할인 차감 후 소계라는 안내.
- 확인된 상태: 저장 전 기본 설정 조회. 회색 예시는 실제 저장값인지 placeholder인지 구분 필요.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 계정 기본 정책 편집 영역. 기존 문서 변경과 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 국가별 세법 적합성·계산 반올림·30일 대 한달 차이 미확인.

#### 모델링 영향

- 후보와 근거: 미래 문서 초기값과 문서별 스냅샷 후보. 법적 세율을 이 샘플로 확정하지 않음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 인보이스 기본값 하단

- Screen ID: `sc_1429ac3005b545e89627fc165c1bf87c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1429ac3005b545e89627fc165c1bf87c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/99aeb4b0-851d-45b1-9942-9a4a7973a178.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_22fa89558d47416c89104f9b96182708` → 현재 → `sc_f0f1e695ecd84ecfa14c3110a6d1e97e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 카드 하단. Save Changes는 카드 우상단에 유지, 전체 입력이 드러남.
- 입력 항목·필수 표시·기본값: Late/Tax0.0, due 회색30, VAT/TAX 회색TAX-123, Default Note 회색예시. 수수료 부담 unchecked.
- 버튼·메뉴·안내 문구: Save Changes. Default Note는 여러 줄 입력.
- 확인된 상태: 기본값 조회, 수정 전.
- 단계 간 변화: 아래로 스크롤해 Tax ID와 Default Note를 확인한다.

#### 동작과 데이터

- 화면 관찰: 노트·Tax ID까지 기본값 범위를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: placeholder와 저장값 구별은 포커스·빈 입력 확인 필요.

#### 모델링 영향

- 후보와 근거: 계정 기본 문구와 번호·기간 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 기본 연체료10·세율5 입력

- Screen ID: `sc_f0f1e695ecd84ecfa14c3110a6d1e97e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f0f1e695ecd84ecfa14c3110a6d1e97e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/54cb6cc1-8020-4e40-8845-ce875b423b96.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1429ac3005b545e89627fc165c1bf87c` → 현재 → `sc_faca016141424494ac9de7e2e0e9c66e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 기본값 카드.
- 입력 항목·필수 표시·기본값: Late Fee10.0%, Tax5.0%. due30 예시·노트·세금번호 예시·수수료 체크는 유지.
- 버튼·메뉴·안내 문구: Save Changes.
- 확인된 상태: 수정 중. 저장 성공 알림 없음.
- 단계 간 변화: Late Fee를10.0, Tax를5.0으로 수정한다.

#### 동작과 데이터

- 화면 관찰: 두 수치만 변경된 것을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 허용 범위와 저장 검증 오류 미수록.

#### 모델링 영향

- 후보와 근거: 정확한 소수형 비율, 편집 초안 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 기본값 저장 성공

- Screen ID: `sc_faca016141424494ac9de7e2e0e9c66e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_faca016141424494ac9de7e2e0e9c66e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fec3aa98-ce9b-408a-933a-08ee3ccd56ba.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f0f1e695ecd84ecfa14c3110a6d1e97e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 탭과 카드가 다시 보이고 우하단 성공 알림.
- 입력 항목·필수 표시·기본값: Late10.0·Tax5.0 유지.
- 버튼·메뉴·안내 문구: Your changes have been successfully saved. Save Changes 유지.
- 확인된 상태: 저장 성공 표시.
- 단계 간 변화: Save Changes 후 상단으로 돌아오고 저장 성공 알림이 나타난다.

#### 동작과 데이터

- 화면 관찰: 변경값 반영이 UI로 확인됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새 문서에 실제 복사된 예와 과거 문서 불변 여부는 이 흐름에 없음.

#### 모델링 영향

- 후보와 근거: 설정 변경 시점과 미래 문서 적용 범위 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰·문서] 이 기본값 변경은 이후 생성되는 인보이스에만 적용된다.
- [관찰] Processing Fees 고객 부담은 선택하지 않는다.
- [문서] 연체료는 만기 다음날부터 월 단위, 세금은 할인 후 소계를 기준으로 설명한다. 상세 계산·반올림은 별도 확인.

## 6. 공식 도움말과 API 대조

- [기본값 도움말](https://help.hellobonsai.com/en/articles/3161415-how-to-add-or-update-default-information-on-invoices-late-fees-tax-rate-etc): 2026-07-17 기준 Settings > Defaults > Invoices 경로로 바뀌었지만 미래 문서에만 적용된다는 범위는 캡처와 일치한다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 계정 청구 기본값과 문서에 복사된 값의 경계를 두는 후보.
- 연체료율·세율·만기 일수·세금번호·기본 노트·수수료 부담 설정은 타입과 적용 범위가 다르다.

## 8. 미확인 사항과 검토 질문

- 30일과 한 달이라는 안내가 실제 날짜 계산에서 어떤 규칙인지 월말·윤년 예제로 확인한다.
- 음수·100%초과·소수점 허용, 금액 반올림, 연체료 복리 여부를 확인해야 한다.
- 설정 변경 전 생성된 반복 시리즈의 다음 회차가 이전/새 기본값 중 무엇을 따르는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

# Updating invoice settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `4a05877b-fd77-4532-a407-7c93a2168895` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=4a05877b-fd77-4532-a407-7c93a2168895) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

인보이스 테마를 Foundation으로 바꾸고 지급 후 팁 허용을 켠다.

- 전체 화면 Invoice Settings에서 시작한다.
- 설정 저장 후 인보이스 목록으로 복귀하며 성공 토스트가 나타난다.

- 상위 분석: [Invoices](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b96b8024d9e94f8aa91b24da19fc2935`](https://gummble.com/screens/sc_b96b8024d9e94f8aa91b24da19fc2935?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 표현 설정 Studio | Studio→Foundation으로 선택 테두리와 미리보기 배치가 바뀐다. |
| 02 | [`sc_a4aa5cf8e2204935970ed13659b6fc3e`](https://gummble.com/screens/sc_a4aa5cf8e2204935970ed13659b6fc3e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Foundation 테마 선택 | 아래로 스크롤해 추가 옵션을 확인한다. |
| 03 | [`sc_752e75d6e41f4272954812c0b29612aa`](https://gummble.com/screens/sc_752e75d6e41f4272954812c0b29612aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 설정 하단 옵션 | Allow tipping after invoice is paid를 체크한다. |
| 04 | [`sc_f84d19bb7f274b65afda1546a7d69bce`](https://gummble.com/screens/sc_f84d19bb7f274b65afda1546a7d69bce?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 지급 후 팁 허용 선택 | Save Changes 후 목록으로 이동하며 성공 알림이 나타난다. |
| 05 | [`sc_4b3ef98e88cb4f6da6cf29b82b72fca1`](https://gummble.com/screens/sc_4b3ef98e88cb4f6da6cf29b82b72fca1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 설정 저장 후 목록 | 설정 저장으로 종료. 결제 고객 화면은 수록되지 않았다. |

## 4. 화면별 상세 분석

### 단계 01 — 인보이스 표현 설정 Studio

- Screen ID: `sc_b96b8024d9e94f8aa91b24da19fc2935`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b96b8024d9e94f8aa91b24da19fc2935?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/77f09916-d140-4cf6-90ad-dbafa50686ba.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_a4aa5cf8e2204935970ed13659b6fc3e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 사이드바가 없는 전체 화면. 왼쪽 설정·오른쪽 Demo Invoice 미리보기, 상단 고정 Close/Save.
- 입력 항목·필수 표시·기본값: Invoice Layout Studio 선택(Foundation/Classic 대안), Payment Page Side-By-Side 선택(Single-Column 대안), Timesheet는 링크 표시. 첨부 잠금·부분결제·팁 off, 프로젝트명 on, 단위숨김·세자리rate off.
- 버튼·메뉴·안내 문구: Update Branding, Learn More, Close, Save Changes. 기존/신규 인보이스 모두 적용 안내.
- 확인된 상태: 문서 테마와 결제 페이지 레이아웃을 별도 선택. 미리보기는 실제 청구서가 아니다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 표시 정책과 결제 관련 옵션이 같은 설정 페이지에 함께 있으나 서로 다른 필드다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Close 시 수정 폐기 여부, 요금제 제한, 기존 PDF 재생성 미확인.

#### 모델링 영향

- 후보와 근거: 계정 문서 스타일·결제 페이지 표시·첨부 접근·금액표현 정책 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Foundation 테마 선택

- Screen ID: `sc_a4aa5cf8e2204935970ed13659b6fc3e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a4aa5cf8e2204935970ed13659b6fc3e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/12eb2277-7e35-4c93-89a2-cbdda23549d6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b96b8024d9e94f8aa91b24da19fc2935` → 현재 → `sc_752e75d6e41f4272954812c0b29612aa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 Invoice Layout 중 Foundation에 초록 테두리, 오른쪽 데모 문서의 로고·제목·날짜 배치 변경.
- 입력 항목·필수 표시·기본값: Foundation, Side-By-Side, Timesheet 링크, 프로젝트명 on. 다른 체크 off.
- 버튼·메뉴·안내 문구: Close/Save Changes/Update Branding.
- 확인된 상태: 테마 미리보기 변경, 아직 저장 전.
- 단계 간 변화: Studio→Foundation으로 선택 테두리와 미리보기 배치가 바뀐다.

#### 동작과 데이터

- 화면 관찰: 테마만 바뀌어 미리보기 배치에 반영됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미리보기 즉시 변경과 서버 저장의 시점은 다를 수 있음.

#### 모델링 영향

- 후보와 근거: 테마 식별자와 렌더링 구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 인보이스 설정 하단 옵션

- Screen ID: `sc_752e75d6e41f4272954812c0b29612aa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_752e75d6e41f4272954812c0b29612aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a7d3bd93-9da2-43be-a3d3-fe2aaf289b46.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a4aa5cf8e2204935970ed13659b6fc3e` → 현재 → `sc_f84d19bb7f274b65afda1546a7d69bce`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 아래로 스크롤, 오른쪽 Demo Invoice와 상단 작업바 고정.
- 입력 항목·필수 표시·기본값: 첨부 잠금 off, 부분결제 off, 팁 off, 프로젝트명 on, 단위 숨김 off, rate3자리 off, other결제수단 off.
- 버튼·메뉴·안내 문구: Save Changes/Close, 각 체크박스. 3자리 단가 예시 $0.002 per word.
- 확인된 상태: 추가 옵션 조회.
- 단계 간 변화: 아래로 스크롤해 추가 옵션을 확인한다.

#### 동작과 데이터

- 화면 관찰: 카드 결제 전용 설명·완납 후 첨부 해제·발송 때 프로젝트명 표시 등 조건 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 체크별 기본값·요금제별 차이 미확인.

#### 모델링 영향

- 후보와 근거: 표시·결제 정책의 조건별 적용 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 지급 후 팁 허용 선택

- Screen ID: `sc_f84d19bb7f274b65afda1546a7d69bce`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f84d19bb7f274b65afda1546a7d69bce?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6c453da6-c091-4d33-95ce-ba99e34ae726.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_752e75d6e41f4272954812c0b29612aa` → 현재 → `sc_4b3ef98e88cb4f6da6cf29b82b72fca1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 설정 하단 동일 배치.
- 입력 항목·필수 표시·기본값: Allow tipping after invoice is paid 체크 on, 프로젝트명 on, 나머지 off.
- 버튼·메뉴·안내 문구: Save Changes와 Close. 카드결제만 허용한다는 설명 유지.
- 확인된 상태: 수정 중, 성공 알림 전.
- 단계 간 변화: Allow tipping after invoice is paid를 체크한다.

#### 동작과 데이터

- 화면 관찰: 팁 허용만 새로 선택됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객 팁 화면·비율·금액 한도·거래처리 미수록.

#### 모델링 영향

- 후보와 근거: 팁 허용 설정과 실제 팁 거래를 분리하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 인보이스 설정 저장 후 목록

- Screen ID: `sc_4b3ef98e88cb4f6da6cf29b82b72fca1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4b3ef98e88cb4f6da6cf29b82b72fca1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/97a9d5c9-f171-41b7-b238-fadbce71d6e0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f84d19bb7f274b65afda1546a7d69bce` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 일반 사이드바·목록 복귀, 결제 안내 배너 없이 검색·3행 표.
- 입력 항목·필수 표시·기본값: #1003$21, #1002$5517.75, #1001$70.04, Paid모두0. 이 값 변화는 앞 설정 클릭으로 발생했다고 볼 근거 없음.
- 버튼·메뉴·안내 문구: Your invoice settings has been saved. Filters/New Invoice/Edit Payment Methods/행…
- 확인된 상태: 설정 저장 성공. 기존 캡처와 목록 데이터가 달라 촬영 시점 차이 가능.
- 단계 간 변화: Save Changes 후 목록으로 이동하며 성공 알림이 나타난다.

#### 동작과 데이터

- 화면 관찰: 저장 완료 알림이 직접 근거. 추가 인보이스 생성은 중간 미수록.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 변경된 옵션의 실제 고객 화면 적용·목록 데이터 생성 경위 미확인.

#### 모델링 영향

- 후보와 근거: 설정 저장과 업무 데이터 변경을 분리해 추적할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 문서 테마와 결제 페이지 배치는 별도 선택이다. Side-By-Side는 유지된다.
- [관찰] 팁은 지급 이후, Stripe/Bonsai 카드 결제에 한정된다는 설명. 부분 결제와 첨부 잠금은 꺼져 있다.
- [관찰] 기존·신규 인보이스 모두 적용된다는 상단 안내가 있다.
- [미확인] 미리보기의 단가$1000와 합계0 불일치는 데모 표현이며 실제 계산 규칙 근거로 쓰지 않는다.

## 6. 공식 도움말과 API 대조

- [결제 페이지 레이아웃](https://help.hellobonsai.com/en/articles/6537018-payment-page-layouts-on-client-invoices): 문서는 두 배치를 설명하며 2026-05-28 기준 기본값은 Single-column이라고 한다. 캡처의 선택값 Side-By-Side를 제품 전체 기본값으로 확정하지 않는다.
- [인보이스 생성 도움말](https://help.hellobonsai.com/en/articles/2899904-how-to-create-an-invoice): 유형·고객·프로젝트 선택 후 문서 편집으로 이어진다. 현행 세금은 항목별 세율 선택도 설명하므로 캡처의 전체 세율과 구분한다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 계정 문서 테마·결제 페이지 배치·시간표 표시·팁·부분결제·첨부 잠금의 독립 설정 후보.
- 단가3자리 옵션은 표시/입력 정밀도 정책이며 전체 금액 통화 소수 자릿수와 혼동하지 않는다.

## 8. 미확인 사항과 검토 질문

- 결제 완료 문서와 이미 내려받은 PDF에 스타일 변경이 어떻게 적용되는가? 보존 정책 확인이 필요하다.
- 팁 지원 결제수단·국가·요금제와 지급 후 반환·회계 집계를 별도 확인한다.
- 저장하지 않고 Close할 때 취소 확인 및 복원 여부를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

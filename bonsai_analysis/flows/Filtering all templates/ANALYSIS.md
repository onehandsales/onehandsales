# Filtering all templates 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `89d6f212-12fc-4ad4-b11c-0bbd29708101` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=89d6f212-12fc-4ad4-b11c-0bbd29708101) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

공개 템플릿 목록에서 Agreements·Quotes 유형을 바꾸고 템플릿 카드를 탐색한다.

- 앱 내부 문서 템플릿 선택과 별도 공개 카탈로그다.
- 하위 Template detail에서 견적 템플릿 상세로 진입한다.

- 하위 플로우: [Template detail](Template%20detail/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_f15443150bce43e5a44a761e74b0d42a`](https://gummble.com/screens/sc_f15443150bce43e5a44a761e74b0d42a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 전체 템플릿 소개 | 전체 목록 아래로 스크롤 |
| 02 | [`sc_826656b002c84fcc984a990ae447215b`](https://gummble.com/screens/sc_826656b002c84fcc984a990ae447215b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 전체 목록 스크롤 | Agreements 유형 선택 결과로 변경 |
| 03 | [`sc_f8d0d8d84e874ab481ebdbbabb9e74d2`](https://gummble.com/screens/sc_f8d0d8d84e874ab481ebdbbabb9e74d2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Agreements 유형 선택 | Quotes 유형 선택 결과로 변경 |
| 04 | [`sc_9aaceaacba1b49429aa15c0b6c593574`](https://gummble.com/screens/sc_9aaceaacba1b49429aa15c0b6c593574?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Quotes 유형 결과 | Quotes 목록 아래로 스크롤 |
| 05 | [`sc_fc7ec8014b3e45d18c406ff267152a0a`](https://gummble.com/screens/sc_fc7ec8014b3e45d18c406ff267152a0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Quotes 목록 아래 | 카드 목록에서 종료; 상세는 별도 flow |

## 4. 화면별 상세 분석

### 단계 01 — 전체 템플릿 소개

- Screen ID: `sc_f15443150bce43e5a44a761e74b0d42a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f15443150bce43e5a44a761e74b0d42a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8461c7ad-0b09-4a87-802a-4f5500540372.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_826656b002c84fcc984a990ae447215b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 제목·500+ 소개·가입CTA, 가로 문서유형 메뉴, 왼쪽 업종 목록·오른쪽3열 카드.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: All·Contracts·Proposals·Agreements·Invoices·Quotes·Briefs·Forms, 업종 필터.
- 확인된 상태: 초기 카드 Invoice 제목인데 Task management 라벨이 붙어 있고 첫 두 썸네일은 없다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 초기 렌더·카피 불일치 가능성 기록; Invoice=Task라는 규칙은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 라벨 오류 원인·초기 선택·로딩 상태 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 유형·업종·미리보기·제목 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 전체 목록 스크롤

- Screen ID: `sc_826656b002c84fcc984a990ae447215b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_826656b002c84fcc984a990ae447215b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a6deb650-c05c-42fc-9d90-5068556a1fc0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f15443150bce43e5a44a761e74b0d42a` → 현재 → `sc_f8d0d8d84e874ab481ebdbbabb9e74d2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 헤더·가로 유형 메뉴 아래 왼쪽 업종 다수와 오른쪽3열 카드.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 업종 All부터 IT Services까지 보이고 아래로 더 이어짐.
- 확인된 상태: Itemized Bill·Rental·Zoho·Work·Window Tint·Welding 및 아래 Wedding/WebDesign/Wave 일부. Task management 라벨 유지.
- 단계 간 변화: 전체 목록 아래로 스크롤

#### 동작과 데이터

- 화면 관찰: 유형 전체 목록에서 청구서 관련 템플릿이 연속 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 순서 규칙·총 개수·업종 다중 선택·누락 이미지 원인 미확인.

#### 모델링 영향

- 후보와 근거: 유형/업종 필터와 정렬·선택적 미리보기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Agreements 유형 선택

- Screen ID: `sc_f8d0d8d84e874ab481ebdbbabb9e74d2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f8d0d8d84e874ab481ebdbbabb9e74d2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1da42856-b0fc-49d3-b4a4-539cd523e247.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_826656b002c84fcc984a990ae447215b` → 현재 → `sc_9aaceaacba1b49429aa15c0b6c593574`

#### 화면에서 직접 확인한 내용

- 레이아웃: Agreements 초록 활성, 왼쪽 업종 동일, 카드가 계약류로 변경.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Catering·Software Maintenance·Writing Partnership·Freelance Writer·Subcontractor·Software Development 카드.
- 확인된 상태: 카드 라벨 Agreements로 변경, 일부 미리보기 누락.
- 단계 간 변화: Agreements 유형 선택 결과로 변경

#### 동작과 데이터

- 화면 관찰: 유형 선택에 따라 목록이 달라지는 것을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 유형과 업종 결합·URL 상태·유형 경계 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 유형 필터 후보; 계약/합의서 실제 문서 유형 매핑은 별도.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Quotes 유형 결과

- Screen ID: `sc_9aaceaacba1b49429aa15c0b6c593574`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9aaceaacba1b49429aa15c0b6c593574?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3535a55d-381f-4759-bda2-15c947a9d8bb.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f8d0d8d84e874ab481ebdbbabb9e74d2` → 현재 → `sc_fc7ec8014b3e45d18c406ff267152a0a`

#### 화면에서 직접 확인한 내용

- 레이아웃: Quotes 초록 활성, 왼쪽 업종·오른쪽3열 견적 카드.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Website Design·Work Quote·Video Production·Software Development·Social Media Marketing·Sample Quotation 등.
- 확인된 상태: 아이콘이 종이비행기·라벨 Quotes로 바뀌고 미리보기 제목은 검정.
- 단계 간 변화: Quotes 유형 선택 결과로 변경

#### 동작과 데이터

- 화면 관찰: 문서유형 선택으로 카드 내용·아이콘이 함께 달라진다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 선택 유지·업종 조건 미확인.

#### 모델링 영향

- 후보와 근거: 유형별 아이콘·카탈로그 필터 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Quotes 목록 아래

- Screen ID: `sc_fc7ec8014b3e45d18c406ff267152a0a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fc7ec8014b3e45d18c406ff267152a0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1ed9c314-a021-4b83-985f-b9a649df9abf.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9aaceaacba1b49429aa15c0b6c593574` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정 헤더 아래 견적 카드3열, 왼쪽 업종 영역은 이 위치에서 비어 있다.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Interior Design·HTML·Freelance·Digital Marketing·eCommerce Website·Editable·Formal·Contractor·Coaching Package.
- 확인된 상태: 9개 카드와 일부 하단 잘림, 각각 미리보기·라벨·제목.
- 단계 간 변화: Quotes 목록 아래로 스크롤

#### 동작과 데이터

- 화면 관찰: 같은 유형 안 다양한 업종·용도의 템플릿이 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 개수·목록 끝·스크롤 로딩 방식 미확인.

#### 모델링 영향

- 후보와 근거: 목록 가상화/페이징 여부는 구현 전 확인.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 전체 목록의 청구서 카드가 Task management로 표시되는 불일치를 확인했다. 잘못된 업무 유형을 모델에 반영하지 않는다.
- 유형 필터 결과는 관찰했지만 업종 필터 실행은 수록되지 않았다.
- 공개 제목의 Quote·Agreement·Contract가 실제 API document type과 같은지 미확인이다.

## 6. 공식 도움말과 API 대조

- [공식 공개 템플릿 목록](https://www.hellobonsai.com/templates): 문서 유형·업종별 탐색과 개별 템플릿·사용 CTA를 확인했다. 현재 분류·목록은 캡처와 다르며 앱 내부 template API와 1:1 대응은 확인되지 않았다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 템플릿 콘텐츠·문서유형·업종·썸네일·상세 URL·필터 상태 후보.
- 한 템플릿의 다중 업종 연결·공개 템플릿과 계정 복제본 관계는 미정.

## 8. 미확인 사항과 검토 질문

- 업종 필터·유형과의 교집합·검색/페이징·빈 결과·초기 잘못된 라벨을 확인한다.
- 썸네일 미표시가 결측 자산인지 로딩 지연인지 확인한다.
- 공개 카탈로그 ID와 앱 template API ID의 대응을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

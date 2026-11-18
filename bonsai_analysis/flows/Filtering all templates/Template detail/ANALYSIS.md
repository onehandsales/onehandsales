# Template detail 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `4fe6aa73-a216-43cb-87ff-be898ffc869c` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=4fe6aa73-a216-43cb-87ff-be898ffc869c) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

공개 eCommerce 견적 템플릿을 열고 설명·미리보기·FAQ를 읽은 뒤 사용 진입점을 확인한다.

- 카드 목록→간소 헤더 상세→본문·고정 이메일 CTA로 이어진다.
- 문서 편집·계정 복제·발송 완료는 없다.

- 상위 분석: [Filtering all templates](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Filtering all templates/Template detail`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_6fe2078a11e04511ade794821209d7b9`](https://gummble.com/screens/sc_6fe2078a11e04511ade794821209d7b9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [eCommerce 견적 카드 강조](<screens/01_sc_6fe2078a11e04511ade794821209d7b9.png>) | eCommerce 견적 상세로 이동 |
| 02 | [`sc_f0b529d5983e420e9347fbc1fd4f1117`](https://gummble.com/screens/sc_f0b529d5983e420e9347fbc1fd4f1117?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [견적 템플릿 상세 hero](<screens/02_sc_f0b529d5983e420e9347fbc1fd4f1117.png>) | 설명·평점·목차로 스크롤 |
| 03 | [`sc_7257089466d443e2b0fc855262f2ba7b`](https://gummble.com/screens/sc_7257089466d443e2b0fc855262f2ba7b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [상세 설명·목차·고정 가입바](<screens/03_sc_7257089466d443e2b0fc855262f2ba7b.png>) | 가격 요소·미리보기로 이동; 중간 본문 미수록 |
| 04 | [`sc_dc17b07446c945b281c1f295bba5f569`](https://gummble.com/screens/sc_dc17b07446c945b281c1f295bba5f569?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [가격 설명·견적 미리보기](<screens/04_sc_dc17b07446c945b281c1f295bba5f569.png>) | FAQ·추가 템플릿 영역으로 이동 |
| 05 | [`sc_0195208c431944b1bb900b5c48355e90`](https://gummble.com/screens/sc_0195208c431944b1bb900b5c48355e90?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [FAQ·추가 템플릿](<screens/05_sc_0195208c431944b1bb900b5c48355e90.png>) | 설명 하단에서 종료; Customize 실행 없음 |

## 4. 화면별 상세 분석

### 단계 01 — eCommerce 견적 카드 강조

- Screen ID: `sc_6fe2078a11e04511ade794821209d7b9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6fe2078a11e04511ade794821209d7b9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1c14a74e-27cd-4ca9-bf6f-2e9cdf9c6a75.png)
- 로컬 이미지: [01_sc_6fe2078a11e04511ade794821209d7b9.png](<screens/01_sc_6fe2078a11e04511ade794821209d7b9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f0b529d5983e420e9347fbc1fd4f1117`

#### 화면에서 직접 확인한 내용

- 레이아웃: Quotes 목록 가운데 eCommerce Website 카드만 연녹색 배경.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: eCommerce Website Quotation Template 카드.
- 확인된 상태: hover/focus로 보이는 강조.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 상세 진입 대상을 시각적으로 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 입력 방식·카드 전체 클릭 영역 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 카드 상호작용 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 견적 템플릿 상세 hero

- Screen ID: `sc_f0b529d5983e420e9347fbc1fd4f1117`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f0b529d5983e420e9347fbc1fd4f1117?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/43f58933-3dc3-4024-bbe6-8fa3d2eeb8a0.png)
- 로컬 이미지: [02_sc_f0b529d5983e420e9347fbc1fd4f1117.png](<screens/02_sc_f0b529d5983e420e9347fbc1fd4f1117.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6fe2078a11e04511ade794821209d7b9` → 현재 → `sc_7257089466d443e2b0fc855262f2ba7b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 로고·Get template만 남긴 간소 헤더, 빵부스러기·중앙 제목·설명·CTA.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Home > Quotes > Quote templates 경로, Get template 두 곳.
- 확인된 상태: eCommerce Website Quotation Template, 브랜딩·기존 서비스·발송·열람 확인 소개.
- 단계 간 변화: eCommerce 견적 상세로 이동

#### 동작과 데이터

- 화면 관찰: 공개 상세 소개이며 편집기·문서 복제는 아직 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 버튼의 가입/편집 이동·실제 read receipt 범위 미확인.

#### 모델링 영향

- 후보와 근거: 공개 템플릿 상세·유형·SEO경로·사용 CTA 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 상세 설명·목차·고정 가입바

- Screen ID: `sc_7257089466d443e2b0fc855262f2ba7b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7257089466d443e2b0fc855262f2ba7b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/df7d221b-0b20-4b28-8091-33d7f7dbaf09.png)
- 로컬 이미지: [03_sc_7257089466d443e2b0fc855262f2ba7b.png](<screens/03_sc_7257089466d443e2b0fc855262f2ba7b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f0b529d5983e420e9347fbc1fd4f1117` → 현재 → `sc_dc17b07446c945b281c1f295bba5f569`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 누적 문서수·평점 홍보, 왼쪽목차3개·오른쪽본문, 하단 고정바.
- 입력 항목·필수 표시·기본값: Enter your email 빈 입력.
- 버튼·메뉴·안내 문구: Customize, 목차·Get template.
- 확인된 상태: 1,023,928 문서와500,000+ 홍보; 견적 필요성·작성·가격 요소 목차.
- 단계 간 변화: 설명·평점·목차로 스크롤

#### 동작과 데이터

- 화면 관찰: 템플릿 설명 콘텐츠이며 실제 저장 데이터가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 누적수 집계·본문 전체·템플릿 편집 동작 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 본문·목차·가입 유입 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 가격 설명·견적 미리보기

- Screen ID: `sc_dc17b07446c945b281c1f295bba5f569`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dc17b07446c945b281c1f295bba5f569?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d413a8ce-1508-45ce-9897-17be6facd92f.png)
- 로컬 이미지: [04_sc_dc17b07446c945b281c1f295bba5f569.png](<screens/04_sc_dc17b07446c945b281c1f295bba5f569.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7257089466d443e2b0fc855262f2ba7b` → 현재 → `sc_0195208c431944b1bb900b5c48355e90`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 목차 유지, 오른쪽 Design·Functionality·Integration 설명과 작은 문서 미리보기, 하단 고정 CTA.
- 입력 항목·필수 표시·기본값: 실제 입력 없음; 미리보기 From/To·날짜·항목·수량/단가/총액.
- 버튼·메뉴·안내 문구: Get template, 이메일 Customize.
- 확인된 상태: 미리보기 아래 Rating4.9 배지.
- 단계 간 변화: 가격 요소·미리보기로 이동; 중간 본문 미수록

#### 동작과 데이터

- 화면 관찰: 가격 요소는 일반 작성 안내이고 계산 정책은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 작은 미리보기 세부값·실제 문서 타입·평점 출처 미확인.

#### 모델링 영향

- 후보와 근거: 설명·미리보기·평점 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — FAQ·추가 템플릿

- Screen ID: `sc_0195208c431944b1bb900b5c48355e90`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0195208c431944b1bb900b5c48355e90?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6ec6526d-33b9-4a3c-8574-3df26b2f7855.png)
- 로컬 이미지: [05_sc_0195208c431944b1bb900b5c48355e90.png](<screens/05_sc_0195208c431944b1bb900b5c48355e90.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_dc17b07446c945b281c1f295bba5f569` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 질문3개와 답변이 모두 펼쳐진 텍스트, 아래 추가 템플릿 제목.
- 입력 항목·필수 표시·기본값: 하단 이메일 빈칸.
- 버튼·메뉴·안내 문구: Get template, Customize.
- 확인된 상태: 웹사이트 견적 작성·포함 사항·eCommerce 견적 정의; 하단 No items found 일부가 고정바 위에 보인다.
- 단계 간 변화: FAQ·추가 템플릿 영역으로 이동

#### 동작과 데이터

- 화면 관찰: FAQ는 이 화면에서 접힘 UI가 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 추가 템플릿 빈 상태가 로딩/오류/실제0건인지 미확인.

#### 모델링 영향

- 후보와 근거: FAQ 렌더링·추천 목록 빈 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- Get template/Customize 버튼 존재는 계정에 템플릿을 저장했다는 증거가 아니다.
- 견적 미리보기는 읽기 전용 이미지이며 실제 금액 계산·입력 검증은 미확인이다.
- 추가 템플릿 영역의 No items found와 1,000개 홍보는 서로 다른 표시여서 실제 목록 로딩·빈 상태를 재확인해야 한다.

## 6. 공식 도움말과 API 대조

- [공식 eCommerce 견적 템플릿](https://www.hellobonsai.com/quote-template/ecommerce-website): 서비스·가격·고객정보·조건 커스터마이즈 설명과 유사 본문을 확인했다. 현재 FAQ·설명은 캡처와 일부 다르다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 공개 템플릿 콘텐츠·설명 섹션·FAQ·미리보기·카탈로그 분류 후보.
- 실제 사용 시 계정별 복제본·버전·고객/프로젝트 연결 후보는 편집기/API 근거가 더 필요하다.

## 8. 미확인 사항과 검토 질문

- Get template와 이메일 Customize의 로그인 전후 결과·템플릿 ID 전달을 확인한다.
- 전체 미리보기·중간 설명·추가 목록의 빈 상태를 재확인한다.
- 견적과 청구서·제안서의 실제 앱 문서 유형 대응은 미정이다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

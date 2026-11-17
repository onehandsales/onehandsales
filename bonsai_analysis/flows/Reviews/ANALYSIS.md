# Reviews 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `d501af32-ef6e-4ca1-8d3f-cf6e67874a08` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=d501af32-ef6e-4ca1-8d3f-cf6e67874a08) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

방문자가 평점·영상·업종별 후기를 읽고 가입을 고려한다.

- Landing page와 업종별 페이지의 후기 재사용을 비교할 수 있다.
- 영상 재생·리뷰 제출은 수록되지 않았다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_21f0e007e04d45edbd410a1dffdff04c`](https://gummble.com/screens/sc_21f0e007e04d45edbd410a1dffdff04c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 리뷰 페이지 hero | 영상 썸네일로 스크롤 |
| 02 | [`sc_a605cb0e7e164a64b2707c0a110eafa6`](https://gummble.com/screens/sc_a605cb0e7e164a64b2707c0a110eafa6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 영상 후기 썸네일 | 후기 그리드로 스크롤 |
| 03 | [`sc_7d668b0699a945e98ca3ccbe29066b7a`](https://gummble.com/screens/sc_7d668b0699a945e98ca3ccbe29066b7a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 업종별 후기 카드 | 후기 하단으로 스크롤; 중간 행 일부 미수록 |
| 04 | [`sc_a6b1e7be914645e293f35918c57e4ee9`](https://gummble.com/screens/sc_a6b1e7be914645e293f35918c57e4ee9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 후기 그리드 아래 | 후기 목록 중간/하단에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 리뷰 페이지 hero

- Screen ID: `sc_21f0e007e04d45edbd410a1dffdff04c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21f0e007e04d45edbd410a1dffdff04c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5b6fbc3f-1828-477b-90c1-12d8555713ba.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_a605cb0e7e164a64b2707c0a110eafa6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 큰 제목·사용자 수 홍보·리뷰 플랫폼 평점과 CTA, 아래 영상 썸네일.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Start free, G2 및 다른 리뷰 플랫폼 배지.
- 확인된 상태: 500,000+ 홍보, G2 Top performer·다른 플랫폼4.7 표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 홍보 평점이며 개별 원본 리뷰·산식은 확인하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 집계 시점·외부 링크 목적지 미확인.

#### 모델링 영향

- 후보와 근거: 리뷰 출처·표시 평점·기준일 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 영상 후기 썸네일

- Screen ID: `sc_a605cb0e7e164a64b2707c0a110eafa6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a605cb0e7e164a64b2707c0a110eafa6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ea81fca-37e1-4f2b-ad35-5bdfaced2ae0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_21f0e007e04d45edbd410a1dffdff04c` → 현재 → `sc_7d668b0699a945e98ca3ccbe29066b7a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 넓은 둥근 영상 썸네일 중앙 초록 재생 버튼, 아래 업종별 후기 제목.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 재생 버튼.
- 확인된 상태: 영상은 재생 전 상태.
- 단계 간 변화: 영상 썸네일로 스크롤

#### 동작과 데이터

- 화면 관찰: 인터뷰 내용·플레이어 동작은 확인하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자막·재생 플랫폼·모달 여부 미확인.

#### 모델링 영향

- 후보와 근거: 영상 자산·포스터·재생 UI 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 업종별 후기 카드

- Screen ID: `sc_7d668b0699a945e98ca3ccbe29066b7a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7d668b0699a945e98ca3ccbe29066b7a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d044dac2-5d31-48e6-aa10-18cacf9a39a3.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a605cb0e7e164a64b2707c0a110eafa6` → 현재 → `sc_a6b1e7be914645e293f35918c57e4ee9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 그리드에 이름·직무·후기, 아래 다음 행 일부.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 별도 제출·필터 버튼 없음.
- 확인된 상태: Kimberly Accountant, Laura Coach, Nick Creative Director, Phil Communications Specialist, Megan Copywriter, Raewyn Virtual Assistant.
- 단계 간 변화: 후기 그리드로 스크롤

#### 동작과 데이터

- 화면 관찰: 후기에 청구·CRM·시간·은행 등이 언급되지만 제품 규칙은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 후기 원본·검증·정렬 기준 미확인.

#### 모델링 영향

- 후보와 근거: 후기·작성자 표시명·직무·본문 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 후기 그리드 아래

- Screen ID: `sc_a6b1e7be914645e293f35918c57e4ee9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a6b1e7be914645e293f35918c57e4ee9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/88ef4fdd-a28e-4952-9670-e1e49c308c2c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_7d668b0699a945e98ca3ccbe29066b7a` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 3열 카드 연속. 위·아래 행 일부는 잘린 상태.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 리뷰 작성·필터·페이지 이동 버튼 없음.
- 확인된 상태: Alexandre Consultant, Brianna Photographer, Karissa Business Owner, Omari Growth Marketer, Jess Writer, Ravneet Brand Consultant; 하단 Leonardo·Peter·Taylor 일부.
- 단계 간 변화: 후기 하단으로 스크롤; 중간 행 일부 미수록

#### 동작과 데이터

- 화면 관찰: 후기 본문 길이에 따라 여백이 달라지지만 카드 행 높이는 맞춰져 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목록 끝·전체 개수·중간 누락 카드 미확인.

#### 모델링 영향

- 후보와 근거: 후기 카드 높이·긴 본문 처리·콘텐츠 순서 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 사용자 수·평점은 캡처의 홍보 수치이며 현재 수치가 아니다.
- 후기 속 지급 수수료·자동 청구 언급은 개인 경험이므로 보편 정책으로 확정하지 않는다.
- 카드의 이름·직무를 실제 CRM 연락처 레코드와 연결하지 않는다.

## 6. 공식 도움말과 API 대조

- [공식 Reviews](https://www.hellobonsai.com/reviews): 현재도 영상·후기 콘텐츠가 있고 일부 작성자가 겹친다. 배치·집계 수치·직무 표기는 달라졌으며 별도 버전으로 기록한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 리뷰 콘텐츠·표시명·직무·영상·평점 출처·표시 순서 후보.
- 실제 후기 수집·승인·평점 연동 모델은 이 읽기 화면만으로 알 수 없다.

## 8. 미확인 사항과 검토 질문

- 영상 전체·자막·모바일 카드 배열·누락된 후기 행을 확인한다.
- 리뷰 외부 원본·동의·선정 기준은 미확인이다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

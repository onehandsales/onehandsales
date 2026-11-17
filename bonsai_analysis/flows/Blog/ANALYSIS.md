# Blog 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=be5bc5f4-c2fa-4ea2-a923-0250d6302fcb) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

Resources에서 블로그로 이동해 일반 목록·분류·검색·기사 진입점을 확인한다.

- 하위 Searching blog에서 분류+검색, Blog detail에서 기사 읽기를 다룬다.
- 공개 글의 추천 내용 자체를 앱 업무 규칙으로 취급하지 않는다.

- 하위 플로우: [Blog detail](Blog%20detail/ANALYSIS.md), [Searching blog](Searching%20blog/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_549a6fa823b74e3e8d826750df6f1f99`](https://gummble.com/screens/sc_549a6fa823b74e3e8d826750df6f1f99?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Resources 메뉴 | Blog 목록 페이지로 이동 |
| 02 | [`sc_f784e647d4c44c448969e5641b1f3fd0`](https://gummble.com/screens/sc_f784e647d4c44c448969e5641b1f3fd0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 블로그 목록 초기 | General 활성 표시가 생김; 기사 목록은 동일 |
| 03 | [`sc_ed1d234775a74b4bad3ca7f497d20970`](https://gummble.com/screens/sc_ed1d234775a74b4bad3ca7f497d20970?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | General 선택 | 아래로 스크롤해 저자와 다음 행 노출 |
| 04 | [`sc_2c58d306a0c54343967cbe26160fc0cb`](https://gummble.com/screens/sc_2c58d306a0c54343967cbe26160fc0cb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 글 카드 저자와 다음 행 | 목록에서 종료; 상세는 별도 하위 flow |

## 4. 화면별 상세 분석

### 단계 01 — Resources 메뉴

- Screen ID: `sc_549a6fa823b74e3e8d826750df6f1f99`
- 원본: [화면 페이지](https://gummble.com/screens/sc_549a6fa823b74e3e8d826750df6f1f99?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cd020105-7f11-4e27-bef0-5183f569d6bc.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f784e647d4c44c448969e5641b1f3fd0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공개 헤더 아래 Learn·Tools 두 열 메가 메뉴, 배경 hero.
- 입력 항목·필수 표시·기본값: 배경 이메일 빈칸.
- 버튼·메뉴·안내 문구: Learn Blog·Help Center; Tools Contract Maker·Invoice Generator·Self-Employed Taxes Hub·Freelance Rates Explorer·How to Bill a Client.
- 확인된 상태: Resources가 초록색 활성.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 공개 글·도구 탐색 진입점.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메뉴 열림·닫힘 트리거 미확인.

#### 모델링 영향

- 후보와 근거: 자료 탐색 메뉴·도구 링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 블로그 목록 초기

- Screen ID: `sc_f784e647d4c44c448969e5641b1f3fd0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f784e647d4c44c448969e5641b1f3fd0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/764b8fbf-501c-4046-96d6-143bccf0f20a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_549a6fa823b74e3e8d826750df6f1f99` → 현재 → `sc_ed1d234775a74b4bad3ca7f497d20970`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 제목·설명·검색창, 8개 분류 가로 메뉴, 아래 3열 기사 카드.
- 입력 항목·필수 표시·기본값: Search 빈 입력.
- 버튼·메뉴·안내 문구: General·Finances·Legal·Taxes·Finding work·Start a business·Marketing yourself·Tools.
- 확인된 상태: Agency CRM·조직도·White label software 글. 카드에 분류·제목·요약·이미지.
- 단계 간 변화: Blog 목록 페이지로 이동

#### 동작과 데이터

- 화면 관찰: 현재 보이는 목록에 별도 활성 분류 배경이 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 초기 데이터 로딩인지 전체 목록 기본값인지 미확인.

#### 모델링 영향

- 후보와 근거: 기사·분류·요약·검색 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — General 선택

- Screen ID: `sc_ed1d234775a74b4bad3ca7f497d20970`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ed1d234775a74b4bad3ca7f497d20970?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0098d8b2-48bd-4735-8909-85223ab00fd4.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f784e647d4c44c448969e5641b1f3fd0` → 현재 → `sc_2c58d306a0c54343967cbe26160fc0cb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 목록·검색창에서 General만 초록 pill로 강조.
- 입력 항목·필수 표시·기본값: Search 빈칸.
- 버튼·메뉴·안내 문구: General 활성, 나머지 분류 일반 링크.
- 확인된 상태: 카드 3개는 앞과 동일하다.
- 단계 간 변화: General 활성 표시가 생김; 기사 목록은 동일

#### 동작과 데이터

- 화면 관찰: General은 전체 글에 가까운 선택일 수 있으나 서버 필터 의미는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭/hover/초기화 지연 중 무엇인지 미확인.

#### 모델링 영향

- 후보와 근거: 분류 선택 상태와 기사 자체 카테고리를 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 글 카드 저자와 다음 행

- Screen ID: `sc_2c58d306a0c54343967cbe26160fc0cb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2c58d306a0c54343967cbe26160fc0cb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fc1e606c-8a4b-4cab-8cb4-f38df04fe624.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ed1d234775a74b4bad3ca7f497d20970` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 스크롤되어 제목 hero는 사라지고 검색·분류·첫 행 전체·둘째 행 이미지가 보인다.
- 입력 항목·필수 표시·기본값: 검색은 비어 있고 General 활성.
- 버튼·메뉴·안내 문구: 기사 제목·저자 Brian Hughes 링크.
- 확인된 상태: 첫 세 카드에 같은 저자 사진·이름 표시, 요약 길이 차이.
- 단계 간 변화: 아래로 스크롤해 저자와 다음 행 노출

#### 동작과 데이터

- 화면 관찰: 글 메타데이터의 이미지·분류·제목·요약·저자 구성을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 발행일·정렬·글 전체 개수 미확인.

#### 모델링 영향

- 후보와 근거: 재사용 기사 카드·선택적 메타데이터 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- General 선택 상태에도 카드 분류 Tools·Business structure가 표시되어 탐색 분류와 기사 라벨이 일치하지 않을 수 있다.
- 초기2→3은 선택/로딩 상태 변화이며 정확한 클릭은 미수록이다.

## 6. 공식 도움말과 API 대조

- [공식 Blog](https://www.hellobonsai.com/blog): 현재도 기사·분류·검색 진입을 확인했다. 목록·카피·레이아웃은 캡처와 달라 동일 시점 데이터로 취급하지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 기사·카테고리·저자·썸네일·요약·상세 URL·검색·추천 순서 후보.
- 공개 글 검색과 앱의 프로젝트/문서 검색은 별도 범위다.

## 8. 미확인 사항과 검토 질문

- 각 분류 결과·전체 페이지네이션·빈 상태·모바일 그리드를 확인한다.
- 검색이 제목/본문/저자 어디를 대상으로 하는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |

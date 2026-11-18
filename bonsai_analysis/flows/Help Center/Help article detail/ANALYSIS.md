# Help article detail 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

인기 포털 도움말을 열고 목차·본문·관련 문서·피드백을 탐색한다.

- 이미지 속 당시 도움말과 현재 공식 문서의 내용을 분리한다.
- 삽입된 앱 스크린샷은 설명 자료이며 사용자 계정 조작이 아니다.

- 상위 분석: [Help Center](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Help Center/Help article detail`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_2230bb5f099d482fb1f0ba9741d4b7e8`](https://gummble.com/screens/sc_2230bb5f099d482fb1f0ba9741d4b7e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [인기 포털 도움말 강조](<screens/01_sc_2230bb5f099d482fb1f0ba9741d4b7e8.png>) | 포털 도움말 상세로 이동 |
| 02 | [`sc_e20cb01482774429b6136ac17d2039d7`](https://gummble.com/screens/sc_e20cb01482774429b6136ac17d2039d7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [포털 도움말 상단](<screens/02_sc_e20cb01482774429b6136ac17d2039d7.png>) | 브랜딩 위치로 스크롤/목차 이동; 동작 원인 미수록 |
| 03 | [`sc_2c564244ef024e9cb6b56810d545b154`](https://gummble.com/screens/sc_2c564244ef024e9cb6b56810d545b154?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [포털 브랜딩 설명 위치](<screens/03_sc_2c564244ef024e9cb6b56810d545b154.png>) | 마지막 질문·관련 문서·평가 영역으로 이동 |
| 04 | [`sc_e244e36695a94b13b56282b9633d1d00`](https://gummble.com/screens/sc_e244e36695a94b13b56282b9633d1d00?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [문서 하단 질문·연관 문서·평가](<screens/04_sc_e244e36695a94b13b56282b9633d1d00.png>) | 피드백 선택 없이 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 인기 포털 도움말 강조

- Screen ID: `sc_2230bb5f099d482fb1f0ba9741d4b7e8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2230bb5f099d482fb1f0ba9741d4b7e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c3cbc903-3ec0-4e23-909a-e094b02fe74d.png)
- 로컬 이미지: [01_sc_2230bb5f099d482fb1f0ba9741d4b7e8.png](<screens/01_sc_2230bb5f099d482fb1f0ba9741d4b7e8.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_e20cb01482774429b6136ac17d2039d7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 도움말 홈 Popular Articles 첫 칸이 연녹색으로 강조된다.
- 입력 항목·필수 표시·기본값: 검색은 비어 있다.
- 버튼·메뉴·안내 문구: What is the Client Portal and how can I use it? 링크.
- 확인된 상태: hover 또는 focus 상태로 보이며 원인은 미확인.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 선택 대상 문서를 시각적으로 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 마우스·키보드 중 입력 방식 미확인.

#### 모델링 영향

- 후보와 근거: 도움말 링크 상호작용 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 포털 도움말 상단

- Screen ID: `sc_e20cb01482774429b6136ac17d2039d7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e20cb01482774429b6136ac17d2039d7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/64e56ce4-3edc-4ff2-aea8-2a1bfb6e8791.png)
- 로컬 이미지: [02_sc_e20cb01482774429b6136ac17d2039d7.png](<screens/02_sc_e20cb01482774429b6136ac17d2039d7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2230bb5f099d482fb1f0ba9741d4b7e8` → 현재 → `sc_2c564244ef024e9cb6b56810d545b154`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 검색·빵부스러기, 좌측 기사·부제·업데이트 상대 날짜, 오른쪽 목차. 본문 YouTube 영상.
- 입력 항목·필수 표시·기본값: 검색 입력만 있고 문서 본문은 읽기 전용.
- 버튼·메뉴·안내 문구: 목차 8개 항목, 영상 재생·공유·YouTube 보기.
- 확인된 상태: General Questions & Overview > Business Plan Features에 속한 당시 문서.
- 단계 간 변화: 포털 도움말 상세로 이동

#### 동작과 데이터

- 화면 관찰: 포털 소개 도움말을 읽으며 실제 포털을 설정한 것은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 영상 재생 내용과 상대 업데이트 날짜의 실제 기준일 미확인.

#### 모델링 영향

- 후보와 근거: 기사·컬렉션 경로·목차·삽입 영상 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 포털 브랜딩 설명 위치

- Screen ID: `sc_2c564244ef024e9cb6b56810d545b154`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2c564244ef024e9cb6b56810d545b154?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5652626e-c365-4cc1-90d9-164dbf185c9a.png)
- 로컬 이미지: [03_sc_2c564244ef024e9cb6b56810d545b154.png](<screens/03_sc_2c564244ef024e9cb6b56810d545b154.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e20cb01482774429b6136ac17d2039d7` → 현재 → `sc_e244e36695a94b13b56282b9633d1d00`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 브랜딩 지침·설정 스크린샷, 오른쪽 목차 해당 항목 활성.
- 입력 항목·필수 표시·기본값: 실제 입력 없음; 삽입 이미지에 Portal Access·Custom Header·Bonsai Branding.
- 버튼·메뉴·안내 문구: Branding settings 링크, 목차·다음 미리보기 질문.
- 확인된 상태: 화이트라벨·회사 로고 저장·포털 배경 설정을 설명한다.
- 단계 간 변화: 브랜딩 위치로 스크롤/목차 이동; 동작 원인 미수록

#### 동작과 데이터

- 화면 관찰: 이는 당시 도움말에서 관찰한 설명이며 우리 계정 설정 결과가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재 포털 설정의 명칭·플랜·클라이언트별 노출 차이 미확인.

#### 모델링 영향

- 후보와 근거: 브랜딩·포털 설정 관계 후보; 삽입 이미지를 현재 앱 API 계약으로 취급하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 문서 하단 질문·연관 문서·평가

- Screen ID: `sc_e244e36695a94b13b56282b9633d1d00`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e244e36695a94b13b56282b9633d1d00?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7f22d0da-40fc-41de-95fd-df0b0956a0aa.png)
- 로컬 이미지: [04_sc_e244e36695a94b13b56282b9633d1d00.png](<screens/04_sc_e244e36695a94b13b56282b9633d1d00.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2c564244ef024e9cb6b56810d545b154` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 마지막 질문 두 개, Related Articles 5행 카드, 맨 아래 3개 이모지 평가. 오른쪽 목차 마지막 항목 활성.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 고객 정보 편집·파일 발송·고객 계정 필요·파일 업로드·외부 링크 관련 문서와 부정/중립/긍정 평가.
- 확인된 상태: 이메일 보안 링크 접근과 회사에 여러 연락처가 있을 때 각 연락처 접근 가능성을 설명.
- 단계 간 변화: 마지막 질문·관련 문서·평가 영역으로 이동

#### 동작과 데이터

- 화면 관찰: 평가 선택이나 문서 이동 결과는 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 토큰·권한 범위·피드백 저장 방식 미확인.

#### 모델링 영향

- 후보와 근거: 문서 관련성·사용자 평가 후보, 고객 담당자별 접근 관계 검증 필요.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 당시 문서는 이메일 보안 링크로 고객 포털에 로그인하고 고객의 여러 연락처도 접근할 수 있다고 설명한다.
- 이 설명만으로 모든 프로젝트·문서가 모든 연락처에 공개된다고 확대하지 않는다.
- 브랜딩 설정은 문서 내 안내이며 저장 결과를 재현하지 않았다.
- 도움말 업데이트 상대 시각을 캡처일로 환산하지 않는다.

## 6. 공식 도움말과 API 대조

- [Client Portal 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal)
- [회사 로고·문서 헤더](https://help.hellobonsai.com/en/articles/1977524-how-to-update-your-company-logo-and-header-on-your-documents): 회사 로고/문서 표시와 크기·헤더 설정을 설명한다. 캡처는 온보딩의 간단한 업로드이며 전체 Branding 설정과 다르다.
- [회사·연락처 도움말](https://help.hellobonsai.com/en/articles/452120-how-to-create-and-manage-companies-and-contacts): 현행 회사는 이름만 필수이며 회사·연락처를 독립적으로 생성하고 다중 회사 연결과 기본 연락처를 지원한다. 이 캡처의 담당자명·이메일 필수 폼과 버전 차이가 있다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 기사·목차·관련 문서·피드백 후보.
- 업무 측면에서는 회사-여러 담당자-포털 접근 관계 후보가 있지만 토큰 수명·공유범위·취소 정책은 별도 확인한다.

## 8. 미확인 사항과 검토 질문

- 영상·미수록 중간 본문·피드백 클릭 후 상태를 확인한다.
- 현재 포털 접근 권한과 이메일 링크 유효기간을 공식 문서·실계정으로 검증한다.
- Help Center 컬렉션 재분류와 과거 Business Plan Features의 현재 플랜 적용 차이를 기록한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

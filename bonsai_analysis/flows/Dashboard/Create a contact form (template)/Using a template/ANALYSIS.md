# Using a template 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `0888ad18-25b5-43aa-be17-ae21f1859ea0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=0888ad18-25b5-43aa-be17-ae21f1859ea0) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

Graphic Design Brief 템플릿을 미리 보고 편집 가능한 폼으로 생성한다.

- Design분류결과에서시작해Forms/Create편집기로끝난다.
- 폼수신자·프로젝트 선택은 이 생성 흐름에 없고 공유 단계에서 별도로 등장한다.

- 상위 분석: [Create a contact form (template)](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Create a contact form (template)/Using a template`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_5c0dd427af8c4322a5b020f642a73774`](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Design 템플릿 결과](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>) | GraphicDesignBrief카드를가리킨다. |
| 02 | [`sc_559f0944133b4c8fb66738d23390e845`](https://gummble.com/screens/sc_559f0944133b4c8fb66738d23390e845?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 카드 hover](<screens/02_sc_559f0944133b4c8fb66738d23390e845.png>) | Preview로미리보기를연다. |
| 03 | [`sc_6a141ad793ab4918935cec01018afe3b`](https://gummble.com/screens/sc_6a141ad793ab4918935cec01018afe3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Graphic Design Brief 미리보기](<screens/03_sc_6a141ad793ab4918935cec01018afe3b.png>) | UseTemplate을실행한다. |
| 04 | [`sc_f5e4119741464cbc8bbac0dd3b4f0d55`](https://gummble.com/screens/sc_f5e4119741464cbc8bbac0dd3b4f0d55?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 적용 처리](<screens/04_sc_f5e4119741464cbc8bbac0dd3b4f0d55.png>) | 처리 후 폼 편집기로 이동한다. |
| 05 | [`sc_56bf12a78bd64f6b972ecb048efd8d14`](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [폼 편집기 상단](<screens/05_sc_56bf12a78bd64f6b972ecb048efd8d14.png>) | 질문편집/공유/응답흐름으로이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — Design 템플릿 결과

- Screen ID: `sc_5c0dd427af8c4322a5b020f642a73774`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5c0dd427af8c4322a5b020f642a73774?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/33a6a088-5838-46fa-91f9-f0d01f316148.png)
- 로컬 이미지: [01_sc_5c0dd427af8c4322a5b020f642a73774.png](<screens/01_sc_5c0dd427af8c4322a5b020f642a73774.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_559f0944133b4c8fb66738d23390e845`

#### 화면에서 직접 확인한 내용

- 레이아웃: Industry Design10선택,3열결과.
- 입력 항목·필수 표시·기본값: BlankForm+CreativeIntakeForm,DesignClientQuestionnaire,GraphicDesignBrief,GraphicDesignClientQuestionnaire,GraphicDesignintakeform,InteriorDesignClientQuestionnaire,LogoDesignBrief,LogoQuestionnaire,WebDesignClientQuestionnaire,WebsiteDesignForm.
- 버튼·메뉴·안내 문구: UseTemplate,검색,다른분류,닫기.
- 확인된 상태: 10개실제템플릿과BlankForm으로좁혀진다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 필터적용 결과확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 템플릿 필드 구성과 버전은 선택미리보기전미확인.

#### 모델링 영향

- 후보와 근거: 템플릿-산업분류 관계후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 템플릿 카드 hover

- Screen ID: `sc_559f0944133b4c8fb66738d23390e845`
- 원본: [화면 페이지](https://gummble.com/screens/sc_559f0944133b4c8fb66738d23390e845?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6e981849-8c8c-4d1f-8ac9-c2e7f615d7a6.png)
- 로컬 이미지: [02_sc_559f0944133b4c8fb66738d23390e845.png](<screens/02_sc_559f0944133b4c8fb66738d23390e845.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5c0dd427af8c4322a5b020f642a73774` → 현재 → `sc_6a141ad793ab4918935cec01018afe3b`

#### 화면에서 직접 확인한 내용

- 레이아웃: GraphicDesignBrief카드에그림자·Preview링크.
- 입력 항목·필수 표시·기본값: Design10결과유지.
- 버튼·메뉴·안내 문구: Preview,UseTemplate,검색/분류.
- 확인된 상태: 미리보기 진입 제어가 카드 위에 나타난다.
- 단계 간 변화: GraphicDesignBrief카드를가리킨다.

#### 동작과 데이터

- 화면 관찰: 선택전탐색상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭영역/키보드접근미확인.

#### 모델링 영향

- 후보와 근거: 카드hover와생성명령구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Graphic Design Brief 미리보기

- Screen ID: `sc_6a141ad793ab4918935cec01018afe3b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6a141ad793ab4918935cec01018afe3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/275e0161-2786-4eb8-991f-d6466f13cdf2.png)
- 로컬 이미지: [03_sc_6a141ad793ab4918935cec01018afe3b.png](<screens/03_sc_6a141ad793ab4918935cec01018afe3b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_559f0944133b4c8fb66738d23390e845` → 현재 → `sc_f5e4119741464cbc8bbac0dd3b4f0d55`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체미리보기.상단AllTemplates/Previewing/UseTemplate/X,중앙브랜드배경+폼.
- 입력 항목·필수 표시·기본값: 제목/설명,FirstName/LastName/Email회색예시,웹사이트질문*/사업명질문*;하단제작물질문*일부.
- 버튼·메뉴·안내 문구: AllTemplates,UseTemplate,X,스크롤.
- 확인된 상태: 이름·이메일에는 이 뷰포트상 별표 없고 업무 질문에는 있다.
- 단계 간 변화: Preview로미리보기를연다.

#### 동작과 데이터

- 화면 관찰: 템플릿의 공개 표현 미리보기.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체질문·답변제출/편집가능여부는미확인.

#### 모델링 영향

- 후보와 근거: 템플릿질문필수설정·미리보기 렌더링 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 템플릿 적용 처리

- Screen ID: `sc_f5e4119741464cbc8bbac0dd3b4f0d55`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f5e4119741464cbc8bbac0dd3b4f0d55?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0eb2f6bc-f947-40f6-be01-458ad59b122c.png)
- 로컬 이미지: [04_sc_f5e4119741464cbc8bbac0dd3b4f0d55.png](<screens/04_sc_f5e4119741464cbc8bbac0dd3b4f0d55.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6a141ad793ab4918935cec01018afe3b` → 현재 → `sc_56bf12a78bd64f6b972ecb048efd8d14`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은미리보기,UseTemplate버튼옅어짐·상단초록진행선.
- 입력 항목·필수 표시·기본값: 폼내용유지.
- 버튼·메뉴·안내 문구: 비활성/처리중으로보이는UseTemplate,AllTemplates,X.
- 확인된 상태: 생성처리중간상태.
- 단계 간 변화: UseTemplate을실행한다.

#### 동작과 데이터

- 화면 관찰: 다음 편집기 화면이 적용 결과 근거다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한네트워크/실패/중복방지미확인.

#### 모델링 영향

- 후보와 근거: 생성 중 상태와 중복 실행 방지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 폼 편집기 상단

- Screen ID: `sc_56bf12a78bd64f6b972ecb048efd8d14`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56bf12a78bd64f6b972ecb048efd8d14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cffd3242-bc9f-4d5b-89c4-617f504f36b3.png)
- 로컬 이미지: [05_sc_56bf12a78bd64f6b972ecb048efd8d14.png](<screens/05_sc_56bf12a78bd64f6b972ecb048efd8d14.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f5e4119741464cbc8bbac0dd3b4f0d55` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Forms/Create/Responses 및 작업 버튼. 왼쪽 배경 헤더+흰 폼 카드, 오른쪽 Content/Settings 패널.
- 입력 항목·필수 표시·기본값: Graphic Design Brief 제목/설명, Add An Image; First Name/Last Name(회색 Jane/Smith), Email(예시 이메일), 사업 웹사이트 URL 질문.
- 버튼·메뉴·안내 문구: Preview, Automation, Share Form, …; Content 타입: Short/Long Text, Number, Single/Multiple Choice, Date Select, Custom Content, Files Download/Upload, Dropdown, Star Rating, Website.
- 확인된 상태: Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인.
- 단계 간 변화: 처리 후 폼 편집기로 이동한다.

#### 동작과 데이터

- 화면 관찰: 폼 정의 편집 화면이며 응답은 아직 입력되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 화면 아래 타입·Settings 내용·제목 편집 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 연락처 영역·일반 질문·콘텐츠 요소·브랜드 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰]카드의Preview와UseTemplate은다른행동이다.
- [관찰]미리보기에는웹사이트/사업명 질문 별표가 있지만 생성 편집기에는 동일 표시가 없다.후속 공개 응답 폼에서도 일부 별표가 없어 미수록 필수 설정 변경 가능성을 남긴다.
- [관찰]UseTemplate처리 중 버튼이 옅어지고 상단 진행선이 보인다.
- [미확인]폼ID생성시점·저장완료·공개 게시 기본값은 정적 이미지만으로 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 폼에서질문편집/필수설정이가능하다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 템플릿 정의와 복사된 폼 정의·질문/스타일스냅샷·생성원천참조 후보.

## 8. 미확인 사항과 검토 질문

- 템플릿 필수값과 생성 후 질문 설정의 차이·템플릿업데이트전파·중복생성을확인한다.
- 미리보기입력/Submit이실제응답을만드는지,생성취소/오류재시도를확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |

# Bonsai 공식 자료 대조

조회일: **2026-11-20 KST**. Gummble 정적 캡처와 현재 공식 자료를 구분하기 위한 공통 출처 기록이다.

93개 URL을 조회했다. 92개는 반환된 본문 범위에서 대조했고, Perks 1개는 본문 접근에 실패하여 현재 혜택을 확인하지 못했다. 문서 전체·첨부 영상·실제 API 요청을 모두 검증했다는 뜻은 아니다.

캡처의 과거 가격·명칭·화면 문구를 현재 정책으로 바꾸지 않는다. 아래는 조회된 자료의 제한된 요약이며 OneHandSales의 확정 도메인 정책이나 DB 스키마가 아니다.

## API 대조의 범위

<a id="api"></a>

공개 REST API 문서의 리소스와 동작 목록을 대조했다. 인증된 API 호출, 내부 endpoint, 요청·응답 캡처, DB 스키마·권한·트랜잭션은 확인하지 않았다. 목록에서 확인하지 못한 기능을 제품에 없는 기능으로 단정하지 않는다.

## 시점·문서 간 차이

- 구독·역할·Companies/Contacts·Home·문서 편집기의 현재 구성을 과거 캡처에 소급 적용하지 않는다.
- 취소 도움말의 24시간 환불 가능성 언급과 환불 전용 문서의 14일 창구는 표현 범위가 다르다. 적용 조건을 임의로 하나로 합치지 않는다.
- Limited 도움말의 읽기 전용 요약과 구체적인 프로젝트·작업·회계 허용 목록을 함께 읽는다.

## 자료별 확인 기록

<a id="s001"></a>

### S001 — Bonsai 공식 홈페이지

- 원본: [Bonsai 공식 홈페이지](https://www.hellobonsai.com/)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공식 홈페이지는 고객·프로젝트·재무를 통합한 서비스 사업 관리 제품으로 설명한다. 공개 홍보 화면을 계정의 실제 업무 데이터나 실행 결과로 보지 않는다.

<a id="s002"></a>

### S002 — 공식 지원

- 원본: [공식 지원](https://www.hellobonsai.com/support)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공식 지원 경로는 도움말·이메일·앱 우하단 채팅이다. 캡처의 개별 버튼이 어느 경로로 연결되는지는 실제 목적지를 별도 확인해야 한다.

<a id="s003"></a>

### S003 — 공개 API

- 원본: [공개 API](https://docs.hellobonsai.com/api)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 REST API는 계정·사용자 권한 범위로 인증하며 JSON 요청·응답과 리소스별 계약을 제공한다. 목록·인증 안내는 내부 DB 구조나 캡처의 실제 네트워크 호출 증거가 아니다.

<a id="s004"></a>

### S004 — 사용자 권한

- 원본: [사용자 권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 Owner·Partner·Project Manager·Collaborator 역할과 업무·재무 접근 범위를 구분한다. 과거 캡처의 메뉴 노출을 현재 역할별 모든 권한으로 일반화하지 않는다.

<a id="s005"></a>

### S005 — 2FA 관리

- 원본: [2FA 관리](https://help.hellobonsai.com/en/articles/7935122-managing-two-factor-authentication-2fa-on-your-account)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 모든 계정에 2FA가 필요하고 끌 수 없으며 설정에서 이메일/SMS 방식을 관리한다고 설명한다. 과거 로그인 캡처에 코드 입력이 없다는 사실과 구분한다.

<a id="s006"></a>

### S006 — 회사·연락처 도움말

- 원본: [회사·연락처 도움말](https://help.hellobonsai.com/en/articles/452120-how-to-create-and-manage-companies-and-contacts)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 회사와 연락처는 독립 생성할 수 있고 회사 생성의 필수 항목은 회사명이다. 연락처는 하나 이상의 회사에 연결할 수 있다. 과거 New Client의 연락처명·이메일 필수 표시는 별도 캡처 규칙이다.

<a id="s007"></a>

### S007 — 명칭 변경 안내

- 원본: [명칭 변경 안내](https://help.hellobonsai.com/en/articles/15166148-clients-is-now-companies-what-s-changing-in-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Clients는 Companies로 명칭이 바뀌었고 기존 데이터·관계·권한은 유지된다는 안내다. Client Portal 명칭은 유지된다.

<a id="s008"></a>

### S008 — Companies API

- 원본: [Companies API](https://docs.hellobonsai.com/api/tag/companies)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: Companies 목록·생성·단건 조회·수정·활동 조회가 공개돼 있다. 이 그룹 목록에서 삭제 동작이나 화면별 내부 저장 트랜잭션을 확정하지 않는다.

<a id="s009"></a>

### S009 — Contacts API

- 원본: [Contacts API](https://docs.hellobonsai.com/api/tag/contacts)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: Contacts 공개 API는 회사에 연결하지 않은 연락처와 여러 회사에 연결된 연락처를 모두 설명한다. 활동·목록·생성·단건 조회·수정이 보이며 회사와 연락처를 일대일로 고정할 근거가 아니다.

<a id="s010"></a>

### S010 — 공식 Affiliate 소개

- 원본: [공식 Affiliate 소개](https://www.hellobonsai.com/affiliates)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 제휴 안내는 첫 월 결제의 200%와 연간 플랜의 30%, 60일 귀속 기간을 설명한다. 캡처의 고정 보상 표와 다르며 현재 약관·승인·정산 실적은 별도 확인 대상이다.

<a id="s011"></a>

### S011 — 공식 Blog

- 원본: [공식 Blog](https://www.hellobonsai.com/blog)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 블로그는 최신 글·분류와 검색 입력을 제공한다. 글 구성과 날짜가 캡처와 달라 현재 결과를 과거 검색 결과로 대체하지 않는다.

<a id="s012"></a>

### S012 — 공식 해당 기사

- 원본: [공식 해당 기사](https://www.hellobonsai.com/blog/how-to-start-a-digital-marketing-agency)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 동일 기사 URL의 현재 저자·날짜는 Brian Hughes·2026-01-08로 보인다. 캡처의 CJ Haughey·2022-12-11과 구분하고 기사 메타데이터를 캡처일로 사용하지 않는다.

<a id="s013"></a>

### S013 — 비용 분류 관리

- 원본: [비용 분류 관리](https://help.hellobonsai.com/en/articles/3184359-how-to-add-expense-categories)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 비용 분류는 이름과 선택적인 색상으로 생성한다. 현재 도움말은 잠긴 기본 분류의 수정·삭제 불가와 사용자 분류의 편집·삭제를 구분하고 개인 비용의 장부·보고서 포함 설정을 설명한다.

<a id="s014"></a>

### S014 — 비용과 청구서 연결 도움말

- 원본: [비용과 청구서 연결 도움말](https://help.hellobonsai.com/en/articles/1262317-how-to-add-expenses-to-an-invoice)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 프로젝트의 청구 가능한 미청구 비용을 청구서에 추가할 수 있다. 청구서에서 항목을 제거해도 원래 비용은 미청구 상태로 남는다고 설명한다. 비용 폼 작성만으로 청구서 생성이나 청구 완료를 확정하지 않는다.

<a id="s015"></a>

### S015 — 비용 금액의 의미

- 원본: [비용 금액의 의미](https://help.hellobonsai.com/en/articles/13159534-understanding-expense-amounts-after-tax-pre-tax-and-sales-price)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 실제 지출액·세전 원가·청구 판매가를 구분하며 목록·손익·프로젝트 예산마다 사용하는 금액이 다르다고 설명한다. 구형 캡처에 없는 세금·마크업을 임의로 역산하지 않는다.

<a id="s016"></a>

### S016 — 은행 연결로 비용 가져오기

- 원본: [은행 연결로 비용 가져오기](https://help.hellobonsai.com/en/articles/1865131-how-to-connect-a-payment-method-to-import-expenses)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: Plaid를 통한 은행/카드 비용 가져오기는 미국·캐나다 주요 금융기관을 설명한다. 연결을 제거해도 이미 가져온 비용은 남는다. 연결 시작 화면을 동기화 성공으로 기록하지 않는다.

<a id="s017"></a>

### S017 — 비용 일괄 편집

- 원본: [비용 일괄 편집](https://help.hellobonsai.com/en/articles/1865151-how-to-bulk-edit-your-expenses)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 일괄 선택 후 분류 변경·삭제를 안내한다. 이미 청구된 비용은 수정·삭제할 수 없으며 관련 청구서 제거 조건을 설명한다. 실제 부분 실패·권한 응답은 확인하지 않았다.

<a id="s018"></a>

### S018 — 연결 문제 도움말

- 원본: [연결 문제 도움말](https://help.hellobonsai.com/en/articles/2164600-issues-connecting-your-bank-account-to-sync-expenses)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 은행 연결 실패의 예로 잘못된 자격증명, MFA 변경, Plaid 미지원 은행을 든다. Plaid의 지원 지역 안내와 Bonsai 자체 연결 지원 지역은 같다고 단정하지 않는다. CSV 대체 가져오기를 안내한다.

<a id="s019"></a>

### S019 — 공식 Careers

- 원본: [공식 Careers](https://www.hellobonsai.com/careers)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 채용 페이지에도 복리후생·Focus/Speed/Ownership이 있으며 채용 CTA는 Workable로 연결된다. 개별 채용공고·지원 접수는 확인하지 않았다.

<a id="s020"></a>

### S020 — Custom fields

- 원본: [Custom fields](https://help.hellobonsai.com/en/articles/12078877-custom-fields)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Custom Fields는 회사 설정에서 관리하며 프로젝트·작업·고객·연락처·거래에 적용된다. 고객 필드는 텍스트만 지원한다. 캡처의 Clients Settings와 진입 위치가 다르다.

<a id="s021"></a>

### S021 — All about Projects

- 원본: [All about Projects](https://help.hellobonsai.com/en/articles/12783206-all-about-projects)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 프로젝트 개요는 작업·시간·청구·비용·문서·활동을 연결한다. 전달 이메일의 활동 표시와 고객 알림을 구분하고, 노트는 여러 레코드와 연결할 수 있다고 설명한다. 과거 Your Notes 동작과 동일하다고 보지 않는다.

<a id="s022"></a>

### S022 — Project settings

- 원본: [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 프로젝트 설정은 Details/Billing/Budget/Task Lists로 구성되고 제목·일자 자동 저장을 설명한다. 청구 유형은 시간·재료, 고정금액, 리테이너, 청구 제외로 구분한다. 과거 캡처의 설정 구성에 소급하지 않는다.

<a id="s023"></a>

### S023 — Projects API

- 원본: [Projects API](https://docs.hellobonsai.com/api/tag/projects)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 API Projects 그룹은 프로젝트 목록·생성·수정과 예산 생성·수정·제거를 노출한다. 작업·시간·청구서의 연결 단위라는 설명을 확인했으며 내부 DB·화면 요청은 확인하지 않았다.

<a id="s024"></a>

### S024 — Client Portal 도움말

- 원본: [Client Portal 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 포털 설정은 Owner·Partner 및 사용자 지정 권한을 설명하고, 보안 이메일 링크로 고객이 접근한다고 안내한다. 이미지 제한은 4MB·폭 2000px·JPG/PNG이다. 관리자 Enabled 화면만으로 고객 로그인·권한 결과를 검증할 수 없다.

<a id="s025"></a>

### S025 — 공식 지원 연락 도움말

- 원본: [공식 지원 연락 도움말](https://help.hellobonsai.com/en/articles/1517206-how-to-get-in-touch-with-the-bonsai-team)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 유료 구독자는 앱 채팅 또는 지원 이메일, 비구독자는 지원 이메일을 안내한다. 기능 제안 폼과 제휴 문의는 별도 경로다. 실제 응답 시간·접수 결과는 확인하지 않았다.

<a id="s026"></a>

### S026 — 추천 프로그램

- 원본: [추천 프로그램](https://help.hellobonsai.com/en/articles/2876308-bonsai-s-referral-program)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 추천 링크 가입·체험·유료 전환을 보상 조건으로 설명한다. 추천자 보상은 유료 전환 후, 피추천자는 즉시 무료 월을 받으며 월간·연간 구독의 반영 시점이 다르다. 화면의 복사 성공은 보상 발생 증거가 아니다.

<a id="s027"></a>

### S027 — 표준·사용자 정의 계약

- 원본: [표준·사용자 정의 계약](https://help.hellobonsai.com/en/articles/918802-creating-completely-custom-contracts)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 2026-07-27 이후 생성 계정은 통합 Document builder를 쓴다는 안내가 있다. 기존 General은 Basic Info·Scope·Payment와 제한된 편집, Blank는 자유 편집을 설명한다. 양측 서명 과정과 단순 문서 생성을 구분한다.

<a id="s028"></a>

### S028 — 계약 선결제 설정

- 원본: [계약 선결제 설정](https://help.hellobonsai.com/en/articles/6683807-how-to-set-an-upfront-payment-deposit-on-contracts)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 동일한 새 계정 Document builder 전환 안내가 있다. 기존 계약 선금 기능은 Bonsai Payments를 사용하며 고객 서명 뒤 연결 청구서가 Outstanding으로 생성될 수 있다. 서명 완료와 선금 결제 완료는 별개다.

<a id="s029"></a>

### S029 — Documents API

- 원본: [Documents API](https://docs.hellobonsai.com/api/tag/documents)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Documents API의 생성 문서는 초안이며 Bonsai에서 검토·전송한다고 명시한다. 목록·생성·상세·가격표 설정 API가 노출되지만 과거 계약 화면의 내부 요청과 동일하다고 확인하지 않았다.

<a id="s030"></a>

### S030 — 발송 후 계약 수정

- 원본: [발송 후 계약 수정](https://help.hellobonsai.com/en/articles/7935115-editing-a-contract-after-it-has-been-sent)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 기존 계약의 Unsign & Edit는 상대방 서명 전에만 가능하고 기존 링크 무효화를 안내한다. 수신자 이메일 변경은 고객 프로필 이메일을 바꾸지 않는다. 새 계정은 통합 Document builder 안내가 적용된다.

<a id="s031"></a>

### S031 — 제안서 도움말

- 원본: [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 기존 제안서의 Single Option·Packages·Multi-Select 요금표, 이메일·URL 전달, 수락 후 청구서 생성 옵션을 설명한다. 2026-07-27 이후 계정은 통합 Document builder로 분기된다고 명시한다.

<a id="s032"></a>

### S032 — Templates API

- 원본: [Templates API](https://docs.hellobonsai.com/api/tag/templates)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Templates API는 계정 저장 템플릿과 Bonsai 문서 라이브러리, 카테고리·템플릿 목록 조회를 다룬다. 작업 템플릿의 내부 API와 같은 자원이라고 확정하지 않는다.

<a id="s033"></a>

### S033 — 문서 삭제·보관 도움말

- 원본: [문서 삭제·보관 도움말](https://help.hellobonsai.com/en/articles/1638417-exploring-if-a-deleted-document-can-be-recovered)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 문서 삭제는 복구 불가이며 보관은 접근 가능한 상태로 유지한다고 설명한다. 계약·제안서 보관과 청구서·폼의 보관 미지원, 청구서 삭제 시 시간 삭제 또는 미청구 복귀 선택을 구분한다. 서버 삭제를 실행하지 않았다.

<a id="s034"></a>

### S034 — 배경·테마 도움말

- 원본: [배경·테마 도움말](https://help.hellobonsai.com/en/articles/2880183-adding-your-background-to-proposals-and-invoices)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 기존 문서의 배경 업로드와 8개 테마, JPG/JPEG/PNG·10MB 제한을 안내한다. 발송된 문서의 배경은 수정 불가라는 설명과 신규 계정 Document builder 분기를 기록한다. 캡처 자체로 파일 제한을 검증한 것은 아니다.

<a id="s035"></a>

### S035 — 제안서 수락 후 청구서 생성

- 원본: [제안서 수락 후 청구서 생성](https://help.hellobonsai.com/en/articles/2157748-automating-invoices-when-your-proposals-are-accepted)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 기존 제안서 수락 시 선택된 패키지를 하나의 청구서 항목으로 자동 생성하는 옵션을 설명한다. 생성과 이메일 발송·결제는 별도다. 신규 계정 Document builder 분기가 있다.

<a id="s036"></a>

### S036 — 수동 수락 도움말

- 원본: [수동 수락 도움말](https://help.hellobonsai.com/en/articles/7935094-marking-a-proposal-as-accepted-for-a-client)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 수동 Mark Accepted는 되돌리거나 이후 편집할 수 없고 고객 알림 메일을 보내지 않는다고 설명한다. 선금 설정은 무시되어 결제·수입 기록이 생성되지 않는다. 신규 계정 Document builder 분기가 있다.

<a id="s037"></a>

### S037 — URL공유 도움말

- 원본: [URL공유 도움말](https://help.hellobonsai.com/en/articles/2704495-sending-proposals-via-url)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: Send via URL은 사용자가 링크를 직접 전달해야 하며 접근자는 조회·수락할 수 있다고 설명한다. 링크는 발급 후 30일 만료로 안내된다. 제안서 자체 만료일과 구분하며 신규 계정 Document builder 분기가 있다.

<a id="s038"></a>

### S038 — 제안서 만료 도움말

- 원본: [제안서 만료 도움말](https://help.hellobonsai.com/en/articles/5258968-how-to-set-up-an-expiry-valid-till-date-on-proposals)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 제안서 만료일 이후 Expired 상태로 전환되고 고객 수락·거절이 막혀 재발송이 필요하다고 안내한다. 실제 만료 시각·시간대는 해당 캡처로 확인되지 않았다. 신규 계정 Document builder 분기가 있다.

<a id="s039"></a>

### S039 — 회사·개인 정보 변경

- 원본: [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 개인·회사 정보의 별도 설정, 이메일 변경 시 새 주소 인증, 회사 통화·시간대·문서 기본정보를 설명한다. 기존 문서에는 변경이 소급되지 않는다고 명시한다. 캡처의 갱신 토스트와 실제 인증 완료는 구분한다.

<a id="s040"></a>

### S040 — 회사 로고·문서 헤더

- 원본: [회사 로고·문서 헤더](https://help.hellobonsai.com/en/articles/1977524-how-to-update-your-company-logo-and-header-on-your-documents)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 회사 Branding에서 로고·크기·청구서 헤더를 변경하고 저장한다고 안내한다. 청구서 헤더 변경은 계약·제안서 헤더에 적용되지 않는다고 명시한다.

<a id="s041"></a>

### S041 — 수입·결제 범주

- 원본: [수입·결제 범주](https://help.hellobonsai.com/en/articles/1202116-understanding-payment-categories-outstanding-overdue-pending-and-paid)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Outstanding은 발송 후 기한 내 미지급, Overdue는 기한 경과 미지급, Pending은 결제 처리 중 미입금으로 구분한다. 과거 대시보드의 Paid & Pending 합산과 개별 결제 완료를 구분한다.

<a id="s042"></a>

### S042 — 현재 홈 대시보드 도움말

- 원본: [현재 홈 대시보드 도움말](https://help.hellobonsai.com/en/articles/16785043-customize-your-home-dashboard)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Home은 권한별 지표·시간·작업·활동을 제공하며 Manage에서 섹션 표시·순서를 개인별 저장한다고 설명한다. 과거 Dashboard의 온보딩·타임라인 구성과 현재 화면을 동일시하지 않는다.

<a id="s043"></a>

### S043 — 시간 청구 상태

- 원본: [시간 청구 상태](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 청구 가능 시간만 청구서에 넣을 수 있으며 Unbilled에는 초안 청구서의 시간도 포함된다. Billed는 결제 여부와 별개다. 캡처의 Drafted 생성으로 결제·입금 완료를 추론하지 않는다.

<a id="s044"></a>

### S044 — 예약·캘린더 공식 도움말

- 원본: [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Google·Apple·Office365·Exchange·Outlook.com 연결, 이벤트명·유형·길이·가용성·시간대·버퍼·예약 질문을 설명한다. 연결 성공과 실제 예약·일정 동기화는 별도 확인 대상이다.

<a id="s045"></a>

### S045 — 폼·질문·공유·응답 도움말

- 원본: [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 폼은 짧은/긴 텍스트·선택·파일·설명, 필수 여부·정렬·삭제와 링크/임베드/직접 전송을 지원한다고 안내한다. 캡처의 특정 질문·선택지로 전체 지원 범위를 확정하지 않는다.

<a id="s046"></a>

### S046 — Tasks API

- 원본: [Tasks API](https://docs.hellobonsai.com/api/tag/tasks)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: Tasks 공개 API는 프로젝트·부모 작업 연결이 선택적인 작업 단위로 설명하며 하위 목록·목록·생성·상세·삭제·수정을 노출한다. UI 단계에서 프로젝트가 보인다고 모든 작업에 필수인 스키마로 확정하지 않는다.

<a id="s047"></a>

### S047 — 공식 공개 템플릿 목록

- 원본: [공식 공개 템플릿 목록](https://www.hellobonsai.com/templates)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 공개 템플릿 목록에 계약·합의서 등 유형과 앱으로 연결되는 Get template 경로가 있다. 검색 결과 HTML에 포함된 성공/오류 문구는 실제 제출 결과가 아니다. 과거 카드 개수와 현재 카탈로그는 다를 수 있다.

<a id="s048"></a>

### S048 — 공식 eCommerce 견적 템플릿

- 원본: [공식 eCommerce 견적 템플릿](https://www.hellobonsai.com/quote-template/ecommerce-website)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 eCommerce Website Quotation 템플릿 페이지는 서비스·가격·고객·결제 조건 편집과 앱 연결 CTA를 안내한다. 예시 문서·홍보 집계는 실제 사용자 프로젝트나 생성 성공 증거가 아니다.

<a id="s049"></a>

### S049 — 공식 Small businesses 소개

- 원본: [공식 Small businesses 소개](https://www.hellobonsai.com/software/small-businesses)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 소규모 사업 소개는 청구서·계약·시간 추적·협업·CRM·재무와 무료 시작 CTA를 설명한다. 공개 소개의 기능 목록이며 특정 계정의 기능 활성화·권한을 증명하지 않는다.

<a id="s050"></a>

### S050 — Freelancing 소개

- 원본: [Freelancing 소개](https://www.hellobonsai.com/software/freelancing)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 프리랜서 소개는 시간 추적·제안·계약·청구·CRM·포털·폼·회계·프로젝트를 안내한다. 과거 캡처의 메뉴·홍보 수치를 현재 제품 규칙으로 확정하지 않는다.

<a id="s051"></a>

### S051 — 공식 도움말 홈

- 원본: [공식 도움말 홈](https://help.hellobonsai.com/en/)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말 홈에는 검색·인기 문서와 CRM·Productivity·Finance·Reports·Automations 등의 분류가 있다. 목록과 문서 수는 조회 시점 값이며 검색 동작·계정 권한은 별도 검증 대상이다.

<a id="s052"></a>

### S052 — 공식 Consulting 소개

- 원본: [공식 Consulting 소개](https://www.hellobonsai.com/software/consulting)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 컨설팅 소개는 CRM·Agreements·Estimates·Resourcing·Tasks·Time tracking·Reports·Invoices·Client portal을 제시한다. 공개 홍보 설명과 과거 앱 캡처의 기능 범위를 구분한다.

<a id="s053"></a>

### S053 — 공식 Invoice template

- 원본: [공식 Invoice template](https://www.hellobonsai.com/invoice-template)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 청구서 템플릿 페이지는 Word·PDF·Excel·Google Docs·Google Sheets와 앱 생성 경로를 제공한다. 링크 존재를 실제 파일 다운로드·문서 생성 결과로 보지 않는다.

<a id="s054"></a>

### S054 — Invoices API

- 원본: [Invoices API](https://docs.hellobonsai.com/api/tag/invoices)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Invoices API 분류에는 청구서 목록·생성·수정·삭제/취소, 청구 항목 추가·수정·삭제와 반복 중지 작업이 명시된다. 분류 목록을 확인했으며 실제 호출·필드별 계약·내부 DB는 검증하지 않았다.

<a id="s055"></a>

### S055 — 청구 시간 반올림

- 원본: [청구 시간 반올림](https://help.hellobonsai.com/en/articles/7050494-rounding-time-tracking-entries-on-invoices)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 청구 시 Nearest Minute·15 Minutes·30 Minutes·Hour 반올림을 선택하며 원래 Timesheet 추적 시간은 바뀌지 않는다고 설명한다. 캡처의 소수 수량과 금액으로 전체 반올림 공식을 역산하지 않는다.

<a id="s056"></a>

### S056 — 인보이스 생성 도움말

- 원본: [인보이스 생성 도움말](https://help.hellobonsai.com/en/articles/2899904-how-to-create-an-invoice)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 청구 생성 안내는 one-time·scheduled·subscription·recurring, 고객·프로젝트, 로고·배경·연체료·세금·결제 수단을 설명한다. 과거 캡처의 별표·기본값과 현재 문서의 항목 목록은 별도로 기록한다.

<a id="s057"></a>

### S057 — 반복과 구독 청구

- 원본: [반복과 구독 청구](https://help.hellobonsai.com/en/articles/1065297-understanding-the-difference-between-subscription-and-recurring-invoices)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Recurring은 주기별 초안 복제 후 수동 또는 예약 발송, Subscription은 첫 결제 뒤 저장 수단 자동 청구로 구분한다. 구독 금액 변경 시 재확인, 실패 안내, 카드 지원 범위를 설명한다. 캡처의 구독 초안만으로 실제 자동결제 활성화를 확정하지 않는다.

<a id="s058"></a>

### S058 — Services library

- 원본: [Services library](https://help.hellobonsai.com/en/articles/12824095-services-library)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Services library는 이름·설명·가격·유형·분류를 문서에 재사용한다. 라이브러리 수정은 이후 사용에 적용되고 이미 문서에 추가한 항목은 소급 변경하지 않는다고 설명한다. 캡처의 단위 변경 원인은 별도 미확인이다.

<a id="s059"></a>

### S059 — 자동 발송 도움말

- 원본: [자동 발송 도움말](https://help.hellobonsai.com/en/articles/476673-how-to-schedule-an-invoice-to-auto-send)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 예약 발송은 미래 Issue Date·달력 버튼·확인 및 이메일 설정 후 Scheduled 상태로 확인한다. 반복의 자동 발송 중지와 발송 전날 알림도 안내한다. 캡처의 예약 상태를 실제 예정일 발송 성공으로 보지 않는다.

<a id="s060"></a>

### S060 — 결제 페이지 레이아웃

- 원본: [결제 페이지 레이아웃](https://help.hellobonsai.com/en/articles/6537018-payment-page-layouts-on-client-invoices)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 고객 결제 페이지는 side-by-side와 기본 single-column을 구분하며 설정 저장을 안내한다. 이는 인보이스 자체의 Studio/Foundation 문서 테마와 별개다.

<a id="s061"></a>

### S061 — 수동 입금 도움말

- 원본: [수동 입금 도움말](https://help.hellobonsai.com/en/articles/2899880-how-to-manually-mark-invoices-as-paid)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 수동 Receive Payment는 외부에서 받은 결제를 기록하는 기능이다. 전액·부분 금액·수단·날짜·고객 통지를 설정하며 전액은 Paid 표시, 부분은 잔액 유지, 기록은 Income에 반영한다고 설명한다. 실제 송금 실행은 아니다.

<a id="s062"></a>

### S062 — Stripe 연결 도움말

- 원본: [Stripe 연결 도움말](https://help.hellobonsai.com/en/articles/13521627-how-to-connect-stripe-payments-in-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Stripe 연결은 기존 Bonsai Payments 비활성화가 필요할 수 있고 신규 또는 기존 Stripe를 연결한다고 안내한다. 기존 계정 연결 시 하위 계정 생성과 Stripe 대시보드 관리를 설명하며 캡처의 로그인 진입만으로 연결 성공을 확정하지 않는다.

<a id="s063"></a>

### S063 — 지원 결제수단

- 원본: [지원 결제수단](https://help.hellobonsai.com/en/articles/1867512-the-integrated-payment-methods-supported-by-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 통합 수단은 Bonsai Payments·Stripe·PayPal이다. 국가별 사용 범위와 지급 방식 제한을 구분한다. 조회한 지원 조건을 과거 캡처나 우리 서비스 정책으로 소급 확정하지 않는다.

<a id="s064"></a>

### S064 — 기본값 도움말

- 원본: [기본값 도움말](https://help.hellobonsai.com/en/articles/3161415-how-to-add-or-update-default-information-on-invoices-late-fees-tax-rate-etc)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 청구 기본값은 Settings → Defaults → Invoices에서 연체료·세율·만기·VAT/Tax ID·메모를 설정하며 이후 생성 문서에 적용한다. 기존 청구서 소급 변경으로 해석하지 않는다.

<a id="s065"></a>

### S065 — 무료 체험 도움말

- 원본: [무료 체험 도움말](https://help.hellobonsai.com/en/articles/4303058-how-our-free-trial-works)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 선택 플랜 전체 기능의 7일 체험, 결제수단 등록, 취소하지 않으면 종료 후 과금을 안내한다. 결제 후 14일 내 환불 요청 안내도 있다. 과거 카드 입력 없는 가입 캡처에 현재 절차를 소급하지 않는다.

<a id="s066"></a>

### S066 — 계정 설정 가이드

- 원본: [계정 설정 가이드](https://help.hellobonsai.com/en/articles/5588945-how-to-set-up-your-account-in-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 브랜딩·기본 메시지·회사와 연락처·팀·환경 설정·CSV 가져오기 등 초기 설정을 안내한다. CSV 가져오기는 자동 되돌리기가 없고 회사는 삭제 대신 보관한다고 설명한다. 캡처의 사업 설문 순서 전체를 보증하는 문서는 아니다.

<a id="s067"></a>

### S067 — 공식 Perks URL

- 원본: [공식 Perks URL](https://www.hellobonsai.com/perks)
- 조회일·상태: 2026-11-20 KST · 본문 미확인 — 접근 실패
- 직접 대조 범위·한계: 이번 조회에서 공식 Perks URL에 접근하지 못했다. 현재 혜택·제공 여부는 문서 확인으로 계산하지 않으며 캡처 관찰만 유지한다.

<a id="s068"></a>

### S068 — 현재 공식 가격

- 원본: [현재 공식 가격](https://www.hellobonsai.com/pricing)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 가격표는 Basic/Essentials/Premium/Elite를 안내한다. 연간 청구 월 환산은 사용자당 $9/$19/$29/$49, 월간은 $15/$25/$39/$59이며 Elite는 최소 3명이다. 과거 Starter/Professional/Business와 명칭·과금 단위가 다르다.

<a id="s069"></a>

### S069 — 플랜 변경

- 원본: [플랜 변경](https://help.hellobonsai.com/en/articles/2003194-how-to-change-your-subscription-plan)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 Subscription에서 플랜·월간/연간 변경을 확정하면 즉시 반영하고 차액을 청구하거나 크레딧으로 조정한다고 설명한다. 실제 계정의 변경·청구는 수행하지 않았다.

<a id="s070"></a>

### S070 — 현재 공식 Privacy Policy

- 원본: [현재 공식 Privacy Policy](https://www.hellobonsai.com/legal/privacy)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 개인정보처리방침은 2025-08-05 갱신으로 표시되며 방문자·사용자·지원자 등의 정보와 고객 대신 처리하는 정보의 구분을 설명한다. 이 문서 조회는 실제 수집·삭제 실행이나 법적 적합성 검증이 아니다.

<a id="s071"></a>

### S071 — 공식 CRM 소개

- 원본: [공식 CRM 소개](https://www.hellobonsai.com/crm)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 CRM 소개는 연락처·노트·파일·프로젝트·거래·계약·청구서 연결과 고객 포털을 설명한다. 홍보 페이지이므로 API 필수값·권한·관계 수를 확정하는 근거로 쓰지 않는다.

<a id="s072"></a>

### S072 — Comments API

- 원본: [Comments API](https://docs.hellobonsai.com/api/tag/comments)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Comments API는 작업과 거래의 댓글 목록·작성 GET/POST 경로를 제공하며 자동 활동 기록도 설명한다. 이 그룹만으로 프로젝트 Timeline 내부 구현이나 댓글 편집·삭제 계약을 확정하지 않는다.

<a id="s073"></a>

### S073 — 작업 생성·추적 도움말

- 원본: [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 작업 저장·하위 작업과 다단계 중첩·상태/우선순위·기한·반복 설정을 설명한다. 반복 회차는 별도 작업으로 생성되며 프로젝트 완료 후 새 회차는 생성되지 않는다고 안내한다. 과거 캡처에 없는 중첩·반복 결과는 문서 정보로만 둔다.

<a id="s074"></a>

### S074 — 수동 시간 입력 도움말

- 원본: [수동 시간 입력 도움말](https://help.hellobonsai.com/en/articles/3438791-manually-adding-time-tracking-entries)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 전역 Time Tracking과 프로젝트 Time 탭에서 수동 시간 입력을 지원하고 프로젝트·작업·시간·설명을 작성하도록 안내한다. 과거 캡처의 비어 있는 Notes와 차이가 있어 현재 문구를 과거 필수값 검증으로 소급하지 않는다.

<a id="s075"></a>

### S075 — Time Entries API

- 원본: [Time Entries API](https://docs.hellobonsai.com/api/tag/time-entries)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Time Entries API는 GET/POST /public-api/v1/time_entries와 PATCH /public-api/v1/time_entries/{key}를 제공한다. 목록·기록·수정 범위이며 실시간 타이머 시작/정지 내부 요청을 확인한 것은 아니다.

<a id="s076"></a>

### S076 — 내부 시간 추적 도움말

- 원본: [내부 시간 추적 도움말](https://help.hellobonsai.com/en/articles/2548737-tracking-time-internally-with-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 타이머 시작/정지 후 제출, 수동 입력, 청구 가능/불가능 전환, 타임시트 잠금을 설명한다. 기록 시간과 청구 가능 여부·청구서 반올림은 다른 속성으로 대조한다. 실제 동기화·잠금은 재현하지 않았다.

<a id="s077"></a>

### S077 — Task Statuses API

- 원본: [Task Statuses API](https://docs.hellobonsai.com/api/tag/task-statuses)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Task Statuses는 GET /public-api/v1/task_statuses로 상태 이름에 대응하는 ID를 조회한다. 읽기 목록이므로 UI의 상태 생성·색상 편집 내부 API를 제공한다고 단정하지 않는다.

<a id="s078"></a>

### S078 — Board Groups API

- 원본: [Board Groups API](https://docs.hellobonsai.com/api/tag/board-groups)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Board Groups는 GET /public-api/v1/board_groups로 거래·프로젝트 보드 단계와 ID를 조회한다. 작업 상태 API와 별도 그룹이며 UI의 단계 편집 요청은 미관찰이다.

<a id="s079"></a>

### S079 — 완료·보관·삭제 도움말

- 원본: [완료·보관·삭제 도움말](https://help.hellobonsai.com/en/articles/1867536-completing-archiving-or-deleting-a-project)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 도움말은 완료·보관·삭제를 구분한다. 완료 프로젝트는 고객 포털에 남고 보관은 포털에서 숨겨지며 문서 서명·결제를 막는다고 설명한다. 삭제는 연결 데이터까지 제거하는 비가역 작업으로 안내된다. 문서 직접 접근과 포털 프로젝트 가시성을 구분하며 실제 계정에서 시험하지 않았다.

<a id="s080"></a>

### S080 — Company Tags API

- 원본: [Company Tags API](https://docs.hellobonsai.com/api/tag/company-tags)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 공개 Company Tags는 GET /public-api/v1/company_tags를 제공하며 고객·거래·프로젝트·작업·시간·비용에 쓰는 라벨이라고 설명한다. 이름과 색상 생성·연결 개수·삭제 전파는 이 목록 문서만으로 확정되지 않는다.

<a id="s081"></a>

### S081 — 공식 Reviews

- 원본: [공식 Reviews](https://www.hellobonsai.com/reviews)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 후기 페이지는 10,000개 이상 기업·1,020개 이상 후기와 사례·영상 링크를 제시한다. 캡처의 50만 고객·G2 평점과 모집단·시점이 다르며 마케팅 지표를 독립 검증하지 않았다.

<a id="s082"></a>

### S082 — 탐색·전역 검색

- 원본: [탐색·전역 검색](https://help.hellobonsai.com/en/articles/13764408-how-to-navigate-bonsai-and-customize-the-sidebar)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 탐색은 Home·Notifications·Clients·Contacts·워크스페이스 전환과 사이드바 고정·재정렬을 안내한다. 검색은 프로젝트·고객·작업·문서를 대상으로 한다. 과거 캡처의 Dashboard 구조·정확한 검색 순위나 단축키 규칙을 보장하지 않는다.

<a id="s083"></a>

### S083 — 기본 발송 메시지

- 원본: [기본 발송 메시지](https://help.hellobonsai.com/en/articles/2397460-how-to-set-default-messages-when-sending-documents-to-clients)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 기본 메시지는 제안서·계약·청구서별로 저장하며 발송 시 채운다. 변수·스마트 필드·동적 고객명 등의 자동 치환은 지원하지 않는다고 설명한다. 현재 Company Settings > Defaults > Messages 경로와 과거 설정 UI를 구분한다.

<a id="s084"></a>

### S084 — 계정 비활성화·삭제

- 원본: [계정 비활성화·삭제](https://help.hellobonsai.com/en/articles/1021483-how-to-deactivate-or-delete-your-bonsai-account)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 계정 비활성화는 데이터를 보관 처리하고 구독을 중지·하향하며, 지원팀을 통한 복원에는 일부 데이터 손실 가능성이 있다. 영구 삭제는 지원팀 요청과 자격 조건이 별도다. 캡처의 Delete Account 확인창과 같은 동작이라고 확정하지 않는다.

<a id="s085"></a>

### S085 — 구독 도움말 목록

- 원본: [구독 도움말 목록](https://help.hellobonsai.com/en/collections/96965-subscription-account-settings)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 구독·계정 도움말 모음의 항목 구성을 확인했다. 이 목록만으로 과거 Client Mode의 Business 전용 조건이나 활성화 이후 동작을 검증하지 않는다.

<a id="s086"></a>

### S086 — CSV 가져오기

- 원본: [CSV 가져오기](https://help.hellobonsai.com/en/articles/1867510-importing-data-into-bonsai)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 CSV는 Companies·Paid Invoices·Time Entries·Expenses를 지원하고 열 매핑·미리보기 후 실행한다. 자동 실행 취소는 없으며 가져온 회사는 삭제 대신 보관만 가능하다. 청구서 오류 정리는 개별 삭제이며 캡처의 실패 건이 부분 저장됐는지는 설명하지 않는다.

<a id="s087"></a>

### S087 — 결제수단 변경

- 원본: [결제수단 변경](https://help.hellobonsai.com/en/articles/1977581-how-to-change-your-subscription-payment-method)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Manage Payment Methods에서 추가·교체·삭제·기본 수단 설정을 안내하고 변경된 수단은 향후 청구 주기에 사용된다고 설명한다. 카드 등록 화면이나 저장 토스트는 실제 구독 결제 승인과 다르다.

<a id="s088"></a>

### S088 — 일시정지·취소

- 원본: [일시정지·취소](https://help.hellobonsai.com/en/articles/1867485-pausing-or-cancelling-your-bonsai-subscription)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 일시정지는 1·2·3개월 뒤 자동 재개하며 중지 기간 무과금으로 안내한다. 취소 뒤 기존 기록 접근을 허용하고 결제 후 24시간 이내 취소 시 최근 결제 환불 가능성을 언급한다. 개별 환불 자격·실행과 과거 종료 예약 화면은 별도 확인이 필요하다.

<a id="s089"></a>

### S089 — Limited 플랜

- 원본: [Limited 플랜](https://help.hellobonsai.com/en/articles/2683127-what-you-can-do-on-a-free-limited-subscription-plan)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 Limited 문서는 새 청구서·고객 문서 생성/발송과 폼 응답 접근을 제한하고 기존 문서 조회를 허용한다. 동시에 프로젝트·작업·시간·고객 관리와 일부 회계/설정 작업도 허용한다고 명시한다. 문서의 view-only 요약만으로 모든 기능을 읽기 전용으로 확정하지 않는다.

<a id="s090"></a>

### S090 — 환불정책

- 원본: [환불정책](https://help.hellobonsai.com/en/articles/1638426-learn-more-about-bonsai-s-refund-policy)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 환불 전용 문서는 월간·연간 모두 청구일부터 14일 이내 요청 창구를 안내한다. 취소 도움말의 24시간 언급과 표현 범위가 달라 적용 조건은 추가 확인이 필요하다. 캡처의 구독 취소나 설문 제출 자체는 환불 실행 증거가 아니다.

<a id="s091"></a>

### S091 — Task templates 도움말

- 원본: [Task templates 도움말](https://help.hellobonsai.com/en/articles/11488590-leveraging-task-templates)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 작업 템플릿은 여러 작업·하위 작업을 재사용하며 프로젝트 시작/종료일 기준 상대 날짜와 주말 건너뛰기, Waiting on·Blocking·Related to 의존성을 안내한다. 이러한 현재 확장 기능이 과거 캡처에 수록됐다고 보지 않는다.

<a id="s092"></a>

### S092 — 현재 공식 Terms of Service

- 원본: [현재 공식 Terms of Service](https://www.hellobonsai.com/legal/terms)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 약관은 2025-08-05 개정본이며 계정·자격·구독 자동 갱신·청구 등의 조항을 담는다. 캡처의 2020-06-30 본문과 버전이 다르다. 일부 조항의 존재를 확인한 것으로 전체 법적 적합성이나 실제 이용자의 동의 기록을 검증한 것이 아니다.

<a id="s093"></a>

### S093 — 공식 Invoice Generator

- 원본: [공식 Invoice Generator](https://www.hellobonsai.com/invoice-generator)
- 조회일·상태: 2026-11-20 KST · 반환된 본문 범위 확인
- 직접 대조 범위·한계: 현재 공개 Invoice Generator 페이지는 고객 정보·항목·수량·단가·세금·기한을 구성하는 생성기와 청구서 작성 안내를 제공한다. 다운로드·파일 형식·온라인 청구 기능에 대한 소개가 실제 과거 세션의 파일 생성·결제 성공을 입증하지 않는다.

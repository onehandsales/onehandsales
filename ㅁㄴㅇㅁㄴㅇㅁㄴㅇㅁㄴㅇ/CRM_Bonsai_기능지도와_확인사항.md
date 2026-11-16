# Bonsai 기능 지도와 확인 사항

작성 기준일: 2026-11-17

이 문서는 [학습 계획과 타깃 고객](CRM_Bonsai_학습계획과_타깃고객.md)을 읽다가 필요한 기능을 찾아보는 참고 자료다. 공식 문서에 설명된 동작을 요약했으며, 모든 기능의 실제 계정 테스트나 모든 문서의 전수 검증을 완료했다는 뜻은 아니다. 예시는 가상의 업무 상황이다.

## 1. 먼저 익힐 중심 기능

| 기능 | 공식 문서에서 확인한 내용 | 이해를 위한 예시와 효과 |
| --- | --- | --- |
| 회사·담당자 | 회사와 담당자를 관리하고 프로젝트를 시작할 수 있다. [시작 안내](https://help.hellobonsai.com/en/articles/5588945-how-to-set-up-your-account-in-bonsai) | 고객사와 담당자를 기록해 다음 거래에서도 연락 대상을 찾는다. |
| 거래·파이프라인 | 거래 단계, 금액, 성사 가능성, 담당자 등을 관리하고 프로젝트를 생성하거나 연결한다. [거래 관리](https://help.hellobonsai.com/en/articles/10496156-manage-deals-in-bonsai) | A사는 견적 중, B사는 계약 대기 중이다. 오늘 후속 연락할 거래를 찾는다. |
| 견적 계산 | 항목·수량·단가·할인 등을 구성한다. 견적에서 프로젝트를 만들고 선택적으로 항목을 작업으로 변환할 수 있다. [Estimate builder](https://help.hellobonsai.com/en/articles/10731093-the-estimate-builder) | 개발 항목별 견적을 작성한 뒤 작업으로 옮긴다. 재입력할 내용을 줄일 수 있다. |
| 제안·계약 문서 | 문서 편집, 견적 가격표 가져오기, 서명 필드, 전송 기능을 제공한다. [Document builder](https://help.hellobonsai.com/en/articles/15879228-document-builder-overview) | 고객에게 작업 범위와 금액을 제시하고 합의 내용을 남긴다. |
| 프로젝트·작업 | 프로젝트에 작업·시간·비용·파일 등을 모으고, 작업의 담당자·기한·상태를 관리한다. [프로젝트](https://help.hellobonsai.com/en/articles/12783206-all-about-projects), [작업](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai) | 예약 기능 개발을 담당자에게 배정하고 완료 여부를 확인한다. |
| 과금 방식·시간 | 고정 금액, 시간·비용 기준, 리테이너 등의 과금 방식을 제공한다. 청구 가능한 시간 기록을 청구서에 반영할 수 있다. [과금 방식](https://help.hellobonsai.com/en/articles/9948855-project-billing-types), [시간 청구](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time) | 고정가 제작과 시간당 유지보수를 구분한다. 시간을 기록했다고 모든 프로젝트의 청구액이 자동 증가하는 것은 아니다. |
| 청구·입금 | 청구서를 작성하고 외부에서 받은 금액을 전액 또는 일부 입금으로 수동 기록할 수 있다. [청구서 작성](https://help.hellobonsai.com/en/articles/2899904-how-to-create-an-invoice), [입금 기록](https://help.hellobonsai.com/en/articles/2899880-how-to-manually-mark-invoices-as-paid) | 청구한 600만 원 중 400만 원만 들어왔을 때 잔액을 구분한다. |
| 고객 포털 | 고객이 문서·청구서·파일 등을 확인하고, 설정한 범위에서 작업에 참여한다. [고객 포털](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal), [작업 공유](https://help.hellobonsai.com/en/articles/10003632-sharing-and-managing-tasks-through-your-client-portal) | 고객에게 자료 전달과 진행 확인 공간을 제공한다. 공개 범위와 권한을 함께 배운다. |

견적 계산용 Estimate와 고객에게 보내는 Document는 구분해서 학습한다. 견적에서 가져온 가격표를 문서 안에서 직접 수정하는 방식에는 제한이 있으며, 원본 견적을 고친 뒤 문서를 다시 만드는 흐름을 공식 문서에서 안내한다. “어디서 수정하면 무엇이 바뀌는지”를 반드시 확인한다. [견적에서 합의 문서 만들기](https://help.hellobonsai.com/en/articles/16023824-create-an-agreement-from-an-estimate)

## 2. 중심 흐름을 익힌 뒤 넓혀갈 기능

| 기능 | 배우는 이유 | 공식 출처 |
| --- | --- | --- |
| 서비스 목록·단가표 | 자주 판매하는 서비스와 역할별 시간 단가를 재사용한다. | [서비스 목록](https://help.hellobonsai.com/en/articles/12824095-services-library), [Rate cards](https://help.hellobonsai.com/en/articles/10682552-rate-cards) |
| 예산·비용·수익성 | 받은 금액뿐 아니라 투입 시간과 비용도 살펴본다. | [프로젝트 예산](https://help.hellobonsai.com/en/articles/8916128-project-budgets), [수익성 전망](https://help.hellobonsai.com/en/articles/9362564-project-profitability-forecast-report) |
| 팀 일정·인력 배정 | 여러 프로젝트의 업무가 특정 사람에게 몰리는지 확인한다. | [Workload](https://help.hellobonsai.com/en/articles/10458662-the-workload-view), [Resourcing](https://help.hellobonsai.com/en/articles/10548568-the-resourcing-schedule-view) |
| 반복 작업·반복 청구 | 매달 하는 유지보수와 정기 청구를 관리한다. 반복 청구서와 자동 결제 구독은 동작이 다르다. | [반복 작업](https://help.hellobonsai.com/en/articles/16761394-creating-and-managing-recurring-tasks), [반복 청구와 구독](https://help.hellobonsai.com/en/articles/1065297-understanding-the-difference-between-subscription-and-recurring-invoices) |
| 문의 양식·상담 예약 | 필요한 요구사항을 받고 상담 시간을 잡는다. | [Forms](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires), [Scheduling](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages) |
| 이메일·캘린더 연결 | 고객과 나눈 연락과 일정을 확인한다. | [Email and calendar sync](https://help.hellobonsai.com/en/articles/16075398-email-and-calendar-sync) |
| 사용자 정의 필드·보기 | 고객과 업무에 필요한 추가 정보를 저장하고 목록을 구성한다. | [Custom fields](https://help.hellobonsai.com/en/articles/12078877-custom-fields), [Custom views](https://help.hellobonsai.com/en/articles/13863260-how-to-create-and-manage-custom-views) |
| 자동화·권한·보고서 | 어떤 사건에 어떤 동작이 실행되는지, 누가 정보를 볼 수 있는지, 미청구·미수 상태를 어떻게 확인하는지 배운다. | [자동화](https://help.hellobonsai.com/en/articles/4520301-workflow-automations), [권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai), [청구 보고서](https://help.hellobonsai.com/en/articles/13064452-project-billing-report) |

이 표는 주요 학습 영역을 정리한 지도다. 요금제별 제공 범위, 세부 설정, 외부 연동 전체를 나열한 완전한 기능 명세는 아니다.

## 3. Bonsai를 우선 학습하는 근거와 Assembly와의 차이

두 제품 모두 고객 관리, 작업, 청구, 고객 포털을 제공한다. “다른 CRM에는 없으므로 Bonsai만 정답”이라고 판단하지 않는다. 현재 요구에서 중요한 차이는 **견적 내용을 실제 수행 업무와 청구 과정으로 연결하는 방식**이다.

| 비교할 흐름 | Bonsai | Assembly |
| --- | --- | --- |
| 여러 거래 관리 | 거래 단계와 상세, 프로젝트 연결을 공식 도움말에서 설명한다. [출처](https://help.hellobonsai.com/en/articles/10496156-manage-deals-in-bonsai) | Sales Pipeline Tracker 앱 템플릿으로 거래·단계·금액 등을 관리한다. [출처](https://assembly.com/docs/apps/sales-pipeline-tracker) |
| 견적·제안에서 다음 단계로 | 견적에서 프로젝트를 만들고 항목을 작업으로 변환하는 기능을 명시한다. [출처](https://help.hellobonsai.com/en/articles/10731093-the-estimate-builder) | Proposal Builder 템플릿은 제안 수락을 지원하지만 결제·청구서 생성·구독 시작은 수행하지 않는다고 명시한다. 별도 청구가 필요하다. [출처](https://assembly.com/docs/apps/proposal-builder) |
| 시간 기록에서 청구로 | 청구 가능한 시간 기록을 청구서로 만드는 흐름을 명시한다. [출처](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time) | Billable Time Tracker의 기록·보고서·내보내기는 확인했다. 같은 문서에서 청구서 자동 생성까지 확인하지는 못했다. [출처](https://assembly.com/docs/apps/billable-time-tracker) |
| 고객과 일하는 공간 | 고객 포털과 작업 공유를 제공한다. [출처](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal) | 기본 앱과 설치·수정 가능한 앱 템플릿으로 고객 업무 공간을 구성한다. [출처](https://assembly.com/docs/building-new-apps/app-templates) |

따라서 **현재 사용자가 선택한 ‘견적 → 수행 → 청구’의 연결을 먼저 학습하기에는 Bonsai를 우선 추천**한다. 이것은 공식 문서의 동작을 비교한 판단이다. 실제 계정에서 사용성을 비교하거나 복제 개발 비용을 산정해 우열을 확정한 결과는 아니다. Assembly의 기본 제공 동작, 앱 템플릿, 직접 추가할 동작도 구분해야 한다.

## 4. 누나의 사례와 국내 서비스에서 추가로 확인할 것

| 확인할 요구 | 현재 확인 수준 | 다음에 확인할 내용 |
| --- | --- | --- |
| 고객별 작업 범위·수량·단가 | 견적 항목·설명·수량·가격을 작성할 수 있다. [출처](https://help.hellobonsai.com/en/articles/10731093-the-estimate-builder) | 실제 청소 견적의 구역·평수·옵션을 무리 없이 표현할 수 있는가? |
| 지역·평수·청소 강도에 따른 자동 가격 | 임의 조건식으로 가격을 계산하는 기본 기능은 확인하지 못했다. | 단순 항목 입력으로 충분한가, 별도 계산 규칙이 필요한가? |
| 세금 포함 200만 원 / 별도 200만 원 | 청구서 세율은 지원한다. 총액 기준 역산 기능은 확인하지 못했다. [출처](https://help.hellobonsai.com/en/articles/3161415-how-to-add-or-update-default-information-on-invoices-late-fees-tax-rate-etc) | 두 조건을 입력·수정할 때 계산과 반올림이 어떻게 동작하는가? |
| 청소 인력의 현장 배정·이동 | 프로젝트 인력 배정 기능은 있으나 현장 이동 경로나 배차 최적화까지 확인하지 못했다. [출처](https://help.hellobonsai.com/en/articles/10548568-the-resourcing-schedule-view) | 현장 주소·방문 시간·이동·반복 배정을 어느 정도 지원해야 하는가? |
| 국내 결제·전자세금계산서 | 일반 청구서와 한국 전자세금계산서는 같은 기능으로 볼 수 없다. 국내 PG·전자세금계산서 연동은 미확인이다. | 한국에서 판매할 때 필요한 별도 연동과 실제 사용자 요구는 무엇인가? |

비용 입력에서 세금 포함 금액을 역산하는 설명을 고객 견적의 세금 포함 모드로 오해하면 안 된다. 공식 문서의 해당 설명은 Expense의 세전·세후 금액과 재청구 가격에 관한 것이다. [비용의 세전·세후 금액](https://help.hellobonsai.com/en/articles/13159534-understanding-expense-amounts-after-tax-pre-tax-and-sales-price)

## 5. 화면을 모방하기 전에 확인할 버전과 조건

- **문서 작성 화면의 버전:** 공식 안내는 2026-07-27 이후 생성한 계정에 새 Document Builder가 적용된다고 설명한다. 이전 Proposal 화면과 새 화면의 흐름을 섞지 않는다. Nicelydone 자료가 어느 버전인지도 확인해야 한다. [공식 안내](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals)
- **자동화 범위:** 기존 Workflow Automations 문서는 새 Document Builder를 지원하지 않는다고 설명한다. 따라서 문서 서명 이후 모든 과정이 해당 자동화로 이어진다고 가정하지 않는다. [공식 안내](https://help.hellobonsai.com/en/articles/4520301-workflow-automations)
- **문서 결제의 국가 조건:** 새 문서의 결제 기능은 미국·영국·호주 계정과 Bonsai Payments 사용 조건을 명시한다. 다른 국가에서의 청구서 생성과 외부 입금 기록까지 모두 불가능하다는 뜻은 아니다. [문서 결제](https://help.hellobonsai.com/en/articles/17748768-setting-up-payments-for-documents), [통합 결제 수단](https://help.hellobonsai.com/en/articles/1867512-the-integrated-payment-methods-supported-by-bonsai)
- **사용자 정의 필드의 필터:** Custom fields 문서와 더 최근 Custom views 문서의 설명에 차이가 있다. 최신 보기 문서는 사용자 정의 필드 필터를 설명하므로, 실제 계정의 대상 화면과 필드 유형을 확인해 기록한다. [필드](https://help.hellobonsai.com/en/articles/12078877-custom-fields), [보기](https://help.hellobonsai.com/en/articles/13863260-how-to-create-and-manage-custom-views)

## 6. 근거를 기록하는 기준

| 자료 | 이 문서에서의 상태 | 알 수 있는 범위 |
| --- | --- | --- |
| Bonsai 공식 도움말·제품 소개 | 위에 연결한 주요 문서를 확인해 요약했다. | 제품이 설명하는 기능과 조건. 실제 계정 동작과 차이가 있을 수 있다. |
| Assembly 공식 문서 | 공식 문서 목록과 통합 본문을 검색하고 관련 핵심 문서를 검토했다. | 기본 앱·템플릿·사용자 추가 개발의 구분. 모든 문장을 전수 검증한 것은 아니다. |
| Nicelydone MCP 화면·흐름 | 이번 문서 작성에서 조회하지 않았다. | 추후 화면 구조와 흐름을 확인할 자료다. |
| 실제 Bonsai·Assembly 계정 | 직접 조작하지 않았다. | 버전·요금제·권한·예외 동작은 추후 확인해야 한다. |
| 가상 개발·청소 사례 | 이해와 비교를 위한 예시다. | 실제 고객 사례나 기능 테스트 결과가 아니다. |
| 초기 타깃 추천 | 업무 흐름과 사용자의 학습 맥락을 바탕으로 한 가설이다. | 구매 수요와 지불 의향은 고객 검증이 필요하다. |

원문을 넓혀 볼 때는 [Bonsai 도움말](https://help.hellobonsai.com/en/), [Assembly 문서 목록](https://assembly.com/docs/llms.txt), [Assembly 통합 문서](https://assembly.com/docs/llms-full.txt)를 사용한다.

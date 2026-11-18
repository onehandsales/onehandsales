# Bonsai 플로우 원본과 분석

Updated: 2026-11-18 KST

Bonsai Web의 Gummble 캡처를 플로우별로 탐색하고, 같은 폴더의 분석 문서와 원본 화면을 함께 읽는다.

| 항목 | 범위 |
| --- | --- |
| 플로우 | 134개: 상위 42개 · 하위 92개 |
| 화면 | 고유 원본 642개 · 플로우별 순서가 있는 파일 754개 |
| 버전 | Gummble `Latest` · `2146`. 개별 제품 빌드·캡처일 미확인 |
| 구성 | 각 플로우의 `ANALYSIS.md` + `screens/01_화면ID.png` |

동일 화면이 여러 플로우에 등장하면 각 폴더에 같은 원본 바이트로 보관한다. 파일명 앞 숫자는 해당 플로우 안의 단계다.

기존 화면 관찰·공식 문서 대조·설계 가정과 R1/R2 이력은 유지했다. 이번 이미지 배치와 기계적 검증은 새로운 계정 실행이나 모든 설명의 재검증을 뜻하지 않는다.

Flow ID·Screen ID·원본 URL·화면 크기는 각 분석 문서에 기록했다. 개발할 때는 아래에서 해당 플로우의 분석과 이미지를 함께 확인한다. 출처와 검토 상태는 각 분석의 1절, 검토 이력은 9절에서 확인한다.

## 전체 플로우

| 플로우 경로 | 단계 수 | 분석 |
| --- | ---: | --- |
| Bookkeeping | 7 | [열기](flows/Bookkeeping/ANALYSIS.md) |
| Bookkeeping/Deleting an income | 4 | [열기](flows/Bookkeeping/Deleting%20an%20income/ANALYSIS.md) |
| Bookkeeping/Bookkeeping overview | 6 | [열기](flows/Bookkeeping/Bookkeeping%20overview/ANALYSIS.md) |
| Bookkeeping/Adding a bookkeeping category | 6 | [열기](flows/Bookkeeping/Adding%20a%20bookkeeping%20category/ANALYSIS.md) |
| Bookkeeping/Bulk editing expenses | 7 | [열기](flows/Bookkeeping/Bulk%20editing%20expenses/ANALYSIS.md) |
| Bookkeeping/Downloading expenses | 4 | [열기](flows/Bookkeeping/Downloading%20expenses/ANALYSIS.md) |
| Bookkeeping/Filtering expenses | 10 | [열기](flows/Bookkeeping/Filtering%20expenses/ANALYSIS.md) |
| Bookkeeping/Connect bank account | 3 | [열기](flows/Bookkeeping/Connect%20bank%20account/ANALYSIS.md) |
| Bookkeeping/Adding a recurring expense | 11 | [열기](flows/Bookkeeping/Adding%20a%20recurring%20expense/ANALYSIS.md) |
| Bookkeeping/Adding a recurring expense/Adding an image and note | 5 | [열기](flows/Bookkeeping/Adding%20a%20recurring%20expense/Adding%20an%20image%20and%20note/ANALYSIS.md) |
| Starting time tracking | 10 | [열기](flows/Starting%20time%20tracking/ANALYSIS.md) |
| Copying referral link | 4 | [열기](flows/Copying%20referral%20link/ANALYSIS.md) |
| Accepting an invitation | 13 | [열기](flows/Accepting%20an%20invitation/ANALYSIS.md) |
| Invoices | 4 | [열기](flows/Invoices/ANALYSIS.md) |
| Invoices/Adding a new invoice | 8 | [열기](flows/Invoices/Adding%20a%20new%20invoice/ANALYSIS.md) |
| Invoices/Adding a new invoice/Record payment | 3 | [열기](flows/Invoices/Adding%20a%20new%20invoice/Record%20payment/ANALYSIS.md) |
| Invoices/Adding a new invoice/Enable auto-sending | 3 | [열기](flows/Invoices/Adding%20a%20new%20invoice/Enable%20auto-sending/ANALYSIS.md) |
| Invoices/Adding a new invoice/Preview invoice | 3 | [열기](flows/Invoices/Adding%20a%20new%20invoice/Preview%20invoice/ANALYSIS.md) |
| Invoices/Adding a new invoice/Editing invoice header | 2 | [열기](flows/Invoices/Adding%20a%20new%20invoice/Editing%20invoice%20header/ANALYSIS.md) |
| Invoices/Adding a new invoice/Adding unbilled time | 5 | [열기](flows/Invoices/Adding%20a%20new%20invoice/Adding%20unbilled%20time/ANALYSIS.md) |
| Invoices/Adding a new invoice/Editing an item | 5 | [열기](flows/Invoices/Adding%20a%20new%20invoice/Editing%20an%20item/ANALYSIS.md) |
| Invoices/Updating invoice settings | 5 | [열기](flows/Invoices/Updating%20invoice%20settings/ANALYSIS.md) |
| Invoices/Editing default values (Invoices) | 4 | [열기](flows/Invoices/Editing%20default%20values%20%28Invoices%29/ANALYSIS.md) |
| Invoices/Connecting to Stripe | 10 | [열기](flows/Invoices/Connecting%20to%20Stripe/ANALYSIS.md) |
| Invoices/Connecting to Stripe/Turning off card payments | 2 | [열기](flows/Invoices/Connecting%20to%20Stripe/Turning%20off%20card%20payments/ANALYSIS.md) |
| Products (CRM) | 10 | [열기](flows/Products%20%28CRM%29/ANALYSIS.md) |
| Services | 4 | [열기](flows/Services/ANALYSIS.md) |
| Services/Adding a service to library | 5 | [열기](flows/Services/Adding%20a%20service%20to%20library/ANALYSIS.md) |
| Using invoice generator | 5 | [열기](flows/Using%20invoice%20generator/ANALYSIS.md) |
| Scheduling | 2 | [열기](flows/Scheduling/ANALYSIS.md) |
| Scheduling/Copying a booking page | 4 | [열기](flows/Scheduling/Copying%20a%20booking%20page/ANALYSIS.md) |
| Freelancers | 4 | [열기](flows/Freelancers/ANALYSIS.md) |
| Careers | 4 | [열기](flows/Careers/ANALYSIS.md) |
| Logging out | 2 | [열기](flows/Logging%20out/ANALYSIS.md) |
| Help Center | 2 | [열기](flows/Help%20Center/ANALYSIS.md) |
| Help Center/Help article detail | 4 | [열기](flows/Help%20Center/Help%20article%20detail/ANALYSIS.md) |
| Time Tracking | 6 | [열기](flows/Time%20Tracking/ANALYSIS.md) |
| Tasks | 3 | [열기](flows/Tasks/ANALYSIS.md) |
| Tasks/Creating a task template | 4 | [열기](flows/Tasks/Creating%20a%20task%20template/ANALYSIS.md) |
| Tasks/Editing a template task | 8 | [열기](flows/Tasks/Editing%20a%20template%20task/ANALYSIS.md) |
| Tasks/Adding a task (template) | 7 | [열기](flows/Tasks/Adding%20a%20task%20%28template%29/ANALYSIS.md) |
| Contact Us | 2 | [열기](flows/Contact%20Us/ANALYSIS.md) |
| Creating a proposal | 12 | [열기](flows/Creating%20a%20proposal/ANALYSIS.md) |
| Creating a proposal/Sending a proposal | 8 | [열기](flows/Creating%20a%20proposal/Sending%20a%20proposal/ANALYSIS.md) |
| Creating a proposal/Archiving a proposal | 5 | [열기](flows/Creating%20a%20proposal/Archiving%20a%20proposal/ANALYSIS.md) |
| Creating a proposal/Changing theme | 6 | [열기](flows/Creating%20a%20proposal/Changing%20theme/ANALYSIS.md) |
| Creating a proposal/Marking as accepted | 6 | [열기](flows/Creating%20a%20proposal/Marking%20as%20accepted/ANALYSIS.md) |
| Creating a proposal/Creating a new automation | 6 | [열기](flows/Creating%20a%20proposal/Creating%20a%20new%20automation/ANALYSIS.md) |
| Creating a proposal/Setting proposal expiration date | 6 | [열기](flows/Creating%20a%20proposal/Setting%20proposal%20expiration%20date/ANALYSIS.md) |
| Creating a proposal/Editing header style | 7 | [열기](flows/Creating%20a%20proposal/Editing%20header%20style/ANALYSIS.md) |
| Inviting a member | 5 | [열기](flows/Inviting%20a%20member/ANALYSIS.md) |
| Project detail | 6 | [열기](flows/Project%20detail/ANALYSIS.md) |
| Project detail/Editing project name | 4 | [열기](flows/Project%20detail/Editing%20project%20name/ANALYSIS.md) |
| Project detail/Updating project status | 4 | [열기](flows/Project%20detail/Updating%20project%20status/ANALYSIS.md) |
| Project detail/Editing project settings | 4 | [열기](flows/Project%20detail/Editing%20project%20settings/ANALYSIS.md) |
| Project detail/Adding a task | 6 | [열기](flows/Project%20detail/Adding%20a%20task/ANALYSIS.md) |
| Project detail/Adding a task/Adding a comment | 3 | [열기](flows/Project%20detail/Adding%20a%20task/Adding%20a%20comment/ANALYSIS.md) |
| Project detail/Adding a task/Adding a time entry | 6 | [열기](flows/Project%20detail/Adding%20a%20task/Adding%20a%20time%20entry/ANALYSIS.md) |
| Project detail/Adding a task/Deleting a task | 4 | [열기](flows/Project%20detail/Adding%20a%20task/Deleting%20a%20task/ANALYSIS.md) |
| Project detail/Adding a task/Editing status settings | 6 | [열기](flows/Project%20detail/Adding%20a%20task/Editing%20status%20settings/ANALYSIS.md) |
| Project detail/Adding a task/Adding subtasks | 10 | [열기](flows/Project%20detail/Adding%20a%20task/Adding%20subtasks/ANALYSIS.md) |
| Project detail/Adding a task/Continue tracking time | 5 | [열기](flows/Project%20detail/Adding%20a%20task/Continue%20tracking%20time/ANALYSIS.md) |
| Project detail/Adding a task/Archiving a task | 3 | [열기](flows/Project%20detail/Adding%20a%20task/Archiving%20a%20task/ANALYSIS.md) |
| Project detail/Adding a task/Editing a subtask | 5 | [열기](flows/Project%20detail/Adding%20a%20task/Editing%20a%20subtask/ANALYSIS.md) |
| Creating a new contract | 19 | [열기](flows/Creating%20a%20new%20contract/ANALYSIS.md) |
| Creating a new contract/Contract guide tour | 4 | [열기](flows/Creating%20a%20new%20contract/Contract%20guide%20tour/ANALYSIS.md) |
| Creating a new contract/Converting contract type | 3 | [열기](flows/Creating%20a%20new%20contract/Converting%20contract%20type/ANALYSIS.md) |
| Creating a new contract/Signing a contract | 5 | [열기](flows/Creating%20a%20new%20contract/Signing%20a%20contract/ANALYSIS.md) |
| Privacy | 2 | [열기](flows/Privacy/ANALYSIS.md) |
| Industries (Consulting) | 8 | [열기](flows/Industries%20%28Consulting%29/ANALYSIS.md) |
| Subscribing to Starter plan | 12 | [열기](flows/Subscribing%20to%20Starter%20plan/ANALYSIS.md) |
| Subscribing to Starter plan/Canceling subscription | 10 | [열기](flows/Subscribing%20to%20Starter%20plan/Canceling%20subscription/ANALYSIS.md) |
| Filtering all templates | 5 | [열기](flows/Filtering%20all%20templates/ANALYSIS.md) |
| Filtering all templates/Template detail | 5 | [열기](flows/Filtering%20all%20templates/Template%20detail/ANALYSIS.md) |
| Terms & Conditions | 1 | [열기](flows/Terms%20%26%20Conditions/ANALYSIS.md) |
| Pricing | 3 | [열기](flows/Pricing/ANALYSIS.md) |
| Invoice templates | 11 | [열기](flows/Invoice%20templates/ANALYSIS.md) |
| Logging in | 5 | [열기](flows/Logging%20in/ANALYSIS.md) |
| Logging in/Resetting password | 10 | [열기](flows/Logging%20in/Resetting%20password/ANALYSIS.md) |
| Dashboard | 8 | [열기](flows/Dashboard/ANALYSIS.md) |
| Dashboard/Marking a task as complete | 2 | [열기](flows/Dashboard/Marking%20a%20task%20as%20complete/ANALYSIS.md) |
| Dashboard/Adding income manually | 11 | [열기](flows/Dashboard/Adding%20income%20manually/ANALYSIS.md) |
| Dashboard/Adding company details | 8 | [열기](flows/Dashboard/Adding%20company%20details/ANALYSIS.md) |
| Dashboard/Adding company details/Uploading company logo | 4 | [열기](flows/Dashboard/Adding%20company%20details/Uploading%20company%20logo/ANALYSIS.md) |
| Dashboard/Create a contact form (template) | 5 | [열기](flows/Dashboard/Create%20a%20contact%20form%20%28template%29/ANALYSIS.md) |
| Dashboard/Create a contact form (template)/Using a template | 5 | [열기](flows/Dashboard/Create%20a%20contact%20form%20%28template%29/Using%20a%20template/ANALYSIS.md) |
| Dashboard/Create a contact form (template)/Filtering contact templates | 4 | [열기](flows/Dashboard/Create%20a%20contact%20form%20%28template%29/Filtering%20contact%20templates/ANALYSIS.md) |
| Dashboard/Create a contact form (template)/Searching templates | 3 | [열기](flows/Dashboard/Create%20a%20contact%20form%20%28template%29/Searching%20templates/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar | 8 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar/Adding event details | 5 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/Adding%20event%20details/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar/Setting up availability | 8 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/Setting%20up%20availability/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar/Editing an event type | 5 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/Editing%20an%20event%20type/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar/Editing branding & design | 10 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/Editing%20branding%20%26%20design/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar/Editing advanced settings | 5 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/Editing%20advanced%20settings/ANALYSIS.md) |
| Dashboard/Connecting to Google Calendar/View booking page | 4 | [열기](flows/Dashboard/Connecting%20to%20Google%20Calendar/View%20booking%20page/ANALYSIS.md) |
| Dashboard/Hiding sidebar | 3 | [열기](flows/Dashboard/Hiding%20sidebar/ANALYSIS.md) |
| Adding a new client | 7 | [열기](flows/Adding%20a%20new%20client/ANALYSIS.md) |
| 404 | 2 | [열기](flows/404/ANALYSIS.md) |
| Blog | 4 | [열기](flows/Blog/ANALYSIS.md) |
| Blog/Blog detail | 4 | [열기](flows/Blog/Blog%20detail/ANALYSIS.md) |
| Blog/Searching blog | 3 | [열기](flows/Blog/Searching%20blog/ANALYSIS.md) |
| Projects | 4 | [열기](flows/Projects/ANALYSIS.md) |
| Projects/Adding a tag | 9 | [열기](flows/Projects/Adding%20a%20tag/ANALYSIS.md) |
| Projects/Reordering projects | 3 | [열기](flows/Projects/Reordering%20projects/ANALYSIS.md) |
| Projects/Switching to list view | 3 | [열기](flows/Projects/Switching%20to%20list%20view/ANALYSIS.md) |
| Projects/Creating a project (Projects) | 6 | [열기](flows/Projects/Creating%20a%20project%20%28Projects%29/ANALYSIS.md) |
| Forms | 2 | [열기](flows/Forms/ANALYSIS.md) |
| Forms/Adding questions to a form | 5 | [열기](flows/Forms/Adding%20questions%20to%20a%20form/ANALYSIS.md) |
| Forms/Reordering questions | 3 | [열기](flows/Forms/Reordering%20questions/ANALYSIS.md) |
| Forms/Sharing a form | 8 | [열기](flows/Forms/Sharing%20a%20form/ANALYSIS.md) |
| Forms/Form responses | 5 | [열기](flows/Forms/Form%20responses/ANALYSIS.md) |
| Forms/Form responses/Response detail | 4 | [열기](flows/Forms/Form%20responses/Response%20detail/ANALYSIS.md) |
| Forms/Form responses/Giving a response | 9 | [열기](flows/Forms/Form%20responses/Giving%20a%20response/ANALYSIS.md) |
| Reviews | 4 | [열기](flows/Reviews/ANALYSIS.md) |
| Perks | 4 | [열기](flows/Perks/ANALYSIS.md) |
| Landing page | 11 | [열기](flows/Landing%20page/ANALYSIS.md) |
| Searching Bonsai | 5 | [열기](flows/Searching%20Bonsai/ANALYSIS.md) |
| Onboarding | 10 | [열기](flows/Onboarding/ANALYSIS.md) |
| Onboarding/Completing account setup | 16 | [열기](flows/Onboarding/Completing%20account%20setup/ANALYSIS.md) |
| Clients | 5 | [열기](flows/Clients/ANALYSIS.md) |
| Clients/Enabling portal access | 2 | [열기](flows/Clients/Enabling%20portal%20access/ANALYSIS.md) |
| Clients/Uploading a client image | 3 | [열기](flows/Clients/Uploading%20a%20client%20image/ANALYSIS.md) |
| Clients/Adding a client field | 4 | [열기](flows/Clients/Adding%20a%20client%20field/ANALYSIS.md) |
| Clients/Adding a new project (Clients) | 5 | [열기](flows/Clients/Adding%20a%20new%20project%20%28Clients%29/ANALYSIS.md) |
| Affiliate Program | 4 | [열기](flows/Affiliate%20Program/ANALYSIS.md) |
| Settings | 12 | [열기](flows/Settings/ANALYSIS.md) |
| Settings/Deleting account | 5 | [열기](flows/Settings/Deleting%20account/ANALYSIS.md) |
| Settings/Enable client mode | 2 | [열기](flows/Settings/Enable%20client%20mode/ANALYSIS.md) |
| Settings/Editing branding settings | 6 | [열기](flows/Settings/Editing%20branding%20settings/ANALYSIS.md) |
| Settings/Uploading profile picture | 5 | [열기](flows/Settings/Uploading%20profile%20picture/ANALYSIS.md) |
| Settings/Editing notification settings | 4 | [열기](flows/Settings/Editing%20notification%20settings/ANALYSIS.md) |
| Settings/Importing a CSV | 11 | [열기](flows/Settings/Importing%20a%20CSV/ANALYSIS.md) |
| Settings/Removing a user | 4 | [열기](flows/Settings/Removing%20a%20user/ANALYSIS.md) |
| Settings/Disabling public profile | 3 | [열기](flows/Settings/Disabling%20public%20profile/ANALYSIS.md) |

## 자료 확인과 갱신

각 분석의 단계표에서 로컬 원본 이미지를 열 수 있다. 캡처에 없는 동작·정책은 각 분석의 8절에 기록했다. Gummble 자료를 갱신할 때는 각 분석 문서의 Flow ID와 단계별 Screen ID·순서를 다시 대조하고, 이미지와 분석을 함께 수정한다.

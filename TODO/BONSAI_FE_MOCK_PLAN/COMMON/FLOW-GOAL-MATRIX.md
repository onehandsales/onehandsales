# 원본 플로우와 구현 Goal 대응

로컬 ANALYSIS 기준 **134개 플로우·754단계·642개 고유 Screen ID**다. 각 단계는 아래 한 담당 G에 배정한다. 같은 Screen ID가 여러 플로우에서 등장할 수 있으며 사용자 행동의 연속 실행을 보장하지 않는다. 다른 G의 재사용·교차 검증은 담당 소유와 별도다.

계약 생성은 G40(1~12)과 G41(13~19)로 나뉜다. 원본 문서의 8절 질문은 각 소비 명세의 체크리스트에 포함되어 있다. 본 표는 배정표이며 구현 완료표가 아니다. 기계 검증용 Screen ID와 범위는 [PLAN-INDEX.json](PLAN-INDEX.json)에 있다.

| 번호 | 원본 ANALYSIS | Flow ID | 단계 수 | 담당 Goal·단계 |
| --- | --- | --- | --- | --- |
| 1 | [404](<../../../bonsai_analysis/flows/404/ANALYSIS.md>) | `b340c3e3-ad5f-401c-839d-60e02a8c7ce2` | 2 | [G14 앱 셸·사이드바·404](<GOAL-SPECS/G14.md>) (01~02) |
| 2 | [Accepting an invitation](<../../../bonsai_analysis/flows/Accepting an invitation/ANALYSIS.md>) | `08d7796f-33e4-4742-9a98-04c919916456` | 13 | [G18 초대 수락·협업자 접근](<GOAL-SPECS/G18.md>) (01~13) |
| 3 | [Adding a new client](<../../../bonsai_analysis/flows/Adding a new client/ANALYSIS.md>) | `a5f7a722-8a0c-4528-966a-903e7e0873fb` | 7 | [G19 목록·신규 고객·상세](<GOAL-SPECS/G19.md>) (01~07) |
| 4 | [Affiliate Program](<../../../bonsai_analysis/flows/Affiliate Program/ANALYSIS.md>) | `fcb41661-2520-40ac-842c-b463a7891093` | 4 | [G09 제휴·채용·정책 안내](<GOAL-SPECS/G09.md>) (01~04) |
| 5 | [Blog](<../../../bonsai_analysis/flows/Blog/ANALYSIS.md>) | `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` | 4 | [G05 블로그·검색·상세](<GOAL-SPECS/G05.md>) (01~04) |
| 6 | [Blog / Blog detail](<../../../bonsai_analysis/flows/Blog/Blog detail/ANALYSIS.md>) | `7b469aed-f69f-4f73-af50-9b1adb7aa052` | 4 | [G05 블로그·검색·상세](<GOAL-SPECS/G05.md>) (01~04) |
| 7 | [Blog / Searching blog](<../../../bonsai_analysis/flows/Blog/Searching blog/ANALYSIS.md>) | `d9c648a4-1d8f-47a7-b53e-ea08055e1e7e` | 3 | [G05 블로그·검색·상세](<GOAL-SPECS/G05.md>) (01~03) |
| 8 | [Bookkeeping / Adding a bookkeeping category](<../../../bonsai_analysis/flows/Bookkeeping/Adding a bookkeeping category/ANALYSIS.md>) | `3a74090f-e360-4fb9-9b79-c1ca197708ba` | 6 | [G63 장부 진입·비용 분류](<GOAL-SPECS/G63.md>) (01~06) |
| 9 | [Bookkeeping / Adding a recurring expense / Adding an image and note](<../../../bonsai_analysis/flows/Bookkeeping/Adding a recurring expense/Adding an image and note/ANALYSIS.md>) | `9fcdb469-f302-4610-b0b9-a5af091b5b26` | 5 | [G64 비용 생성·반복·첨부·메모](<GOAL-SPECS/G64.md>) (01~05) |
| 10 | [Bookkeeping / Adding a recurring expense](<../../../bonsai_analysis/flows/Bookkeeping/Adding a recurring expense/ANALYSIS.md>) | `f01f87a5-8396-4774-8387-e11c5e0afe03` | 11 | [G64 비용 생성·반복·첨부·메모](<GOAL-SPECS/G64.md>) (01~11) |
| 11 | [Bookkeeping](<../../../bonsai_analysis/flows/Bookkeeping/ANALYSIS.md>) | `05c04967-f1be-4b73-b6e5-af6199228187` | 7 | [G63 장부 진입·비용 분류](<GOAL-SPECS/G63.md>) (01~07) |
| 12 | [Bookkeeping / Bookkeeping overview](<../../../bonsai_analysis/flows/Bookkeeping/Bookkeeping overview/ANALYSIS.md>) | `2c50f586-bb35-480c-a7bc-fdd3857a6f81` | 6 | [G69 장부 손익·기간 집계](<GOAL-SPECS/G69.md>) (01~06) |
| 13 | [Bookkeeping / Bulk editing expenses](<../../../bonsai_analysis/flows/Bookkeeping/Bulk editing expenses/ANALYSIS.md>) | `91d17dc8-8701-405e-9133-a41f0f55c37c` | 7 | [G65 비용 일괄 편집](<GOAL-SPECS/G65.md>) (01~07) |
| 14 | [Bookkeeping / Connect bank account](<../../../bonsai_analysis/flows/Bookkeeping/Connect bank account/ANALYSIS.md>) | `c2673683-a5fc-4ed3-8c5c-be153e99765a` | 3 | [G70 은행 연결 소개·취소·미연결 상태](<GOAL-SPECS/G70.md>) (01~03) |
| 15 | [Bookkeeping / Deleting an income](<../../../bonsai_analysis/flows/Bookkeeping/Deleting an income/ANALYSIS.md>) | `187433ca-53fc-4a69-9f8b-82cd0b59a428` | 4 | [G67 수기 수입 생성·삭제](<GOAL-SPECS/G67.md>) (01~04) |
| 16 | [Bookkeeping / Downloading expenses](<../../../bonsai_analysis/flows/Bookkeeping/Downloading expenses/ANALYSIS.md>) | `a8f62075-1597-47e6-855d-c5fd51194c1c` | 4 | [G68 비용 내보내기](<GOAL-SPECS/G68.md>) (01~04) |
| 17 | [Bookkeeping / Filtering expenses](<../../../bonsai_analysis/flows/Bookkeeping/Filtering expenses/ANALYSIS.md>) | `bd0a6592-522b-4dcd-94ff-68324e44e3b0` | 10 | [G66 비용 필터](<GOAL-SPECS/G66.md>) (01~10) |
| 18 | [Careers](<../../../bonsai_analysis/flows/Careers/ANALYSIS.md>) | `35234808-9af8-4240-9025-e24a5951eaa9` | 4 | [G09 제휴·채용·정책 안내](<GOAL-SPECS/G09.md>) (01~04) |
| 19 | [Clients / Adding a client field](<../../../bonsai_analysis/flows/Clients/Adding a client field/ANALYSIS.md>) | `87c1f8ab-d786-4b2c-9861-d75e5813e639` | 4 | [G20 고객 필드·이미지](<GOAL-SPECS/G20.md>) (01~04) |
| 20 | [Clients / Adding a new project (Clients)](<../../../bonsai_analysis/flows/Clients/Adding a new project (Clients)/ANALYSIS.md>) | `dd29b56e-cc30-4875-8f7b-302ca3909d05` | 5 | [G21 두 진입점의 프로젝트 생성](<GOAL-SPECS/G21.md>) (01~05) |
| 21 | [Clients](<../../../bonsai_analysis/flows/Clients/ANALYSIS.md>) | `f8191fa7-f2d9-4060-bd47-891b2d627aaa` | 5 | [G19 목록·신규 고객·상세](<GOAL-SPECS/G19.md>) (01~05) |
| 22 | [Clients / Enabling portal access](<../../../bonsai_analysis/flows/Clients/Enabling portal access/ANALYSIS.md>) | `0cf1b411-06f2-4fc9-8af4-30148a3e88e2` | 2 | [G73 관리자 포털 설정](<GOAL-SPECS/G73.md>) (01~02) |
| 23 | [Clients / Uploading a client image](<../../../bonsai_analysis/flows/Clients/Uploading a client image/ANALYSIS.md>) | `44e00e8a-aa9f-41f1-b9bc-682789c80985` | 3 | [G20 고객 필드·이미지](<GOAL-SPECS/G20.md>) (01~03) |
| 24 | [Contact Us](<../../../bonsai_analysis/flows/Contact Us/ANALYSIS.md>) | `5ea077df-b21b-4455-8b53-bbd8901d54ae` | 2 | [G08 도움말·기사·문의](<GOAL-SPECS/G08.md>) (01~02) |
| 25 | [Copying referral link](<../../../bonsai_analysis/flows/Copying referral link/ANALYSIS.md>) | `0744777e-0613-4157-b1e2-a1ac0854db27` | 4 | [G81 추천 링크](<GOAL-SPECS/G81.md>) (01~04) |
| 26 | [Creating a new contract](<../../../bonsai_analysis/flows/Creating a new contract/ANALYSIS.md>) | `6a26536d-43db-4d46-b0a3-22be61b34b36` | 19 | [G40 기본 정보·업무 범위](<GOAL-SPECS/G40.md>) (01~12) · [G41 지급 조건·청구 설정·초안](<GOAL-SPECS/G41.md>) (13~19) |
| 27 | [Creating a new contract / Contract guide tour](<../../../bonsai_analysis/flows/Creating a new contract/Contract guide tour/ANALYSIS.md>) | `03c89447-e059-4f05-b9f3-7b1430640cb1` | 4 | [G42 초안 투어·편집 방식 전환](<GOAL-SPECS/G42.md>) (01~04) |
| 28 | [Creating a new contract / Converting contract type](<../../../bonsai_analysis/flows/Creating a new contract/Converting contract type/ANALYSIS.md>) | `3903d09f-3610-46dd-808a-2e1017a411d5` | 3 | [G42 초안 투어·편집 방식 전환](<GOAL-SPECS/G42.md>) (01~03) |
| 29 | [Creating a new contract / Signing a contract](<../../../bonsai_analysis/flows/Creating a new contract/Signing a contract/ANALYSIS.md>) | `9c947be2-ae51-481b-953f-f7d65a3a366e` | 5 | [G43 작성자 서명](<GOAL-SPECS/G43.md>) (01~05) |
| 30 | [Creating a proposal](<../../../bonsai_analysis/flows/Creating a proposal/ANALYSIS.md>) | `60d9a6ef-22e9-463e-bcbb-ebd993a06e02` | 12 | [G36 템플릿 선택·초안 생성](<GOAL-SPECS/G36.md>) (01~12) |
| 31 | [Creating a proposal / Archiving a proposal](<../../../bonsai_analysis/flows/Creating a proposal/Archiving a proposal/ANALYSIS.md>) | `2ea53e4d-6f67-4621-bb41-c56eeb054811` | 5 | [G39 내부 수락 처리·보관](<GOAL-SPECS/G39.md>) (01~05) |
| 32 | [Creating a proposal / Changing theme](<../../../bonsai_analysis/flows/Creating a proposal/Changing theme/ANALYSIS.md>) | `5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0` | 6 | [G37 테마·헤더 스타일](<GOAL-SPECS/G37.md>) (01~06) |
| 33 | [Creating a proposal / Creating a new automation](<../../../bonsai_analysis/flows/Creating a proposal/Creating a new automation/ANALYSIS.md>) | `b4fff91d-639e-4818-9ec8-4dc1bfc3a18a` | 6 | [G54 제안서 수락 후 예약 안내 규칙](<GOAL-SPECS/G54.md>) (01~06) |
| 34 | [Creating a proposal / Editing header style](<../../../bonsai_analysis/flows/Creating a proposal/Editing header style/ANALYSIS.md>) | `b8c9b3db-6f13-454c-8abf-52859fd329e5` | 7 | [G37 테마·헤더 스타일](<GOAL-SPECS/G37.md>) (01~07) |
| 35 | [Creating a proposal / Marking as accepted](<../../../bonsai_analysis/flows/Creating a proposal/Marking as accepted/ANALYSIS.md>) | `7f481864-a5f0-4786-a800-334c1637b819` | 6 | [G39 내부 수락 처리·보관](<GOAL-SPECS/G39.md>) (01~06) |
| 36 | [Creating a proposal / Sending a proposal](<../../../bonsai_analysis/flows/Creating a proposal/Sending a proposal/ANALYSIS.md>) | `21548d39-a3a9-4f72-883d-250c6a60c774` | 8 | [G38 만료 설정·발송](<GOAL-SPECS/G38.md>) (01~08) |
| 37 | [Creating a proposal / Setting proposal expiration date](<../../../bonsai_analysis/flows/Creating a proposal/Setting proposal expiration date/ANALYSIS.md>) | `b597e800-c771-4e17-8ddb-1167f2a61deb` | 6 | [G38 만료 설정·발송](<GOAL-SPECS/G38.md>) (01~06) |
| 38 | [Dashboard / Adding company details](<../../../bonsai_analysis/flows/Dashboard/Adding company details/ANALYSIS.md>) | `a346e78b-8075-4537-ae03-d377056d237a` | 8 | [G15 회사 정보·로고·공개 프로필](<GOAL-SPECS/G15.md>) (01~08) |
| 39 | [Dashboard / Adding company details / Uploading company logo](<../../../bonsai_analysis/flows/Dashboard/Adding company details/Uploading company logo/ANALYSIS.md>) | `29e9a0b7-4ba1-4970-9790-08e7d46bc38e` | 4 | [G15 회사 정보·로고·공개 프로필](<GOAL-SPECS/G15.md>) (01~04) |
| 40 | [Dashboard / Adding income manually](<../../../bonsai_analysis/flows/Dashboard/Adding income manually/ANALYSIS.md>) | `5b74c74e-20d1-4811-8d96-864144e38a65` | 11 | [G67 수기 수입 생성·삭제](<GOAL-SPECS/G67.md>) (01~11) |
| 41 | [Dashboard](<../../../bonsai_analysis/flows/Dashboard/ANALYSIS.md>) | `a15f8066-29c2-457a-beea-e0e83b8d4dde` | 8 | [G72 대시보드 요약·활동](<GOAL-SPECS/G72.md>) (01~08) |
| 42 | [Dashboard / Connecting to Google Calendar / Adding event details](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Adding event details/ANALYSIS.md>) | `4e44dbea-bf16-4dbf-a350-472b1b419248` | 5 | [G50 예약 기본 정보·가용 시간](<GOAL-SPECS/G50.md>) (01~05) |
| 43 | [Dashboard / Connecting to Google Calendar](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/ANALYSIS.md>) | `eb3647ee-e2ea-4435-bdf6-291ebd62f550` | 8 | [G49 캘린더 연결 상태](<GOAL-SPECS/G49.md>) (01~08) |
| 44 | [Dashboard / Connecting to Google Calendar / Editing advanced settings](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing advanced settings/ANALYSIS.md>) | `dc6c28b1-c2c2-4118-9358-3578b336031e` | 5 | [G51 고급 설정·브랜딩·유형 생성](<GOAL-SPECS/G51.md>) (01~05) |
| 45 | [Dashboard / Connecting to Google Calendar / Editing an event type](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing an event type/ANALYSIS.md>) | `b126bdbf-4f4f-455e-b62a-b9413b8fb7e7` | 5 | [G52 유형 목록·편집·링크 복사](<GOAL-SPECS/G52.md>) (01~05) |
| 46 | [Dashboard / Connecting to Google Calendar / Editing branding & design](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing branding & design/ANALYSIS.md>) | `d9ed6982-0264-44ed-bb1a-82ad16b0e89f` | 10 | [G51 고급 설정·브랜딩·유형 생성](<GOAL-SPECS/G51.md>) (01~10) |
| 47 | [Dashboard / Connecting to Google Calendar / Setting up availability](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Setting up availability/ANALYSIS.md>) | `5da62684-3be7-48ac-923f-4fdf585d7db1` | 8 | [G50 예약 기본 정보·가용 시간](<GOAL-SPECS/G50.md>) (01~08) |
| 48 | [Dashboard / Connecting to Google Calendar / View booking page](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/View booking page/ANALYSIS.md>) | `dfb2447e-8490-4b16-aeff-edd8101fb0ac` | 4 | [G53 공개 날짜·슬롯 조회](<GOAL-SPECS/G53.md>) (01~04) |
| 49 | [Dashboard / Create a contact form (template)](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/ANALYSIS.md>) | `be21a04b-0006-4c0c-86bd-4a536d9e7c71` | 5 | [G44 템플릿 탐색·검색·적용](<GOAL-SPECS/G44.md>) (01~05) |
| 50 | [Dashboard / Create a contact form (template) / Filtering contact templates](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/Filtering contact templates/ANALYSIS.md>) | `71620f3c-7759-4c18-8fa3-164e3d3e2256` | 4 | [G44 템플릿 탐색·검색·적용](<GOAL-SPECS/G44.md>) (01~04) |
| 51 | [Dashboard / Create a contact form (template) / Searching templates](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/Searching templates/ANALYSIS.md>) | `b3dc7ca0-f03d-4a87-b0e2-84c08aa27400` | 3 | [G44 템플릿 탐색·검색·적용](<GOAL-SPECS/G44.md>) (01~03) |
| 52 | [Dashboard / Create a contact form (template) / Using a template](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/Using a template/ANALYSIS.md>) | `0888ad18-25b5-43aa-be17-ae21f1859ea0` | 5 | [G44 템플릿 탐색·검색·적용](<GOAL-SPECS/G44.md>) (01~05) |
| 53 | [Dashboard / Hiding sidebar](<../../../bonsai_analysis/flows/Dashboard/Hiding sidebar/ANALYSIS.md>) | `ff646f32-f010-478e-a3bd-572ccc501292` | 3 | [G14 앱 셸·사이드바·404](<GOAL-SPECS/G14.md>) (01~03) |
| 54 | [Dashboard / Marking a task as complete](<../../../bonsai_analysis/flows/Dashboard/Marking a task as complete/ANALYSIS.md>) | `4b420645-a17a-4219-9699-5f8081649f02` | 2 | [G28 상태 정의·완료 표시](<GOAL-SPECS/G28.md>) (01~02) |
| 55 | [Filtering all templates](<../../../bonsai_analysis/flows/Filtering all templates/ANALYSIS.md>) | `89d6f212-12fc-4ad4-b11c-0bbd29708101` | 5 | [G06 공개 템플릿·상세·파일 형식](<GOAL-SPECS/G06.md>) (01~05) |
| 56 | [Filtering all templates / Template detail](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/ANALYSIS.md>) | `4fe6aa73-a216-43cb-87ff-be898ffc869c` | 5 | [G06 공개 템플릿·상세·파일 형식](<GOAL-SPECS/G06.md>) (01~05) |
| 57 | [Forms / Adding questions to a form](<../../../bonsai_analysis/flows/Forms/Adding questions to a form/ANALYSIS.md>) | `0452bfda-8ddd-4d2f-8314-7370006c6c68` | 5 | [G45 폼 목록·질문 편집·순서](<GOAL-SPECS/G45.md>) (01~05) |
| 58 | [Forms](<../../../bonsai_analysis/flows/Forms/ANALYSIS.md>) | `d265eece-4da9-4fd4-91f3-517dc07cd8d5` | 2 | [G45 폼 목록·질문 편집·순서](<GOAL-SPECS/G45.md>) (01~02) |
| 59 | [Forms / Form responses](<../../../bonsai_analysis/flows/Forms/Form responses/ANALYSIS.md>) | `ecd1821a-aa3a-40f6-beff-71e924dfb56f` | 5 | [G46 폼 설정·게시·응답 목록](<GOAL-SPECS/G46.md>) (01~05) |
| 60 | [Forms / Form responses / Giving a response](<../../../bonsai_analysis/flows/Forms/Form responses/Giving a response/ANALYSIS.md>) | `b3f0ee03-c692-4960-8ed0-a8e15c1b4def` | 9 | [G48 공개 응답 제출·상세](<GOAL-SPECS/G48.md>) (01~09) |
| 61 | [Forms / Form responses / Response detail](<../../../bonsai_analysis/flows/Forms/Form responses/Response detail/ANALYSIS.md>) | `31b9d879-ab36-4255-a0e5-34cc4266ce9c` | 4 | [G48 공개 응답 제출·상세](<GOAL-SPECS/G48.md>) (01~04) |
| 62 | [Forms / Reordering questions](<../../../bonsai_analysis/flows/Forms/Reordering questions/ANALYSIS.md>) | `68ec72c2-b771-428b-98b7-256018628743` | 3 | [G45 폼 목록·질문 편집·순서](<GOAL-SPECS/G45.md>) (01~03) |
| 63 | [Forms / Sharing a form](<../../../bonsai_analysis/flows/Forms/Sharing a form/ANALYSIS.md>) | `93ea3af8-3cce-49ec-aaa0-b7d4e9676924` | 8 | [G47 링크·임베드·이메일 공유](<GOAL-SPECS/G47.md>) (01~08) |
| 64 | [Freelancers](<../../../bonsai_analysis/flows/Freelancers/ANALYSIS.md>) | `2eeced8d-a39f-4cf1-8f38-0a5b8f989c54` | 4 | [G03 고객군·업종·CRM 소개](<GOAL-SPECS/G03.md>) (01~04) |
| 65 | [Help Center](<../../../bonsai_analysis/flows/Help Center/ANALYSIS.md>) | `4f8c359f-2e1f-46bd-953b-bd601767a0f1` | 2 | [G08 도움말·기사·문의](<GOAL-SPECS/G08.md>) (01~02) |
| 66 | [Help Center / Help article detail](<../../../bonsai_analysis/flows/Help Center/Help article detail/ANALYSIS.md>) | `ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf` | 4 | [G08 도움말·기사·문의](<GOAL-SPECS/G08.md>) (01~04) |
| 67 | [Industries (Consulting)](<../../../bonsai_analysis/flows/Industries (Consulting)/ANALYSIS.md>) | `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` | 8 | [G03 고객군·업종·CRM 소개](<GOAL-SPECS/G03.md>) (01~08) |
| 68 | [Inviting a member](<../../../bonsai_analysis/flows/Inviting a member/ANALYSIS.md>) | `646bd9c2-add0-414c-8b98-89489f2c43b5` | 5 | [G17 멤버 초대·대기 초대 제거](<GOAL-SPECS/G17.md>) (01~05) |
| 69 | [Invoice templates](<../../../bonsai_analysis/flows/Invoice templates/ANALYSIS.md>) | `a0181c28-2521-46d3-a0e6-3ead4851b2f9` | 11 | [G06 공개 템플릿·상세·파일 형식](<GOAL-SPECS/G06.md>) (01~11) |
| 70 | [Invoices / Adding a new invoice / Adding unbilled time](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Adding unbilled time/ANALYSIS.md>) | `9a40f1e9-2362-4d00-a603-3f48febb5438` | 5 | [G59 미청구 시간 편입](<GOAL-SPECS/G59.md>) (01~05) |
| 71 | [Invoices / Adding a new invoice](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/ANALYSIS.md>) | `18f62aba-c34e-486a-b2b8-099fcf9ba779` | 8 | [G57 단일·반복·구독 초안](<GOAL-SPECS/G57.md>) (01~08) |
| 72 | [Invoices / Adding a new invoice / Editing an item](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Editing an item/ANALYSIS.md>) | `be9884fd-760f-4d30-b3e0-92b55ad8274c` | 5 | [G58 항목·서비스·헤더 편집](<GOAL-SPECS/G58.md>) (01~05) |
| 73 | [Invoices / Adding a new invoice / Editing invoice header](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Editing invoice header/ANALYSIS.md>) | `8eb71ff6-6686-4e7f-8092-5036ebff452f` | 2 | [G58 항목·서비스·헤더 편집](<GOAL-SPECS/G58.md>) (01~02) |
| 74 | [Invoices / Adding a new invoice / Enable auto-sending](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Enable auto-sending/ANALYSIS.md>) | `20115575-4590-4c0c-a009-7062c5f936ab` | 3 | [G61 자동 발송 오류·보완 경로](<GOAL-SPECS/G61.md>) (01~03) |
| 75 | [Invoices / Adding a new invoice / Preview invoice](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Preview invoice/ANALYSIS.md>) | `3170e524-0da8-4acd-aaaa-33c3d0217288` | 3 | [G60 고객 미리보기](<GOAL-SPECS/G60.md>) (01~03) |
| 76 | [Invoices / Adding a new invoice / Record payment](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Record payment/ANALYSIS.md>) | `085fa1f3-f846-4dac-9bbd-0b65f000a427` | 3 | [G62 입금 차단·정상 경로 보완](<GOAL-SPECS/G62.md>) (01~03) |
| 77 | [Invoices](<../../../bonsai_analysis/flows/Invoices/ANALYSIS.md>) | `0ede7d7b-1ed5-487a-9dbd-b63ef818a29e` | 4 | [G55 목록·기본값·표시 설정](<GOAL-SPECS/G55.md>) (01~04) |
| 78 | [Invoices / Connecting to Stripe](<../../../bonsai_analysis/flows/Invoices/Connecting to Stripe/ANALYSIS.md>) | `f4f79868-6066-440d-9432-cec83923c392` | 10 | [G56 Stripe 연결·카드 수납 토글](<GOAL-SPECS/G56.md>) (01~10) |
| 79 | [Invoices / Connecting to Stripe / Turning off card payments](<../../../bonsai_analysis/flows/Invoices/Connecting to Stripe/Turning off card payments/ANALYSIS.md>) | `565b66ad-85f3-48ce-a384-fb856c5dd782` | 2 | [G56 Stripe 연결·카드 수납 토글](<GOAL-SPECS/G56.md>) (01~02) |
| 80 | [Invoices / Editing default values (Invoices)](<../../../bonsai_analysis/flows/Invoices/Editing default values (Invoices)/ANALYSIS.md>) | `a0f52cca-9fee-46e5-af2b-369e1db5e602` | 4 | [G55 목록·기본값·표시 설정](<GOAL-SPECS/G55.md>) (01~04) |
| 81 | [Invoices / Updating invoice settings](<../../../bonsai_analysis/flows/Invoices/Updating invoice settings/ANALYSIS.md>) | `4a05877b-fd77-4532-a407-7c93a2168895` | 5 | [G55 목록·기본값·표시 설정](<GOAL-SPECS/G55.md>) (01~05) |
| 82 | [Landing page](<../../../bonsai_analysis/flows/Landing page/ANALYSIS.md>) | `f1a89cc0-4dc8-4576-b912-78231a2a7b1a` | 11 | [G02 랜딩·공통 메뉴](<GOAL-SPECS/G02.md>) (01~11) |
| 83 | [Logging in](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) | `a02409b3-6eb0-4bc0-b702-22a42e0990c8` | 5 | [G11 로그인·로그아웃](<GOAL-SPECS/G11.md>) (01~05) |
| 84 | [Logging in / Resetting password](<../../../bonsai_analysis/flows/Logging in/Resetting password/ANALYSIS.md>) | `8f9cc02b-1748-4b71-97d8-5c80bb299013` | 10 | [G12 비밀번호 재설정](<GOAL-SPECS/G12.md>) (01~10) |
| 85 | [Logging out](<../../../bonsai_analysis/flows/Logging out/ANALYSIS.md>) | `39713c9a-6f82-4d7c-be32-ab38510406bc` | 2 | [G11 로그인·로그아웃](<GOAL-SPECS/G11.md>) (01~02) |
| 86 | [Onboarding](<../../../bonsai_analysis/flows/Onboarding/ANALYSIS.md>) | `f714101f-db6b-4bfe-9ed1-74d6b0d6243c` | 10 | [G10 회원가입](<GOAL-SPECS/G10.md>) (01~10) |
| 87 | [Onboarding / Completing account setup](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) | `f004afc2-a8c5-4262-b2e4-941331047a84` | 16 | [G13 사업 설정 온보딩](<GOAL-SPECS/G13.md>) (01~16) |
| 88 | [Perks](<../../../bonsai_analysis/flows/Perks/ANALYSIS.md>) | `dee9aba7-13a6-462f-87f5-0a942a971ab0` | 4 | [G82 제휴 혜택](<GOAL-SPECS/G82.md>) (01~04) |
| 89 | [Pricing](<../../../bonsai_analysis/flows/Pricing/ANALYSIS.md>) | `981ffcc3-d6c0-4038-8db3-4ac8753aace4` | 3 | [G04 가격·후기](<GOAL-SPECS/G04.md>) (01~03) |
| 90 | [Privacy](<../../../bonsai_analysis/flows/Privacy/ANALYSIS.md>) | `776f20e2-7498-433f-af8b-f585988e2429` | 2 | [G09 제휴·채용·정책 안내](<GOAL-SPECS/G09.md>) (01~02) |
| 91 | [Products (CRM)](<../../../bonsai_analysis/flows/Products (CRM)/ANALYSIS.md>) | `12ca870d-d929-4cc8-ab4c-60436c2eac13` | 10 | [G03 고객군·업종·CRM 소개](<GOAL-SPECS/G03.md>) (01~10) |
| 92 | [Project detail / Adding a task / Adding a comment](<../../../bonsai_analysis/flows/Project detail/Adding a task/Adding a comment/ANALYSIS.md>) | `1a0794d4-deb5-4eb3-b391-c7371c60e684` | 3 | [G27 댓글·활동](<GOAL-SPECS/G27.md>) (01~03) |
| 93 | [Project detail / Adding a task / Adding a time entry](<../../../bonsai_analysis/flows/Project detail/Adding a task/Adding a time entry/ANALYSIS.md>) | `38dcad7d-b2da-4d91-8eb3-2f3b39899b66` | 6 | [G33 수동 시간 입력](<GOAL-SPECS/G33.md>) (01~06) |
| 94 | [Project detail / Adding a task / Adding subtasks](<../../../bonsai_analysis/flows/Project detail/Adding a task/Adding subtasks/ANALYSIS.md>) | `b8bd1036-63f8-4e27-b2b7-a76abf4d8f10` | 10 | [G26 하위 작업·담당자](<GOAL-SPECS/G26.md>) (01~10) |
| 95 | [Project detail / Adding a task](<../../../bonsai_analysis/flows/Project detail/Adding a task/ANALYSIS.md>) | `ee93ca39-d45a-4937-8ee6-7193c985b590` | 6 | [G25 전체·프로젝트 작업 보드와 생성](<GOAL-SPECS/G25.md>) (01~06) |
| 96 | [Project detail / Adding a task / Archiving a task](<../../../bonsai_analysis/flows/Project detail/Adding a task/Archiving a task/ANALYSIS.md>) | `cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e` | 3 | [G29 보관·삭제](<GOAL-SPECS/G29.md>) (01~03) |
| 97 | [Project detail / Adding a task / Continue tracking time](<../../../bonsai_analysis/flows/Project detail/Adding a task/Continue tracking time/ANALYSIS.md>) | `bbcfb9da-b056-42d0-bb2d-113093d50a8e` | 5 | [G32 전역·작업 타이머](<GOAL-SPECS/G32.md>) (01~05) |
| 98 | [Project detail / Adding a task / Deleting a task](<../../../bonsai_analysis/flows/Project detail/Adding a task/Deleting a task/ANALYSIS.md>) | `7ca1185e-e3a0-460c-825e-68035a603593` | 4 | [G29 보관·삭제](<GOAL-SPECS/G29.md>) (01~04) |
| 99 | [Project detail / Adding a task / Editing a subtask](<../../../bonsai_analysis/flows/Project detail/Adding a task/Editing a subtask/ANALYSIS.md>) | `eb7720d8-fb1d-405b-8058-3f1c21adf475` | 5 | [G26 하위 작업·담당자](<GOAL-SPECS/G26.md>) (01~05) |
| 100 | [Project detail / Adding a task / Editing status settings](<../../../bonsai_analysis/flows/Project detail/Adding a task/Editing status settings/ANALYSIS.md>) | `9dcc612c-ab47-4cc3-a2bb-1c434c7da582` | 6 | [G28 상태 정의·완료 표시](<GOAL-SPECS/G28.md>) (01~06) |
| 101 | [Project detail](<../../../bonsai_analysis/flows/Project detail/ANALYSIS.md>) | `669a7507-38b3-41aa-89a2-146530c42240` | 6 | [G24 프로젝트 상세·이름·설정](<GOAL-SPECS/G24.md>) (01~06) |
| 102 | [Project detail / Editing project name](<../../../bonsai_analysis/flows/Project detail/Editing project name/ANALYSIS.md>) | `436bff56-c6be-434a-97e4-1fa7b2526a91` | 4 | [G24 프로젝트 상세·이름·설정](<GOAL-SPECS/G24.md>) (01~04) |
| 103 | [Project detail / Editing project settings](<../../../bonsai_analysis/flows/Project detail/Editing project settings/ANALYSIS.md>) | `bca79d2d-7b8e-4f84-b35d-18adaec2cd06` | 4 | [G24 프로젝트 상세·이름·설정](<GOAL-SPECS/G24.md>) (01~04) |
| 104 | [Project detail / Updating project status](<../../../bonsai_analysis/flows/Project detail/Updating project status/ANALYSIS.md>) | `ac1750e4-906b-47f6-ad41-18c1861d4f71` | 4 | [G23 단계 이동·태그](<GOAL-SPECS/G23.md>) (01~04) |
| 105 | [Projects / Adding a tag](<../../../bonsai_analysis/flows/Projects/Adding a tag/ANALYSIS.md>) | `3aa597f9-f613-46dd-bd8c-45686e423865` | 9 | [G23 단계 이동·태그](<GOAL-SPECS/G23.md>) (01~09) |
| 106 | [Projects](<../../../bonsai_analysis/flows/Projects/ANALYSIS.md>) | `d1b4cb1f-9280-49ad-b60d-b10fc8bf713d` | 4 | [G22 보드·표 전환](<GOAL-SPECS/G22.md>) (01~04) |
| 107 | [Projects / Creating a project (Projects)](<../../../bonsai_analysis/flows/Projects/Creating a project (Projects)/ANALYSIS.md>) | `ddea1540-3c0b-4e00-8805-12b4adc290c1` | 6 | [G21 두 진입점의 프로젝트 생성](<GOAL-SPECS/G21.md>) (01~06) |
| 108 | [Projects / Reordering projects](<../../../bonsai_analysis/flows/Projects/Reordering projects/ANALYSIS.md>) | `c5e982aa-007d-4e20-8c8b-1fe3c276acc8` | 3 | [G23 단계 이동·태그](<GOAL-SPECS/G23.md>) (01~03) |
| 109 | [Projects / Switching to list view](<../../../bonsai_analysis/flows/Projects/Switching to list view/ANALYSIS.md>) | `c9dfa93e-36ea-436f-bdef-bc876f4897c5` | 3 | [G22 보드·표 전환](<GOAL-SPECS/G22.md>) (01~03) |
| 110 | [Reviews](<../../../bonsai_analysis/flows/Reviews/ANALYSIS.md>) | `d501af32-ef6e-4ca1-8d3f-cf6e67874a08` | 4 | [G04 가격·후기](<GOAL-SPECS/G04.md>) (01~04) |
| 111 | [Scheduling](<../../../bonsai_analysis/flows/Scheduling/ANALYSIS.md>) | `283afa82-3835-4672-9d26-a607351efa6b` | 2 | [G52 유형 목록·편집·링크 복사](<GOAL-SPECS/G52.md>) (01~02) |
| 112 | [Scheduling / Copying a booking page](<../../../bonsai_analysis/flows/Scheduling/Copying a booking page/ANALYSIS.md>) | `e2d05800-15f1-4b39-969c-290d5feee7fc` | 4 | [G52 유형 목록·편집·링크 복사](<GOAL-SPECS/G52.md>) (01~04) |
| 113 | [Searching Bonsai](<../../../bonsai_analysis/flows/Searching Bonsai/ANALYSIS.md>) | `f6466df8-7932-40c1-a10e-f84bfe1070f5` | 5 | [G71 전역 검색·최근 조회](<GOAL-SPECS/G71.md>) (01~05) |
| 114 | [Services / Adding a service to library](<../../../bonsai_analysis/flows/Services/Adding a service to library/ANALYSIS.md>) | `023d6e51-ce87-40a9-a628-cf7b39cd3b14` | 5 | [G35 서비스 라이브러리·템플릿 복사](<GOAL-SPECS/G35.md>) (01~05) |
| 115 | [Services](<../../../bonsai_analysis/flows/Services/ANALYSIS.md>) | `16a15a7f-2535-457e-838b-877a27767618` | 4 | [G35 서비스 라이브러리·템플릿 복사](<GOAL-SPECS/G35.md>) (01~04) |
| 116 | [Settings](<../../../bonsai_analysis/flows/Settings/ANALYSIS.md>) | `fe127bb6-984a-4b25-927f-4186b6650743` | 12 | [G74 설정 탐색·프로필·사진](<GOAL-SPECS/G74.md>) (01~12) |
| 117 | [Settings / Deleting account](<../../../bonsai_analysis/flows/Settings/Deleting account/ANALYSIS.md>) | `3d51760e-2893-42a1-ada6-a2c44849a54d` | 5 | [G76 계정 삭제 확인·로그인 복귀](<GOAL-SPECS/G76.md>) (01~05) |
| 118 | [Settings / Disabling public profile](<../../../bonsai_analysis/flows/Settings/Disabling public profile/ANALYSIS.md>) | `eb5394cb-70d0-4286-be72-3a6a0c240fd2` | 3 | [G15 회사 정보·로고·공개 프로필](<GOAL-SPECS/G15.md>) (01~03) |
| 119 | [Settings / Editing branding settings](<../../../bonsai_analysis/flows/Settings/Editing branding settings/ANALYSIS.md>) | `79468a76-f7fd-456e-843e-66c2763976a5` | 6 | [G16 문서 브랜드 기본값](<GOAL-SPECS/G16.md>) (01~06) |
| 120 | [Settings / Editing notification settings](<../../../bonsai_analysis/flows/Settings/Editing notification settings/ANALYSIS.md>) | `ac111df9-05db-467b-be5a-f58bc35913c0` | 4 | [G75 알림 선호](<GOAL-SPECS/G75.md>) (01~04) |
| 121 | [Settings / Enable client mode](<../../../bonsai_analysis/flows/Settings/Enable client mode/ANALYSIS.md>) | `3dce7a57-e3a1-4fd6-944a-3f547b30def6` | 2 | [G77 Client Mode 전환 게이트](<GOAL-SPECS/G77.md>) (01~02) |
| 122 | [Settings / Importing a CSV](<../../../bonsai_analysis/flows/Settings/Importing a CSV/ANALYSIS.md>) | `ad6f634b-9fff-44de-acdf-4cd1eaf69123` | 11 | [G78 CSV 가져오기·매핑·오류](<GOAL-SPECS/G78.md>) (01~11) |
| 123 | [Settings / Removing a user](<../../../bonsai_analysis/flows/Settings/Removing a user/ANALYSIS.md>) | `c615a678-2203-45d5-bcc0-235f6b325516` | 4 | [G17 멤버 초대·대기 초대 제거](<GOAL-SPECS/G17.md>) (01~04) |
| 124 | [Settings / Uploading profile picture](<../../../bonsai_analysis/flows/Settings/Uploading profile picture/ANALYSIS.md>) | `7f83211c-f4cf-4bc7-a715-c64a2a27626b` | 5 | [G74 설정 탐색·프로필·사진](<GOAL-SPECS/G74.md>) (01~05) |
| 125 | [Starting time tracking](<../../../bonsai_analysis/flows/Starting time tracking/ANALYSIS.md>) | `06d57391-c7a4-4f63-ba8d-078ea3af046f` | 10 | [G32 전역·작업 타이머](<GOAL-SPECS/G32.md>) (01~10) |
| 126 | [Subscribing to Starter plan](<../../../bonsai_analysis/flows/Subscribing to Starter plan/ANALYSIS.md>) | `89302289-1851-4066-91e4-d61a28f79e15` | 12 | [G79 플랜 가입·청구 표시](<GOAL-SPECS/G79.md>) (01~12) |
| 127 | [Subscribing to Starter plan / Canceling subscription](<../../../bonsai_analysis/flows/Subscribing to Starter plan/Canceling subscription/ANALYSIS.md>) | `89fb5b3c-c982-48a3-a713-b70f07d8c544` | 10 | [G80 구독 해지 예약](<GOAL-SPECS/G80.md>) (01~10) |
| 128 | [Tasks / Adding a task (template)](<../../../bonsai_analysis/flows/Tasks/Adding a task (template)/ANALYSIS.md>) | `d348e200-5e48-4825-a646-69a6741e85d8` | 7 | [G31 작업 템플릿 적용](<GOAL-SPECS/G31.md>) (01~07) |
| 129 | [Tasks](<../../../bonsai_analysis/flows/Tasks/ANALYSIS.md>) | `59d5186e-98e3-495f-b8c0-96eb9c943631` | 3 | [G25 전체·프로젝트 작업 보드와 생성](<GOAL-SPECS/G25.md>) (01~03) |
| 130 | [Tasks / Creating a task template](<../../../bonsai_analysis/flows/Tasks/Creating a task template/ANALYSIS.md>) | `4c98a858-6ef7-4a6a-8e83-e626772a4df0` | 4 | [G30 작업 템플릿 작성](<GOAL-SPECS/G30.md>) (01~04) |
| 131 | [Tasks / Editing a template task](<../../../bonsai_analysis/flows/Tasks/Editing a template task/ANALYSIS.md>) | `91a75fcf-9857-41ff-85c2-c2de0bae87d9` | 8 | [G30 작업 템플릿 작성](<GOAL-SPECS/G30.md>) (01~08) |
| 132 | [Terms & Conditions](<../../../bonsai_analysis/flows/Terms & Conditions/ANALYSIS.md>) | `912b4b75-77bb-43fa-b86f-d85c6117841a` | 1 | [G09 제휴·채용·정책 안내](<GOAL-SPECS/G09.md>) (01~01) |
| 133 | [Time Tracking](<../../../bonsai_analysis/flows/Time Tracking/ANALYSIS.md>) | `525f8723-dca6-4932-ac6e-d159249090be` | 6 | [G34 시간 목록·인사이트](<GOAL-SPECS/G34.md>) (01~06) |
| 134 | [Using invoice generator](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) | `1a82151c-9539-4a12-8a4d-706c8557370b` | 5 | [G07 공개 청구서 생성기](<GOAL-SPECS/G07.md>) (01~05) |

## G01 공통 요소 재사용 기록

G01은 개별 업무 단계를 소유하거나 완료하지 않는다. Logging in 02(G11), Adding a new client 03(G19), Adding a bookkeeping category 02(G63)의 공통 요소를 참고했다. 업무 단계 배정은 그대로다. [G01 비교 결과](../RESULTS/G01_RESULT.md)와 원본 전체 폼 구현을 구분한다.

## G05~G09 소비 결과와 연결 대기 (2026-11-21)

원본 소유 단계 배정은 유지한다. [G05 블로그](../RESULTS/G05_RESULT.md)·[G06 공개 템플릿](../RESULTS/G06_RESULT.md)·[G07 생성기](../RESULTS/G07_RESULT.md)·[G08 도움말](../RESULTS/G08_RESULT.md)·[G09 회사/정책](../RESULTS/G09_RESULT.md)의 목 UI/검토/현재 검증과 미수록·시각·환경 대기를 분리한다. G06 선택/파일 형식과 G07 초안, G02~G05 이메일/가격 인계는 G10~G13 후 G14에서 왕복 검증한다. 도움말 앱 진입도 G11/G14에서 연결한다. R01 전체와 G10 이후 화면 완료를 뜻하지 않는다.

R02 G10~G13: [43단계 소비 분석](../RESULTS/R02_RESULT.md). 가입10단계/로그인5/로그아웃2/복구10/사업설정16의 기존 소유권 유지. 가입→온보딩 G13·공개 인계 왕복 G14·회사 정보 G15 연결을 추적한다. 미수록 설문3단계는 새 원본 단계로 등록하지 않는다.

### G10 연결 상태 (2026-11-21)

Onboarding01~09 가입/이메일·선택 인계→새 가상 session까지 검증. 10단계 실제 사업 설정은 G13, 선택한 플랜/template/format/invoice의 최종 복귀·로그아웃은 G14에서 확인한다. [G10 결과](../RESULTS/G10_RESULT.md).

G11: Logging in02~04/Logging out01~02 목 인증과 보호 복귀 검증. 로그인05 내부 셸/선택 복귀는 G14, 미완료 계정은 G13 연결 대기. [결과](../RESULTS/G11_RESULT.md).

G12: Resetting password01~10 목 요청/복구/빈 로그인·같은 계정 검증. [결과](../RESULTS/G12_RESULT.md). G14 종합 복귀 대기.

G13: Completing account setup01~16 관찰 설문·미수록 안내·초안·동일 회사 저장 검증. [결과](../RESULTS/G13_RESULT.md). G14 셸/공개 복귀, G15 회사 편집 연결 대기.

### G14 연결 갱신 (2026-11-21)

G14 40401~02/Hiding sidebar01~03의 목 셸/복구·공개 인증 왕복 검증. 본문의 업무 대시보드는 G72 등 후속 소유이며 G13 빈 상태를 재사용한다. [결과](../RESULTS/G14_RESULT.md).

### G15 이후 최종 갱신 (2026-11-21)

G15 Adding company details01~08·Uploading logo01~04·Disabling public profile01~03을 같은 회사 목 상태로 구현·원본15쌍 비교했다. G14 공개 인증 왕복과 G13→G15 동일 ID 연결을 검증했다. 미수록·시각·환경 및 후속 Goal 소유는 유지한다. [연속 작업 결과](../RESULTS/G05_G15_RESULT.md).

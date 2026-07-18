# UX/UI Direction

## 1. Product UX Principle

After login, this is a personal sales workflow tool, not a marketing site. The public `/` entry can introduce the product, but the authenticated `/app/*` experience must stay work-focused.

The UI should help a salesperson answer quickly:

- 지금 어떤 딜이 진행 중인가?
- 어떤 딜이 막혀 있는가?
- 다음 행동은 무엇인가?
- 어떤 회사/담당자/제품 정보가 이 딜과 연결되어 있는가?

The authenticated first screen should make today's sales work visible first, then provide a clear path into the deal pipeline.

## 2. First Screen

Target direction: `/` is the public entry surface, `/app` is the authenticated work dashboard, and `/app/deals` remains the high-density Deal Pipeline Home.

Current implementation note as of 2026-07-10:

- Public/auth canonical routes use URL locale prefixes such as `/ko`, `/ko/login`, `/ja/signup`, and `/en-us/pricing`.
- Legacy `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, and `/privacy` redirect to the preferred locale URL.
- `/app` home is an implemented dashboard that combines Schedule, Deal, Deal stage count, and MeetingNote API data.
- The active deal pipeline experience is served from `/app/deals`.
- Keep `/app` focused on today/dashboard context and `/app/deals` focused on comparison, filtering, preview, and mutation.
- Global Search has Backend `GET /api/search` and User Web GlobalSearch connection with loading, empty, error states implemented.
- Trash has Backend list/detail/restore APIs and a User Web full-width list with row-click detail modal and modal-only restore action.
- MeetingNote AI/STT draft Backend APIs and User Web draft UI integration are implemented.
- BusinessCard OCR has Backend `POST/GET /api/business-card-scans` and User Web `/app/business-cards` integration implemented. The visible feature name is `명함 스캔`, and the modal action is `명함스캔`.
- DataImport has Company/Contact/Product/Deal upload, AI mapping, row edit/validation, cell-scoped validation messages, confirm save, and import log detail implemented.
- Company create uses a Notion-like right document panel from the company list. `/app/companies/new` opens the list with the create panel already open instead of rendering a separate full-page form. The desktop panel is full-height, resizable, and capped at 70% of the workspace; the company list keeps all columns and uses horizontal scroll when space is tight.
- Contact/product create modals use search-input selection, immediate creation when no result exists, and automatic selection after creation.
- Deal likelihood (`긍정 / 중립 / 부정` or percent) is not implemented in the current Deal API/FE form. Treat it as future UX scope unless a new backend plan adds it.

Current priority note as of 2026-07-18:

- 지금은 새 기능을 추가하기보다 UX/UI 공통 QA와 모바일 브라우저 QA를 먼저 진행한다.
- 핵심 업무 기능은 이미 실제 API와 연결되어 있으므로, 다음 위험은 기능 부재보다 사용 품질이다.
- 1440px, 1280px, 768px, 390px, 360px, 125% 확대에서 주요 화면이 깨지지 않는지 확인한다.
- 긴 회사명/담당자명/제품명/딜이름, 긴 이메일/전화번호/URL이 layout을 깨지 않는지 확인한다.
- loading, empty, error, success, destructive action 상태가 UX writing 기준과 맞는지 확인한다.
- 이 QA가 끝나기 전에는 Notification, 결제/구독, Admin 운영, Series A급 AI 기능을 화면에 노출하지 않는다.
- 자세한 제품 우선순위는 `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`를 따른다.

Primary focus:

- active deals
- deal stages
- deal amount
- next action/follow-up
- recent activity
- overdue or near-deadline deals

Secondary information:

- today's schedule
- weekly activity summary
- alerts
- quick create buttons

These can appear as compact side panels or secondary sections, but they should not replace the pipeline as the first visual priority.

## 3. Reference UI Direction

Reference file:

- `example.html`

This file is reference-only. It is not the implementation source of truth.

Primary UX/UI reference:

- `Notion식 작업공간 UX + Attio식 CRM record 관계 UX` is now the preferred UX/UI reference for the whole product.
- Notion provides sidebar-first navigation, page-centered structure, database-like list/table views, quiet typography, restrained color, and block/section-based content structure.
- Attio provides CRM record relationships, linked record detail, property-first record pages, activity timeline, notes/tasks-like work context, and workflow views.
- It does not mean copying Notion's brand, logo, copy, visual assets, or screens one-to-one.
- It does not mean copying Attio's brand, copy, visual assets, or screens one-to-one.
- It also does not mean turning the product into a free-form document editor or custom CRM builder. Sales domain fields, validation, ownership, and workflow constraints remain fixed where needed.
- The detailed decision is `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`.

External UX references:

- Notion: workspace/sidebar/page/database view/detail page grammar. This is one half of the primary reference.
- Attio: CRM record relationships between companies, people, deals, activity timeline, linked record detail structure. This is one half of the primary reference.
- Toss-like hierarchy: simple information hierarchy, clear CTA, readable typography, low visual noise. This is now secondary to Notion.
- Pipedrive: sales pipeline focus, deal stage visibility, next-action sales workflow. Do not copy pure Kanban as the default desktop layout.
- Linear: list-first scanning, fast selection, peek/detail panel behavior, efficient command/search feel.
- Google Calendar: monthly calendar as the default schedule view with week view switching.
- Airtable Interface Designer: Admin-style table/filter/detail-panel operational interfaces.

Reference URLs:

- Notion sidebar navigation: https://www.notion.com/help/navigate-with-the-sidebar
- Notion database intro: https://www.notion.com/help/intro-to-databases
- Notion database views: https://www.notion.com/help/guides/using-database-views
- Notion table view: https://www.notion.com/help/guides/table-view-databases
- Notion content blocks: https://www.notion.com/help/guides/types-of-content-blocks
- Notion style/customize: https://www.notion.com/help/customize-and-style-your-content
- Attio data model: https://attio.com/help/reference/attio-101/attios-data-model/understanding-attio-data-model
- Attio objects and lists: https://docs.attio.com/docs/objects-and-lists
- Pipedrive pipeline management: https://www.pipedrive.com/en/features/pipeline-management
- Attio records: https://attio.com/help/reference/attio-101/attios-data-model/understanding-records
- Linear Peek: https://linear.app/docs/peek
- Airtable Interface Designer: https://www.airtable.com/platform/interface-designer

Useful directions to keep:

- left sidebar navigation
- page title area with quiet primary actions
- database-like table/list-first deal management
- stage tabs above the deal list
- filters/search directly above the list
- row/card opens a record detail page or peek/detail panel
- create from a list can open a right document panel when preserving list context matters
- property-first detail layout with linked records, activity-like sections, schedule/meeting note context, and memo
- simple buttons with clear icons
- badges for status and metadata
- modal forms only for small quick-create, confirmation, or auxiliary selection flows
- practical, work-focused density
- block/section-like page body organization

Do not copy blindly:

- Do not use the old `SalesKit` brand.
- Use `한손에 영업 / onehand.sales`.
- Do not use `오프더레코드` as a UI term.
- Use `Memo 기록` for domain-specific subjective notes.
- Do not make numeric probability the default UI.
- Default likelihood is `긍정 / 중립 / 부정`.
- Avoid a UI dominated by beige/cream tones.
- Keep the UI clean, but make deal data more legible than decorative dashboard cards.
- Do not copy reference product brand, copy, visual assets, or layout one-to-one.
- Do not copy Notion's brand, icons, copy, or pixel-level screen layout.
- Do not copy Attio's brand, copy, visual assets, or pixel-level screen layout.
- Do not make every field free-form just because Notion supports free-form pages.
- Do not expose custom object/custom field builder behavior just because Attio supports flexible CRM modeling.

## 4. App Home And Deal Layout Direction

Recommended `/app` home structure:

```text
Top bar:
  global search, quick create, current user actions

Main:
  today's schedule
  active/near-deadline deals
  recent meeting notes
  fast entry points into core workflows
```

Recommended `/app/deals` structure:

```text
Top bar:
  global search, quick create, notifications

Main:
  deal pipeline list/table with stage tabs and filters

Side or lower area:
  today's schedule
  follow-up reminders
  recent meeting notes
```

The pipeline should be usable for scanning and action:

- stage tabs: 전체, 초기 접촉, 협의중, 성사, 실패
- list/table rows on desktop
- mobile can use compact deal cards or list rows
- visible company/contact/product context
- visible amount and likelihood
- clear next-action marker
- quick link to deal detail
- selected deal opens a detail panel on desktop
- selected deal opens a detail screen or bottom sheet on mobile

The default desktop pipeline is not a pure Kanban board. It is closer to a stage-filtered list/table with a side detail panel.

## 5. Visual Tone

Target users are individual salespeople, likely many in their 30s to 50s.

UI direction:

- practical
- readable
- not playful
- not overly decorative
- clear contrast
- large enough text for repeated work
- dense enough to compare deals
- Toss-like simplicity in hierarchy and interaction
- business-tool density where comparison matters

Avoid:

- marketing hero layout after login
- decorative dashboard cards as the main focus
- visual effects that reduce scanning speed
- hiding important deal context behind too many clicks
- excessive rounded shapes
- low-contrast pale text
- color palettes dominated by one beige/cream family

Toss-like does not mean copying Toss screens. For this product it means:

- fewer visual distractions
- obvious primary action
- clear typography hierarchy
- plain language labels
- fast path to the next action
- lightweight interaction feedback
- enough whitespace to reduce anxiety, but not so much that deal comparison becomes slow

## 6. UI Density

Use medium density.

Meaning:

- cleaner and calmer than a dense enterprise admin tool
- more information-rich than a consumer finance app screen
- enough rows visible to compare active deals
- enough whitespace to avoid fatigue for 30s to 50s users
- primary action and key deal status should remain obvious

Avoid:

- very sparse screens where only a few deals are visible
- overly compact tables that feel like old ERP software
- tiny text or weak contrast
- decorative cards that reduce usable information area

Desktop deal list should show the important comparison fields without horizontal hunting:

- deal title
- company/contact
- stage
- amount
- likelihood
- next action
- due/expected close date

## 7. Color Direction

Use a Toss-like blue-centered palette.

Purpose:

- create trust
- keep the product clean
- make primary actions obvious
- avoid a heavy enterprise look

Direction:

- base: white and neutral gray
- primary: service blue palette
- primary usage: main CTA, selected navigation, active tab, focused input, important link
- status colors: restrained secondary use only
- success/positive: green
- warning/follow-up needed: amber
- danger/failure/overdue: red
- sensitive/private: distinct but not loud

Core service blue palette:

- `#1F4EF5`: strong primary, high-emphasis CTA, active navigation, selected tab
- `#4880EE`: default primary action, focused state, important link, confirmation feedback
- `#83B4F9`: supporting blue, hover/subtle emphasis, low-emphasis accent

Blue component rule:

- when a blue component has both fill and border, use the same solid color for both
- examples: fill `#1F4EF5` with border `#1F4EF5`, fill `#4880EE` with border `#4880EE`
- do not mix a strong blue fill with a pale blue border for primary UI
- do not introduce another primary blue or purple family unless this direction is updated first

Avoid:

- beige/cream-dominant UI
- dark navy-dominant UI
- excessive gradients
- too many competing accent colors
- using blue for every status so that hierarchy disappears

## 8. Typography And Readability

Use medium readability.

Meaning:

- text should not feel small or cramped
- list/table density remains usable for deal comparison
- primary text should be easy for 30s to 50s users to scan repeatedly
- secondary text can be smaller, but must keep enough contrast

Direction:

- default UI font stack is Notion-like and multilingual:
  `Inter`, `Pretendard Variable`, `Pretendard`, `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Apple SD Gothic Neo`, `Noto Sans KR`, `Noto Sans CJK KR`, `PingFang TC`, `PingFang SC`, `Microsoft JhengHei`, `Microsoft YaHei`, `Hiragino Sans`, `Hiragino Kaku Gothic ProN`, `Yu Gothic`, `Meiryo`, `Noto Sans TC`, `Noto Sans SC`, `Noto Sans JP`, `sans-serif`
- this font direction applies to Korean, Japanese, Traditional Chinese for Taiwan, and English US/UK/Singapore/Australia/Canada
- use `Inter` first for Latin/English UI text
- keep `Pretendard` as the Korean fallback
- let Traditional Chinese and Japanese text fall back to OS CJK system fonts
- body/list text: normal readable size
- table header: smaller but clear
- important numbers like amount: slightly emphasized
- badges: compact but legible
- buttons: text must not wrap awkwardly or overflow
- avoid negative letter spacing

Avoid:

- tiny ERP-like table text
- low-contrast gray text for important values
- oversized consumer-app typography that leaves too few deals visible
- viewport-based font scaling
- adding a separate font system per locale without updating `AGENT/UXUI_AGENT/DECISIONS/018_uxui_multilingual_font_stack.md`

## 8A. UX Writing Direction

Product copy follows Toss-like UX writing principles adapted for `한손에 영업 / onehand.sales`.

Rules:

- Use 해요체 for user-facing sentences.
- Avoid `입니다/습니다/합니다/없습니다/하지 않습니다/수 없습니다/못했습니다/필요합니다/되었습니다`.
- Prefer active wording such as `저장했어요` over passive wording such as `저장되었습니다`.
- Prefer positive next-action wording over dead-end negative states.
- Keep loading, empty, error, validation, toast, and dialog copy short enough to scan quickly.
- Avoid excessive honorifics such as `~시겠어요?`, `시나요?`, `께`, `계시다`, and `여쭈다`.
- Keep button labels short and action-based. Dialog left buttons use `닫기`.
- Menu labels, table headers, filters, and domain labels may stay as concise nouns.

Detailed guide:

- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/016_uxui_writing_tone.md`

## 9. Navigation Priority

Primary navigation should make these areas easy to reach:

- 딜
- 회사
- 담당자
- 제품
- 일정
- 회의록
- 명함 스캔
- 설정

Current visibility rule:

- `Import` is exposed as `데이터 업로드` because DataImport is connected to real Backend APIs.
- Generic `Export` route/features may remain in code, but they are hidden from the main sidebar because current export is domain-level xlsx download.
- Export for the current product is handled by domain-level actions. The visible User Web label is the common `엑셀 다운로드`; the current list screen and API determine whether it exports companies, contacts, products, or deals.
- `휴지통` is exposed in the management section because delete and restore are now active user workflows. It should use a full-width list layout, row-click detail modal, and modal-only restore action.
- `명함 스캔` is exposed in primary navigation with a simple camera icon. The page header should only show `명함 스캔`; do not add a duplicate app name/header label above it.
- Do not surface deferred features in primary navigation just because a route exists.

Even though the first screen is deal-centered, company/contact/product registration must remain easy because deals require those entities.

## 9A. List Filter UX

Company, contact, product, deal, and meeting-note list pages should use explicit page-number pagination for page lists.

Rules:

- Page list UX uses `totalPages` and `totalCount`.
- Page-number list pages use 10 items per page.
- Do not use `hasNext` for page-number pagination.
- `hasNext` is allowed only for cursor/infinite flows such as detail memo logs.
- Company field and company region list filters behave like Product category/status filters:
  - fetch the full option list on initial screen load
  - render a compact select control
  - pass the selected option id into the paginated list query
- Contact department and job grade filters follow the same select pattern.
- Company/contact/product filter selects include a `+ 추가` option that opens the matching taxonomy management dialog.
- Newly created taxonomy options should be selected in the list filter immediately when possible.
- Deal list controls are ordered as deal-name search, `전체`, company select, contact select, and sort select.
- Deal stage counts should receive the same search/company/contact filters as the current list context.
- BusinessCard scan list controls use a reset icon for 전체 상태 and a multi-select status filter with internal `상태 초기화`. It does not expose a sort select because registration date descending is fixed.
- BusinessCard `명함스캔` modal is staged: image upload only before OCR, progress overlay during OCR, extracted result form only after OCR success.
- Company/contact/product/deal operational lists should share the dense `Controls Bar + Table Card + Pagination` visual grammar where possible.
- Shared list size baseline: `Pagination` is 48px high, preview headers and table headers are 44px high.

## 9B. Shared-First Implementation Order

This product should not be implemented domain-by-domain from the start.

Recommended order:

1. design tokens
2. shared shell
3. shared state UI
4. shared data display components
5. deal first-screen completion
6. login/landing refinement
7. company
8. contact
9. product
10. schedule
11. secondary feature groups

Why:

- the first logged-in experience is the deal pipeline home
- many later screens reuse the same shell, modal, card, filter, detail panel, and state patterns
- if company/contact/product are implemented before these shared patterns settle, the visual grammar diverges quickly

Shared layer to finish early:

- desktop sidebar
- desktop top bar
- mobile header
- bottom tab bar
- modal shell
- toast
- loading / empty / error states
- base card
- section header
- primary button
- filter chip
- badge family

Deal screen work that should define the baseline:

- desktop deal pipeline home
- mobile deal pipeline home
- desktop detail panel
- mobile deal detail
- deal quick create modal

After that, domain expansion should follow:

- company
- contact
- product
- schedule
- meeting note / business card / import-export / trash / notifications / search

Rules:

- new domain screens should reuse shared shell and shared state UI
- desktop and mobile layouts may differ, but they should not invent separate visual systems
- do not expand route count faster than shared component quality

## 10. Deal Row Information Priority

A deal row/card should prioritize:

1. deal title
2. company/contact
4. stage
5. amount
6. likelihood: `긍정 / 중립 / 부정`
7. next action
8. due date or expected close date
9. related product

Reason:

- Salespeople first need to recognize what the deal is and who it is with.
- Then they compare current status, money, and probability.
- Finally they decide what action should happen next.

Desktop recommended column order:

```text
딜이름 -> 회사/담당자 -> 단계 -> 금액 -> 가능성 -> 다음 행동 -> 마감일
```

Mobile recommended card order:

```text
딜이름
회사/담당자
단계 · 금액 · 가능성
다음 행동
마감일
```

Mobile pipeline pattern:

- top stage tabs: 전체, 초기 접촉, 협의중, 성사, 실패
- content below tabs: deal card list
- no mobile table as default
- no horizontal Kanban as default
- card should make next action and due date immediately visible

Optional advanced fields:

- numeric probability
- region
- recent activity count

## 11. Detail Panel Direction

Desktop deal detail can open in a right-side panel.

Panel tabs:

- 기본 정보
- 활동 로그
- Memo 기록
- 일정/회의록

Rules:

- Do not hide essential deal status inside tabs.
- Stage, amount, likelihood, company/contact, and next action must remain immediately visible.
- Activity log entry should be possible from the detail panel.
- `Memo 기록` must be visually distinct from Log/활동 로그 and treated as sensitive.

## 12. Create And Edit Flow

Use quick create modal plus full detail page.

Principle:

- quick create is for capturing data before the user postpones it
- detail page is for complete, careful editing
- users should not be forced to fill every field before saving

Quick create modal:

- opens from the current screen
- contains only minimum fields
- saves fast
- moves the user to detail page or keeps them in current context depending on action
- offers a clear path to "save and edit details"

Full detail page:

- contains all fields
- supports complex relationships
- supports longer memo/history/activity input
- is used for careful review and editing

Recommended quick create minimum fields:

Company:

- company name
- company field
- company region
- memo optional

Contact:

- name
- company connection
- phone optional
- department/position optional

Product:

- product name
- category optional
- unit price optional

Deal:

- deal title
- company
- contact
- product
- amount
- stage
- likelihood
- next action optional
- due/expected close date optional

Do not use a large modal for complex editing. If the user needs more than the minimum fields, send them to the detail page.

## 13. Inline Entity Creation In Deal Quick Create And Core Create Modals

When creating a deal, the user must connect:

- company
- contact
- product

If the needed company/contact/product does not exist, allow inline minimum creation inside the deal quick create modal.

When creating company/contact/product records, required linked or taxonomy options should follow the same search-first rule.

Pattern:

- searchable combobox for company/contact/product
- if there is no result, show `새 회사 만들기`, `새 담당자 만들기`, `새 제품 만들기`
- inline creation asks only minimum fields
- after creation, the new entity is selected automatically
- full details are edited later on that entity's detail page
- company field/region, contact department/job grade, and product category/status use searchable inputs and create missing options from the current input.
- contact company search opens company creation when no company exists, then selects the created company after option refetch.

Rules:

- do not allow an unlinked free-text company/contact/product in a deal
- show existing candidates before creating to reduce duplicates
- keep inline creation small; never open a full entity form inside the deal modal
- if creation gets complicated, save the deal after creating minimum entity data and send the user to detail page
- do not persist required option fields as free text; create or select a real option/entity first

## 14. Search UX

Use both global search and screen-level search/filter.

Global search:

- lives in the top bar
- searches across company, contact, product, deal, schedule, and meeting note
- groups results by entity type
- prioritizes active deals and recent records
- opens detail page or detail panel depending on context

Screen-level search/filter:

- lives near the list it controls
- filters only the current screen
- supports domain-specific filters
- should be URL-backed for list pages where sharing/bookmarking matters

Deal list filters:

- stage
- amount range
- likelihood
- next action status
- due/expected close date
- company/contact

Mobile:

- global search can open as a full-screen search sheet
- screen filters can open as a compact filter sheet

Do not rely on global search alone. Lists still need local filters.

## 15. Deal Detail UX

Use summary-first deal detail.

Desktop:

- selecting a deal opens a right-side detail panel for quick review
- full detail page exists for complete editing

Mobile:

- selecting a deal opens a detail screen

The summary area must always make these visible:

- deal title
- company/contact
- stage
- amount
- likelihood
- next action
- due/expected close date

Detail sections:

- 기본 정보
- 활동 로그
- 일정/회의록
- 제품/연결 정보
- Memo 기록

Activity log should be timeline-like and support quick entry.

Do not hide current stage, amount, likelihood, next action, or company/contact behind tabs.

## 16. Schedule And Meeting Link UX

Use deal-centered linking with cross-entry points.

Principle:

- schedules and meeting notes can be created from their own screens
- they can also be created or linked from deal detail
- once linked, they appear in the deal detail timeline/related section

Schedule:

- can connect to deal, company, and contact
- if created from deal detail, inherit deal/company/contact by default
- show linked deal context in schedule views
- default schedule view is a Google Calendar-like month view
- schedule view supports month/week switching in the same screen

Meeting note:

- can be saved without deal
- can be linked to a deal later
- if linked to a deal, creates deal activity log automatically
- if created from deal detail, inherit deal/company/contact by default
- primary create path is direct writing and save; AI/STT is optional assistance inside the same create surface

AI meeting note:

- does not replace manual save
- text AI fills details, next plan, and required action after the user enters raw notes
- STT transcribes audio, then fills details, next plan, and required action
- user-selected company/contact/product/deal/date remain authoritative for the current MVP flow
- user confirms and edits generated fields before final save
- avoid naming the whole feature `AI 회의록`; use `회의록`, `회의록 작성`, `AI로 정리`, and `음성으로 작성`

## 17. Next Action And Alert UX

Treat next action as a first-class sales workflow field.

Next action should be visible in:

- deal list row/card
- deal detail summary
- home pipeline
- notification area

Next action states:

- none
- scheduled
- due soon
- overdue
- done

Visual direction:

- due soon: amber
- overdue: red
- done: neutral or green
- no next action: subtle warning only when deal is active

User actions:

- complete
- snooze
- change date
- add schedule
- add activity log

Alerts should not overwhelm the user. Show urgent items clearly, but keep normal reminders quiet.

## 18. Admin UI Direction

Admin Web is a later-stage operations surface. When it is implemented, it should use the same trust-oriented blue/gray system, but with higher information density than User Web.

Admin UI principles:

- desktop only
- table-first
- filter-first
- audit-safe
- less emotional, more operational
- no marketing-style visuals

Admin screens should prioritize:

- fast filtering
- server pagination
- row detail panels
- masked sensitive fields
- reason dialogs for sensitive/raw/destructive actions
- clear audit trail visibility

Admin should not try to feel like the User Web. It should feel like an internal operations console.

## 12. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`

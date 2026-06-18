# G01-BE-INTEGRATED-SEARCH ?곸꽭 紐낆꽭

## 1. 紐⑹쟻

Backend??`GET /api/search`瑜?異붽???User Web???꾩옱 ?ъ슜???뚯쑀 ?곗씠?곕? ??踰덉뿉 寃?됲븷 ???덇쾶 ?쒕떎.

## 2. ?ы븿 踰붿쐞

- `search` Backend module 異붽?
- application port? service 異붽?
- Prisma repository 異붽?
- HTTP controller? query DTO 異붽?
- AppModule ?깅줉
- service/controller ?뚯뒪??異붽?

## 3. ?쒖쇅 踰붿쐞

- FE 肄붾뱶 ?섏젙
- Admin API
- DB migration
- 蹂꾨룄 search index
- ?몃? Provider ?몄텧

## 4. API ?곌껐

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`

## 5. DB ?곌껐

- `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`? 媛?relation snapshot/lookup table???쎈뒗??
- 紐⑤뱺 query??`userId` 議곌굔???ы븿?쒕떎.
- ??table怨?migration? 留뚮뱾吏 ?딅뒗??

## 6. ?꾨즺 湲곗?

- `GET /api/search`媛 ?몄쬆???ъ슜?먯뿉??200 ?묐떟??諛섑솚?쒕떎.
- ??湲??誘몃쭔 寃?됱뼱??鍮?寃곌낵瑜?諛섑솚?쒕떎.
- invalid `types`??400 domain validation error瑜?諛섑솚?쒕떎.
- ?꾨찓?몃퀎 寃곌낵??`limit` ?댄븯濡?諛섑솚?쒕떎.
- Backend `pnpm typecheck`媛 ?듦낵?쒕떎.
- 寃??service/controller ?뚯뒪?멸? ?듦낵?쒕떎.

## 7. 援ы쁽 寃곌낵

- ?곹깭: completed
- 援ы쁽 紐⑤뱢: `BE/src/modules/search`
- 寃利? `pnpm typecheck`, `pnpm lint`, `pnpm test -- search`

## 8. 愿??臾몄꽌

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

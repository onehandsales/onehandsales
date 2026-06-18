# /goal G01-BE-INTEGRATED-SEARCH

## 1. Goal

Backend ?듯빀寃??API `GET /api/search`瑜?援ы쁽?쒕떎.

## 2. 癒쇱? ?쎌쓣 臾몄꽌

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/README.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/GOAL-SPECS/G01-BE-INTEGRATED-SEARCH.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 3. ?묒뾽 泥댄겕由ъ뒪??
- [x] `SearchTargetType`怨?repository port瑜??뺤쓽?쒕떎.
- [x] `SearchApplicationService`?먯꽌 query ?뺢퇋?붿? type validation??援ы쁽?쒕떎.
- [x] `SearchController`? query DTO瑜?援ы쁽?쒕떎.
- [x] `PrismaSearchRepository`?먯꽌 6媛??꾨찓??寃??query瑜?援ы쁽?쒕떎.
- [x] `SearchModule`??留뚮뱾怨?`AppModule`???깅줉?쒕떎.
- [x] service/controller ?뚯뒪?몃? 異붽??쒕떎.
- [x] `pnpm typecheck`? 寃??愿???뚯뒪?몃? ?ㅽ뻾?쒕떎.

## 4. API ?꾨즺 紐⑸줉

- [x] `GET /api/search`

## 5. Acceptance Criteria

- ?몄쬆 ?놁씠??401??諛섑솚?쒕떎.
- `q` ??湲??誘몃쭔?대㈃ 鍮?寃곌낵瑜?諛섑솚?쒕떎.
- `types`媛 ?놁쑝硫?6媛??꾨찓?몄쓣 湲곕낯 ?쒖꽌濡?寃?됲븳??
- `types`媛 ?덉쑝硫?吏?뺣맂 ?꾨찓?몃쭔 寃?됲븳??
- invalid type? 400??諛섑솚?쒕떎.
- ?꾨찓?몃퀎 寃곌낵 媛쒖닔??`limit` ?댄븯?대떎.
- 紐⑤뱺 DB query??`userId` ownership ?꾪꽣瑜??ы븿?쒕떎.
- ?묐떟? `groups[].items[].targetPath`瑜??ы븿?쒕떎.
- 寃?됱뼱 ?먮Ц? log context???④린吏 ?딅뒗??

## 6. ?꾨즺 湲곕줉

?묒뾽 ?꾨즺 ??蹂닿퀬???꾨옒瑜??ы븿?쒕떎.

- 援ы쁽??API
- ?ㅽ뻾??寃利?紐낅졊怨?寃곌낵
- Frontend ?꾩냽 ?묒뾽 ?щ?

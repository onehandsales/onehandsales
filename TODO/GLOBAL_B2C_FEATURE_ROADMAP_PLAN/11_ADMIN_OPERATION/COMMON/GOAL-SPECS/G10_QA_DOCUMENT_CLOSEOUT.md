# G10 QA Document Closeout

상태: Final
목표: 11 Admin Operation 구현 결과를 QA하고 문서/계약/검증 기록을 closeout한다.

## 1. 포함 범위

- G01~G09 완료 상태 확인
- API spec과 구현 대조
- DB migration 검증
- Admin Web build/route QA
- User Web 영향 goal QA
- security/privacy/redaction review
- 결제/구독 제외 확인
- 문서 완료 기록

## 2. 제외 범위

- 신규 기능 추가
- QA 중 발견된 큰 기능 확장
- 결제/구독 구현

## 3. Backend 작업

1. 모든 Admin API endpoint와 API spec을 대조한다.
2. AdminGuard 적용 여부를 확인한다.
3. audit log 필수 action이 실제 기록되는지 확인한다.
4. raw access reason 없는 요청이 실패하는지 확인한다.
5. provider raw/prompt/token/quota detail select가 없는지 확인한다.
6. browser push endpoint/key/userAgent 원문 select와 analytics raw payload dump가 없는지 확인한다.
7. Prisma validate/generate/typecheck/lint/test/build를 실행한다.

## 4. Frontend 작업

1. Admin Web route가 정상 진입되는지 확인한다.
2. 일반 사용자가 Admin route에 접근할 수 없는지 확인한다.
3. table/filter/detail drawer가 긴 텍스트에서도 깨지지 않는지 확인한다.
4. reason modal validation이 동작하는지 확인한다.
5. User Web 영향 goal이 있으면 `/app/trash`, `/app/settings`를 확인한다.

## 5. Request 계약

신규 request 없음.

확인 대상:

- `COMMON/API-SPEC/*.md`

## 6. Response 계약

신규 response 없음.

완료 기록 format:

```text
- 완료일:
- 완료 goal:
- DB migration:
- Backend 검증:
- Admin Web 검증:
- User Web 검증:
- 남은 후속:
```

## 7. Business Logic

- QA closeout은 구현을 변경하지 않고 결과를 검증한다.
- 발견된 blocker는 해당 goal 문서에 되돌려 기록한다.
- 결제/구독 항목이 들어온 경우 closeout 실패로 본다.

## 8. User Flow

1. 작업자가 G10을 실행한다.
2. goal별 체크리스트를 확인한다.
3. API/DB/FE 검증을 실행한다.
4. security/privacy review를 실행한다.
5. 문서 완료 기록을 남긴다.

## 9. DB/Prisma 영향

신규 DB 변경 없음.

확인:

- 신규 migration 파일 존재
- 기존 migration 미수정
- Prisma schema 주석
- migration SQL COMMENT
- seed 영향 기록

## 10. 주석 기준

신규 코드 없음. 누락된 주석이 발견되면 해당 구현 goal로 되돌린다.

## 11. 검증

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

Admin Web:

```powershell
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

User Web 영향이 있는 경우:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

문서 대조:

```powershell
rg -n "billing|payment|invoice|refund|ARPU|churn|paid conversion|subscription/plan|plan/payment|결제/구독|결제 상태|결제 연결|결제 버튼" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION
rg -n "provider raw|prompt|token|quota|private memo|endpoint|p256dh|authCiphertext|userAgent|raw payload" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION
```

결제/구독 검색 결과는 전부 제외/금지/12 이관 문구여야 한다. push/privacy 검색 결과는 원문 금지, hash/ciphertext 안전 처리, safe summary/aggregate 문구여야 한다. request/response schema, DB enum, Admin route, Admin page 작업 항목에 결제/구독 실행 필드가 있으면 closeout 실패로 본다.

## 12. Goal 체크리스트

- [ ] G01~G09 체크리스트 상태를 확인했다.
- [ ] API spec과 구현 endpoint가 일치한다.
- [ ] AdminGuard 적용이 확인됐다.
- [ ] audit log 필수 action이 기록된다.
- [ ] raw access reason 누락 요청이 실패한다.
- [ ] provider raw/prompt/token/quota detail이 저장/응답/로그에 없다.
- [ ] browser push endpoint/key/userAgent 원문이 Admin select/response/log에 없다.
- [ ] mobile analytics raw payload가 Admin response에 dump되지 않는다.
- [ ] Trash 만료가 hard delete/purge로 구현되지 않았다.
- [ ] 결제/구독 기능이 11에 없다.
- [ ] Prisma validate/generate가 통과했다.
- [ ] Backend typecheck/lint/test/build 결과를 기록했다.
- [ ] Admin Web typecheck/lint/build/E2E 결과를 기록했다.
- [ ] User Web 영향 검증 결과를 기록했다.
- [ ] 문서 완료 기록을 남겼다.

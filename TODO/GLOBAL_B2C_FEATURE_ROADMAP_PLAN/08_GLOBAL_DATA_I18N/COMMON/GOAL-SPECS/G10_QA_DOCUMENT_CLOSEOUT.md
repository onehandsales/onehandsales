# G10 QA Document Closeout

상태: Not Started
목표: 08 전체 구현 결과를 검증하고 문서를 동기화한다.

## 1. 포함 범위

- Backend Prisma/API/test/build 검증
- User Web type/lint/build/E2E 또는 수동 QA
- migration 검증 결과 기록
- 실제 provider smoke 결과 기록
- AGENT 문서 정책 갱신
- 08 문서 closeout

## 2. 제외 범위

- 신규 기능 구현
- 정책 재결정
- 후속 시장 확장

## 3. Request 계약

G10은 신규 request를 만들지 않는다.

검토 대상:

- 08에서 추가/변경된 모든 request가 API spec과 구현 결과에 일치하는지 확인한다.
- 요청 validation과 error code가 FE 표시 문구와 연결되는지 확인한다.

## 4. Response 계약

G10은 신규 response를 만들지 않는다.

검토 대상:

- 08에서 추가/변경된 모든 response가 API spec과 구현 결과에 일치하는지 확인한다.
- 날짜/시간 ISO 유지, code/field error, currency/phone/region code 포함 원칙이 지켜졌는지 확인한다.

## 5. Business Logic

- 08의 확정 결정이 구현 결과와 일치하는지 확인한다.
- 기존 한국 데이터 보존과 fallback이 동작하는지 확인한다.
- provider linking, phone migration, region migration, currency default가 문서와 일치하는지 확인한다.

## 6. User Flow

- 신규 가입, 설정 변경, Product/Deal 생성, Contact 생성, Company region/address, Import template, Export, Google/LINE/Apple login 흐름을 수동 QA 또는 E2E로 확인한다.
- 실패 시 사용자가 이해 가능한 문구와 복구 경로를 보는지 확인한다.

## 7. DB/Prisma 영향

G10은 신규 DB 변경을 하지 않는다.

검토 대상:

- 모든 08 DB 변경이 `BE/prisma/schema.prisma`에 반영됐는지 확인한다.
- 모든 신규 migration이 `BE/prisma/migrations`에 추가됐는지 확인한다.
- 새 table/column/enum/index에 한글 주석 또는 COMMENT가 있는지 확인한다.
- `BE/prisma/seed.ts`가 enum/required field 변경과 충돌하지 않는지 확인한다.

## 8. 검증 명령

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

User Web:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

가능하면:

```powershell
cd FE/user-web
pnpm run test:e2e
pnpm run test:e2e:mobile
```

## 9. 수동 QA

- [ ] 신규 사용자 가입 기본값이 기대대로 설정된다.
- [ ] `/app/settings` 언어 변경이 즉시 반영된다.
- [ ] `/app` URL에 locale prefix가 붙지 않는다.
- [ ] Product/Deal KRW/USD 입력과 표시가 동작한다.
- [ ] Contact KR/US 전화번호 입력과 legacy fallback이 동작한다.
- [ ] Company KR/US region 선택과 legacy custom region 표시가 동작한다.
- [ ] Import template `ko-KR`, `en` 선택 다운로드가 동작한다.
- [ ] Export header/value가 사용자 설정 기준으로 나온다.
- [ ] Google OAuth smoke가 통과한다.
- [ ] LINE OAuth smoke가 통과한다.
- [ ] Apple OAuth smoke가 통과한다.

## 10. 문서 동기화

- [ ] `README.md` 상태와 완료 결과를 갱신했다.
- [ ] `COMMON/DECISION-LOG.md`가 구현 결과와 일치한다.
- [ ] `COMMON/GOAL-COMPLETION-CHECKLIST.md`가 완료 상태를 반영한다.
- [ ] `COMMON/REVIEW-CHECKLIST.md`를 closeout했다.
- [ ] `BE-TODO/API-TODO.md`가 구현 결과와 일치한다.
- [ ] `BE-TODO/DB-SCHEMA.md`가 구현 결과와 일치한다.
- [ ] `FE-TODO/USER-WEB-TODO.md`가 구현 결과와 일치한다.
- [ ] AGENT 문서의 이전 auth/i18n 정책이 갱신됐다.
- [ ] 실행하지 못한 검증은 사유를 기록했다.

## 11. Goal 검토 체크리스트

- [ ] 08 전체 request 계약이 API spec과 일치한다.
- [ ] 08 전체 response 계약이 API spec과 일치한다.
- [ ] 08 전체 business logic이 `DECISION-LOG.md`와 일치한다.
- [ ] 08 전체 user flow가 `USER-FLOW.md`와 일치한다.
- [ ] 08 전체 DB/Prisma 변경이 `BE/prisma`와 한글 주석 기준을 따른다.
- [ ] Backend 검증 command 결과를 기록했다.
- [ ] User Web 검증 command 결과를 기록했다.
- [ ] E2E 또는 수동 QA 결과를 기록했다.
- [ ] provider smoke 결과 또는 미실행 사유를 기록했다.
- [ ] 문서가 구현 결과와 일치한다.
- [ ] 후속으로 남긴 범위를 정리했다.

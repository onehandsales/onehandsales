# Goal Completion Checklist

상태: Confirmed

각 goal 완료 시 아래를 확인한다.

- [ ] 해당 goal spec의 모든 체크리스트를 갱신했다.
- [ ] API가 있으면 `COMMON/API-SPEC` 계약과 구현이 일치한다.
- [ ] DB 변경이 있으면 Prisma schema와 migration SQL COMMENT가 있다.
- [ ] Admin API는 AuthGuard + AdminGuard를 통과한다.
- [ ] User Web은 `/admin/api/*`를 호출하지 않는다.
- [ ] Admin Web은 User Web feature/client를 import하지 않는다.
- [ ] 민감정보는 기본 masked다.
- [ ] raw access는 reason과 audit log가 있다.
- [ ] provider raw/prompt/token/quota detail이 저장/응답/로그에 없다.
- [ ] browser push endpoint/key/userAgent 원문이 Admin select/response/log에 노출되지 않는다.
- [ ] mobile field-use analytics는 event count와 allowlist payload bucket만 집계한다.
- [ ] Trash 만료가 hard delete/purge로 구현되지 않았다.
- [ ] 결제/구독/plan/paywall이 11에 들어오지 않았다.
- [ ] Backend 신규/수정 코드에 필요한 한글 주석이 있다.
- [ ] Frontend 신규/수정 코드에 필요한 한글 주석이 있다.
- [ ] 실행한 검증 command와 결과를 goal 문서에 기록했다.

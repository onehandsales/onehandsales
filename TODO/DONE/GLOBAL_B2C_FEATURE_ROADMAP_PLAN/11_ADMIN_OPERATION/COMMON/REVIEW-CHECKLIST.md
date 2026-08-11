# Review Checklist

상태: Confirmed

11 전체 review 기준이다.

- [ ] 11 README/SCOPE/DECISION이 서로 충돌하지 않는다.
- [ ] source plan coverage에서 NBA-005/007/011/012/013/014와 09 Admin 이관분이 빠지지 않았다.
- [ ] 결제/구독 범위가 11에 들어오지 않았다.
- [ ] 각 goal 문서에 request/response, business logic, user flow, DB 영향, 주석 기준, 체크리스트가 있다.
- [ ] API spec 문서와 goal 문서의 endpoint가 일치한다.
- [ ] BE-TODO와 FE-TODO의 작업 항목이 goal matrix와 일치한다.
- [ ] DB schema 후보가 현재 `BE/prisma/schema.prisma`와 충돌하지 않는다.
- [ ] Trash 만료 정책이 soft delete 보존과 맞다.
- [ ] 계정 삭제 정책이 Trash 정책과 별개로 설명되어 있다.
- [ ] provider failure는 safe field 중심이다.
- [ ] Admin analytics는 09 read model과 10 mobile field-use event만 사용하고 billing 지표를 제외한다.

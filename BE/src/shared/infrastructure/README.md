# 공유 Infrastructure

infrastructure 구현체를 이곳에 둔다.

예시:

- Prisma service
- logger wrapper
- Supabase Auth JWT verifier adapter
- ExcelJS 기반 xlsx workbook writer adapter

기능별 repository는 해당 기능 모듈의 infrastructure 폴더 아래에 둔다. 다른 module은 그 Prisma repository 구현체를 직접 import하지 않는다.

공용 Supabase Auth JWT 검증 구현체는 `supabase/` 아래에 둔다. 에러 신고 스크린샷의 Supabase Storage 구현체는 `modules/error-report/infrastructure/storage/`에 있다. 기능별 외부 연동은 해당 모듈에 두며, application/domain 계층에는 provider 타입을 노출하지 않는다.

현재 고정형 Company xlsx export API는 제거된 상태다. xlsx writer는 공용 infrastructure 유틸로 유지한다. Bonsai 전환의 export 형식·범위는 [기능 대응표](../../../../AGENT/PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)를 기준으로 정하며, 유틸의 존재를 현재 export API 지원으로 보지 않는다.

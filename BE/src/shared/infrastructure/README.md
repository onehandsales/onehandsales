# 공유 Infrastructure

infrastructure 구현체를 이곳에 둔다.

예시:

- Prisma service
- logger wrapper
- Supabase Auth JWT verifier adapter
- ExcelJS 기반 xlsx workbook writer adapter

기능별 repository는 해당 기능 모듈의 infrastructure 폴더 아래에 둔다.

Supabase Cloud 연동 구현체는 `supabase/` 아래에 둔다. 현재는 Auth JWT 검증만 담당하며, application/domain 계층에는 provider 타입을 노출하지 않는다.

현재 고정형 Company xlsx export API는 제거된 상태다. xlsx writer는 후속 CRM core에서 export가 다시 정의될 때까지 공용 infrastructure 유틸로만 유지한다.

-- 기능 : 도움말/공개 문의 계열 테이블명을 프로젝트 DB PascalCase 규칙에 맞게 변경한다.
-- 기능 : 이미 적용된 migration 파일은 수정하지 않고 실제 DB 객체를 안전하게 rename한다.

ALTER TABLE "error_reports" RENAME TO "ErrorReport";
ALTER TABLE "ErrorReport" RENAME CONSTRAINT "error_reports_pkey" TO "ErrorReport_pkey";
ALTER TABLE "ErrorReport" RENAME CONSTRAINT "error_reports_userId_fkey" TO "ErrorReport_userId_fkey";
ALTER INDEX "error_reports_userId_createdAt_idx" RENAME TO "ErrorReport_userId_createdAt_idx";
ALTER INDEX "error_reports_status_createdAt_idx" RENAME TO "ErrorReport_status_createdAt_idx";

ALTER TABLE "support_requests" RENAME TO "SupportRequest";
ALTER TABLE "SupportRequest" RENAME CONSTRAINT "support_requests_pkey" TO "SupportRequest_pkey";
ALTER TABLE "SupportRequest" RENAME CONSTRAINT "support_requests_userId_fkey" TO "SupportRequest_userId_fkey";
ALTER INDEX "support_requests_userId_createdAt_idx" RENAME TO "SupportRequest_userId_createdAt_idx";
ALTER INDEX "support_requests_status_createdAt_idx" RENAME TO "SupportRequest_status_createdAt_idx";
ALTER INDEX "support_requests_type_createdAt_idx" RENAME TO "SupportRequest_type_createdAt_idx";

ALTER TABLE "public_contact_requests" RENAME TO "PublicContactRequest";
ALTER TABLE "PublicContactRequest" RENAME CONSTRAINT "public_contact_requests_pkey" TO "PublicContactRequest_pkey";
ALTER INDEX "public_contact_requests_createdAt_idx" RENAME TO "PublicContactRequest_createdAt_idx";
ALTER INDEX "public_contact_requests_status_createdAt_idx" RENAME TO "PublicContactRequest_status_createdAt_idx";
ALTER INDEX "public_contact_requests_normalizedEmail_idx" RENAME TO "PublicContactRequest_normalizedEmail_idx";
ALTER INDEX "public_contact_requests_wasExistingUserAtSubmission_createdAt_idx" RENAME TO "PublicContactRequest_wasExistingUserAtSubmission_createdAt_idx";

COMMENT ON TABLE "ErrorReport" IS 'User Web 도움말 모달에서 접수된 사용자 에러 신고 row.';
COMMENT ON INDEX "ErrorReport_userId_createdAt_idx" IS '사용자별 신고 이력 조회에 사용한다.';
COMMENT ON INDEX "ErrorReport_status_createdAt_idx" IS '관리자 처리 queue 조회에 사용한다.';

COMMENT ON TABLE "SupportRequest" IS 'User Web 도움말 모달에서 접수된 사용자 지원 요청 row.';
COMMENT ON INDEX "SupportRequest_userId_createdAt_idx" IS '사용자별 지원 요청 이력 조회에 사용한다.';
COMMENT ON INDEX "SupportRequest_status_createdAt_idx" IS '관리자 처리 queue 조회에 사용한다.';
COMMENT ON INDEX "SupportRequest_type_createdAt_idx" IS '문의 유형별 지원 요청 조회에 사용한다.';

COMMENT ON TABLE "PublicContactRequest" IS '로그인 전 공개 문의 페이지에서 접수된 도입/상담 요청 row. 어떤 FK도 연결하지 않는 독립 테이블이다.';
COMMENT ON INDEX "PublicContactRequest_createdAt_idx" IS '공개 문의 접수 최신순 조회에 사용한다.';
COMMENT ON INDEX "PublicContactRequest_status_createdAt_idx" IS '이후 관리자 처리 queue 조회에 사용한다.';
COMMENT ON INDEX "PublicContactRequest_normalizedEmail_idx" IS '이메일 기준 검색과 중복 확인에 사용한다.';
COMMENT ON INDEX "PublicContactRequest_wasExistingUserAtSubmission_createdAt_idx" IS '회원/비회원 제출 분류 조회에 사용한다.';

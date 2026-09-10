# API Sample

현재 활성 API 문서 범위는 로그인 사용자 기준의 핵심 CRM 데이터, 제품 분석, 지원 접수, 관리자 권한 확인이다.

## Auth / User

| API | 설명 |
| --- | --- |
| `GET /api/auth/providers` | 로그인에 사용할 OAuth 제공자 목록을 조회한다. |
| `POST /api/auth/exchange` | 외부 인증 토큰을 앱 access token과 refresh cookie로 교환한다. |
| `POST /api/auth/refresh` | refresh cookie로 앱 access token을 재발급한다. |
| `POST /api/auth/logout` | 현재 세션을 폐기한다. |
| `GET /api/me` | 현재 로그인 사용자를 조회한다. |
| `GET /api/users/me/profile` | 내 프로필과 연결 계정을 조회한다. |
| `PATCH /api/users/me/profile` | 내 프로필 기본값을 수정한다. |
| `GET /api/users/me/devices` | 내 로그인 기기를 조회한다. |
| `GET /api/users/me/sessions` | 내 세션 목록을 조회한다. |
| `POST /api/users/me/sessions/revoke` | 지정 세션을 폐기한다. |

## Core CRM

| API | 설명 |
| --- | --- |
| `GET /api/companies` | 회사 목록을 검색, 필터, 정렬, 페이지네이션으로 조회한다. |
| `GET /api/companies/export/xlsx` | 현재 조건의 회사 목록을 xlsx로 다운로드한다. |
| `GET /api/companies/{companyId}` | 회사 상세를 조회한다. |
| `POST /api/companies` | 회사를 생성한다. |
| `PATCH /api/companies/{companyId}` | 회사 기본 정보를 수정한다. |
| `DELETE /api/companies/{companyId}` | 회사를 휴지통 상태로 전환한다. |
| `GET /api/companies/{companyId}/contacts` | 회사에 연결된 담당자를 조회한다. |
| `GET /api/companies/{companyId}/deals` | 회사에 연결된 딜을 조회한다. |
| `GET /api/contacts` | 담당자 목록을 조회한다. |
| `GET /api/contacts/export/xlsx` | 현재 조건의 담당자 목록을 xlsx로 다운로드한다. |
| `GET /api/contacts/{contactId}` | 담당자 상세를 조회한다. |
| `POST /api/contacts` | 담당자를 생성한다. |
| `PATCH /api/contacts/{contactId}` | 담당자 기본 정보를 수정한다. |
| `DELETE /api/contacts/{contactId}` | 담당자를 휴지통 상태로 전환한다. |
| `GET /api/contacts/{contactId}/deals` | 담당자에 연결된 딜을 조회한다. |
| `GET /api/products` | 제품 목록을 조회한다. |
| `GET /api/products/export/xlsx` | 현재 조건의 제품 목록을 xlsx로 다운로드한다. |
| `GET /api/products/{productId}` | 제품 상세를 조회한다. |
| `POST /api/products` | 제품을 생성한다. |
| `PATCH /api/products/{productId}` | 제품 기본 정보를 수정한다. |
| `DELETE /api/products/{productId}` | 제품을 휴지통 상태로 전환한다. |
| `GET /api/products/{productId}/deals` | 제품에 연결된 딜을 조회한다. |
| `GET /api/deals` | 딜 목록을 조회한다. |
| `GET /api/deals/stage-counts` | 딜 단계별 건수를 조회한다. |
| `GET /api/deals/export/xlsx` | 현재 조건의 딜 목록을 xlsx로 다운로드한다. |
| `GET /api/deals/{dealId}` | 딜 상세를 조회한다. |
| `POST /api/deals` | 딜을 생성한다. |
| `PATCH /api/deals/{dealId}` | 딜 기본 정보와 연결 정보를 수정한다. |
| `DELETE /api/deals/{dealId}` | 딜을 휴지통 상태로 전환한다. |
| `GET /api/deals/{dealId}/following-action-logs` | 딜 다음 행동 로그를 조회한다. |
| `POST /api/deals/{dealId}/following-action-logs` | 딜 다음 행동 로그를 생성한다. |
| `PATCH /api/deals/{dealId}/following-action-logs/{followingActionLogId}` | 딜 다음 행동 로그를 수정한다. |
| `DELETE /api/deals/{dealId}/following-action-logs/{followingActionLogId}` | 딜 다음 행동 로그를 휴지통 상태로 전환한다. |
| `GET /api/deals/{dealId}/memo-logs` | 딜 메모 로그를 조회한다. |
| `POST /api/deals/{dealId}/memo-logs` | 딜 메모 로그를 생성한다. |
| `GET /api/deals/{dealId}/activities` | 딜 활동 로그를 조회한다. |
| `POST /api/deals/{dealId}/activities` | 딜 활동 로그를 생성한다. |

## Search / Trash / Analytics / Help

| API | 설명 |
| --- | --- |
| `GET /api/search` | 회사, 담당자, 제품, 딜을 한 번에 검색한다. |
| `GET /api/trash` | 휴지통 항목을 조회한다. |
| `GET /api/trash/{targetType}/{targetId}` | 휴지통 항목 상세 미리보기를 조회한다. |
| `POST /api/trash/{targetType}/{targetId}/restore` | 복구 기간 안의 항목을 복구한다. |
| `POST /api/analytics/events` | 제품 분석 이벤트를 기록한다. |
| `POST /api/error-reports` | 오류 신고를 접수한다. |
| `POST /api/support-requests` | 지원 문의를 접수한다. |
| `POST /api/public-contact-requests` | 공개 문의를 접수한다. |
| `GET /admin/api/me` | 관리자 access token의 권한을 확인한다. |
| `GET /api/health` | 서버 상태를 확인한다. |

# API Sample

현재 활성 API 문서 범위는 로그인 사용자 기준의 회사 데이터, 검색/휴지통, 지원 접수, 관리자 권한 확인이다.

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

## Company

| API | 설명 |
| --- | --- |
| `GET /api/companies` | 회사 목록을 검색, 필터, 정렬, 페이지네이션으로 조회한다. |
| `GET /api/companies/export/xlsx` | 현재 조건의 회사 목록을 xlsx로 다운로드한다. |
| `GET /api/companies/{companyId}` | 회사 상세를 조회한다. |
| `POST /api/companies` | 회사를 생성한다. |
| `PATCH /api/companies/{companyId}` | 회사 기본 정보를 수정한다. |
| `DELETE /api/companies/{companyId}` | 회사를 휴지통 상태로 전환한다. |
| `GET /api/company-fields` | 회사 분야 옵션을 조회한다. |
| `POST /api/company-fields` | 회사 분야 옵션을 생성한다. |
| `DELETE /api/company-fields/{fieldId}` | 회사 분야 옵션을 삭제한다. |
| `GET /api/company-regions` | 회사 지역 옵션을 조회한다. |
| `POST /api/company-regions` | 회사 지역 옵션을 생성한다. |
| `DELETE /api/company-regions/{regionId}` | 회사 지역 옵션을 삭제한다. |
| `POST /api/companies/{companyId}/memo-logs` | 회사 일반 메모 로그를 생성한다. |
| `GET /api/companies/{companyId}/memo-logs` | 회사 일반 메모 로그를 조회한다. |
| `PATCH /api/companies/{companyId}/memo-logs/{memoLogId}` | 회사 일반 메모 로그를 수정한다. |
| `DELETE /api/companies/{companyId}/memo-logs/{memoLogId}` | 회사 일반 메모 로그를 휴지통 상태로 전환한다. |
| `POST /api/companies/{companyId}/private-memo-logs` | 회사 개인 비밀 메모 로그를 생성한다. |
| `GET /api/companies/{companyId}/private-memo-logs` | 회사 개인 비밀 메모 로그를 조회한다. |
| `PATCH /api/companies/{companyId}/private-memo-logs/{privateMemoLogId}` | 회사 개인 비밀 메모 로그를 수정한다. |
| `DELETE /api/companies/{companyId}/private-memo-logs/{privateMemoLogId}` | 회사 개인 비밀 메모 로그를 휴지통 상태로 전환한다. |

## Search / Trash / Help

| API | 설명 |
| --- | --- |
| `GET /api/search` | 회사를 검색한다. |
| `GET /api/trash` | 회사와 회사 메모 휴지통 항목을 조회한다. |
| `GET /api/trash/{targetType}/{targetId}` | 휴지통 항목 상세 미리보기를 조회한다. |
| `POST /api/trash/{targetType}/{targetId}/restore` | 복구 기간 안의 항목을 복구한다. |
| `POST /api/error-reports` | 오류 신고를 접수한다. |
| `POST /api/support-requests` | 지원 문의를 접수한다. |
| `POST /api/public/contact-requests` | 공개 문의를 접수한다. |
| `GET /admin/api/me` | 관리자 access token의 권한을 확인한다. |
| `GET /api/health` | 서버 상태를 확인한다. |

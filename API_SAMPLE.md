아래는 2026-06-25 현재 BE 구현 기준 API별 한 줄 설명입니다.

**User / Auth**
| API | 설명 |
|---|---|
| `GET /api/auth/providers` | 로그인에 사용할 OAuth 제공자 목록과 활성 상태를 조회합니다. |
| `POST /api/auth/exchange` | Supabase 토큰을 앱 access token과 refresh cookie로 교환합니다. |
| `POST /api/auth/refresh` | refresh cookie로 앱 access token을 재발급합니다. |
| `POST /api/auth/logout` | 현재 로그인 세션을 폐기하고 refresh cookie를 삭제합니다. |
| `GET /api/me` | 현재 로그인한 사용자 기본 정보를 조회합니다. |
| `GET /admin/api/me` | 현재 로그인한 관리자 정보를 조회합니다. |
| `GET /api/users/me/profile` | 내 프로필과 연결된 OAuth 계정 정보를 조회합니다. |
| `PATCH /api/users/me/profile` | 내 이름과 타임존 등 프로필 정보를 수정합니다. |
| `GET /api/users/me/devices` | 내 로그인 기기 목록과 현재 기기 여부를 조회합니다. |

**Company**
| API | 설명 |
|---|---|
| `GET /api/companies` | 회사 목록을 검색, 다중 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/companies/export/xlsx` | 현재 검색과 다중 필터 조건의 회사 목록을 엑셀 파일로 다운로드합니다. |
| `GET /api/companies/{companyId}` | 회사 단건 상세 정보를 조회합니다. |
| `POST /api/companies` | 새 회사를 생성하고 선택적으로 초기 메모를 남깁니다. |
| `PATCH /api/companies/{companyId}` | 회사명, 분야, 지역 정보를 수정합니다. |
| `GET /api/companies/{companyId}/contacts` | 특정 회사에 연결된 연락처 목록을 조회합니다. |
| `GET /api/companies/{companyId}/deals` | 특정 회사에 연결된 거래 목록을 조회합니다. |
| `POST /api/companies/{companyId}/memo-logs` | 회사 공개 메모 로그를 생성합니다. |
| `GET /api/companies/{companyId}/memo-logs` | 회사 공개 메모 로그를 cursor 방식으로 조회합니다. |
| `PATCH /api/companies/{companyId}/memo-logs/{memoLogId}` | 회사 공개 메모 로그를 수정합니다. |
| `DELETE /api/companies/{companyId}/memo-logs/{memoLogId}` | 회사 공개 메모 로그를 휴지통 상태로 전환합니다. |
| `POST /api/companies/{companyId}/private-memo-logs` | 회사 개인 비밀 메모 로그를 생성합니다. |
| `GET /api/companies/{companyId}/private-memo-logs` | 회사 개인 비밀 메모 로그를 cursor 방식으로 조회합니다. |
| `PATCH /api/companies/{companyId}/private-memo-logs/{privateMemoLogId}` | 회사 개인 비밀 메모 로그를 수정합니다. |
| `DELETE /api/companies/{companyId}/private-memo-logs/{privateMemoLogId}` | 회사 개인 비밀 메모 로그를 휴지통 상태로 전환합니다. |
| `GET /api/company-fields` | 회사 분야 옵션 목록을 조회합니다. |
| `POST /api/company-fields` | 회사 분야 옵션을 생성합니다. |
| `DELETE /api/company-fields/{fieldId}` | 회사 분야 옵션을 삭제합니다. |
| `GET /api/company-regions` | 회사 지역 옵션 목록을 조회합니다. |
| `POST /api/company-regions` | 회사 지역 옵션을 생성합니다. |
| `DELETE /api/company-regions/{regionId}` | 회사 지역 옵션을 삭제합니다. |

**Contact**
| API | 설명 |
|---|---|
| `GET /api/contacts` | 연락처 목록을 검색, 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/contacts/export/xlsx` | 현재 필터 조건의 연락처 목록을 엑셀 파일로 다운로드합니다. |
| `GET /api/contacts/company-options` | 연락처 등록/수정에 사용할 회사 선택 옵션을 조회합니다. |
| `GET /api/contacts/{contactId}` | 연락처 단건 상세 정보를 조회합니다. |
| `POST /api/contacts` | 새 연락처를 생성하고 선택적으로 초기 메모를 남깁니다. |
| `PATCH /api/contacts/{contactId}` | 연락처 기본 정보와 소속 정보를 수정합니다. |
| `GET /api/contacts/{contactId}/deals` | 특정 연락처에 연결된 거래 목록을 조회합니다. |
| `POST /api/contacts/{contactId}/memo-logs` | 연락처 공개 메모 로그를 생성합니다. |
| `GET /api/contacts/{contactId}/memo-logs` | 연락처 공개 메모 로그를 cursor 방식으로 조회합니다. |
| `PATCH /api/contacts/{contactId}/memo-logs/{memoLogId}` | 연락처 공개 메모 로그를 수정합니다. |
| `DELETE /api/contacts/{contactId}/memo-logs/{memoLogId}` | 연락처 공개 메모 로그를 휴지통 상태로 전환합니다. |
| `POST /api/contacts/{contactId}/private-memo-logs` | 연락처 개인 비밀 메모 로그를 생성합니다. |
| `GET /api/contacts/{contactId}/private-memo-logs` | 연락처 개인 비밀 메모 로그를 cursor 방식으로 조회합니다. |
| `PATCH /api/contacts/{contactId}/private-memo-logs/{privateMemoLogId}` | 연락처 개인 비밀 메모 로그를 수정합니다. |
| `DELETE /api/contacts/{contactId}/private-memo-logs/{privateMemoLogId}` | 연락처 개인 비밀 메모 로그를 휴지통 상태로 전환합니다. |
| `GET /api/contact-job-grades` | 연락처 직급 옵션 목록을 조회합니다. |
| `POST /api/contact-job-grades` | 연락처 직급 옵션을 생성합니다. |
| `DELETE /api/contact-job-grades/{jobGradeId}` | 연락처 직급 옵션을 삭제합니다. |
| `GET /api/contact-departments` | 연락처 부서 옵션 목록을 조회합니다. |
| `POST /api/contact-departments` | 연락처 부서 옵션을 생성합니다. |
| `DELETE /api/contact-departments/{departmentId}` | 연락처 부서 옵션을 삭제합니다. |

**Product**
| API | 설명 |
|---|---|
| `GET /api/products` | 제품 목록을 검색, 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/products/export/xlsx` | 현재 필터 조건의 제품 목록을 엑셀 파일로 다운로드합니다. |
| `GET /api/products/{productId}` | 제품 단건 상세 정보를 조회합니다. |
| `POST /api/products` | 새 제품을 생성하고 선택적으로 초기 메모를 남깁니다. |
| `PATCH /api/products/{productId}` | 제품명, 가격, 카테고리, 상태를 수정합니다. |
| `GET /api/products/{productId}/deals` | 특정 제품에 연결된 거래 목록을 조회합니다. |
| `POST /api/products/{productId}/memo-logs` | 제품 공개 메모 로그를 생성합니다. |
| `GET /api/products/{productId}/memo-logs` | 제품 공개 메모 로그를 cursor 방식으로 조회합니다. |
| `PATCH /api/products/{productId}/memo-logs/{memoLogId}` | 제품 공개 메모 로그를 수정합니다. |
| `DELETE /api/products/{productId}/memo-logs/{memoLogId}` | 제품 공개 메모 로그를 휴지통 상태로 전환합니다. |
| `POST /api/products/{productId}/private-memo-logs` | 제품 개인 비밀 메모 로그를 생성합니다. |
| `GET /api/products/{productId}/private-memo-logs` | 제품 개인 비밀 메모 로그를 cursor 방식으로 조회합니다. |
| `PATCH /api/products/{productId}/private-memo-logs/{privateMemoLogId}` | 제품 개인 비밀 메모 로그를 수정합니다. |
| `DELETE /api/products/{productId}/private-memo-logs/{privateMemoLogId}` | 제품 개인 비밀 메모 로그를 휴지통 상태로 전환합니다. |
| `GET /api/product-categories` | 제품 카테고리 옵션 목록을 조회합니다. |
| `POST /api/product-categories` | 제품 카테고리 옵션을 생성합니다. |
| `DELETE /api/product-categories/{categoryId}` | 제품 카테고리 옵션을 삭제합니다. |
| `GET /api/product-statuses` | 제품 상태 옵션 목록을 조회합니다. |
| `POST /api/product-statuses` | 제품 상태 옵션을 생성합니다. |
| `DELETE /api/product-statuses/{statusId}` | 제품 상태 옵션을 삭제합니다. |

**Deal**
| API | 설명 |
|---|---|
| `GET /api/deals/stage-counts` | 거래 단계별 건수를 조회합니다. |
| `GET /api/deals` | 거래 목록을 검색, 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/deals/export/xlsx` | 현재 필터 조건의 거래 목록을 엑셀 파일로 다운로드합니다. |
| `GET /api/deals/{dealId}` | 거래 단건 상세 정보를 조회합니다. |
| `POST /api/deals` | 새 거래를 생성하고 제품 및 첫 다음 행동을 함께 연결합니다. |
| `PATCH /api/deals/{dealId}` | 거래 기본 정보, 상태, 제품 연결을 수정합니다. |
| `GET /api/deals/company-options` | 거래 생성/수정에 사용할 회사 옵션을 조회합니다. |
| `GET /api/deals/contact-options` | 거래 생성/수정에 사용할 연락처 옵션을 조회합니다. |
| `GET /api/deals/product-options` | 거래 생성/수정에 사용할 제품 옵션을 조회합니다. |
| `GET /api/deals/{dealId}/following-action-logs` | 거래의 다음 행동 로그 목록을 cursor 방식으로 조회합니다. |
| `POST /api/deals/{dealId}/following-action-logs` | 거래의 다음 행동 로그를 생성합니다. |
| `PATCH /api/deals/{dealId}/following-action-logs/{followingActionLogId}` | 거래의 다음 행동 내용이나 완료 여부를 수정합니다. |
| `DELETE /api/deals/{dealId}/following-action-logs/{followingActionLogId}` | 거래의 다음 행동 로그를 휴지통 상태로 전환합니다. |
| `GET /api/deals/{dealId}/memo-logs` | 거래 메모 로그 목록을 cursor 방식으로 조회합니다. |
| `POST /api/deals/{dealId}/memo-logs` | 거래 메모 로그를 생성합니다. |
| `PATCH /api/deals/{dealId}/memo-logs/{memoLogId}` | 거래 메모 로그를 수정합니다. |
| `DELETE /api/deals/{dealId}/memo-logs/{memoLogId}` | 거래 메모 로그를 휴지통 상태로 전환합니다. |

Deal relation payload:
- `POST /api/deals`, `PATCH /api/deals/{dealId}` use `companyIds`, `contactIds`, `productIds` arrays.
- Every `contactIds[]` item must belong to one of the selected `companyIds[]`.
- Deal list/detail responses return `companies[]` and `contacts[]`; detail additionally returns `products[]`.

**Schedule**
| API | 설명 |
|---|---|
| `GET /api/schedules/deal-options` | 일정에 연결할 거래 옵션 목록을 조회합니다. |
| `GET /api/schedules` | 기준 날짜와 월/주 보기 조건으로 일정 목록을 조회합니다. |
| `GET /api/schedules/{scheduleId}` | 일정 단건 상세 정보를 조회합니다. |
| `POST /api/schedules` | 새 일정을 생성하고 선택적으로 거래를 연결합니다. |
| `PATCH /api/schedules/{scheduleId}` | 일정 기본 정보와 연결 거래 목록을 수정합니다. |
| `DELETE /api/schedules/{scheduleId}` | 일정을 실제 삭제합니다. |

**Meeting-note**
| API | 설명 |
|---|---|
| `GET /api/meeting-notes/filter-companies` | 회의록 필터에 사용할 회사 옵션을 조회합니다. |
| `GET /api/meeting-notes/filter-contacts` | 회의록 필터에 사용할 연락처 옵션을 조회합니다. |
| `GET /api/meeting-notes` | 회의록 목록을 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/meeting-notes/{meetingNoteId}` | 회의록 단건 상세와 연결 스냅샷 정보를 조회합니다. |
| `POST /api/meeting-notes/ai-draft` | 분리된 AI provider로 사용자가 선택한 회의 맥락과 텍스트 원문 기반 회의록 초안을 생성합니다. |
| `POST /api/meeting-notes/stt-draft` | 분리된 STT provider로 transcript를 만든 뒤 AI provider로 회의록 초안을 생성합니다. |
| `POST /api/meeting-notes` | 수동 또는 AI/STT 초안 기반 회의록을 생성하고 회사, 연락처, 제품, 거래 스냅샷을 저장합니다. |
| `PATCH /api/meeting-notes/{meetingNoteId}` | 회의록 본문과 연결 스냅샷 정보를 수정합니다. |

**Search**
| API | 설명 |
|---|---|
| `GET /api/search` | 회사, 담당자, 제품, 거래, 일정, 회의록을 한 번에 검색하고 상세 화면 이동에 필요한 target 정보를 반환합니다. |

**기타**
| API | 설명 |
|---|---|
| `GET /api/health` | 백엔드 서버가 정상 동작 중인지 확인합니다. |

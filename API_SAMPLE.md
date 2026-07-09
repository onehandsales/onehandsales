아래는 2026-07-09 현재 BE 구현 기준 API별 한 줄 설명입니다.

Export는 범용 `/api/exports` job이 아니라 Company/Contact/Product/Deal 각 도메인의 xlsx 다운로드 API로 처리합니다.

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
| `PATCH /api/users/me/profile` | 내 이름, 타임존, 기본 locale 등 프로필 정보를 수정합니다. |
| `GET /api/users/me/devices` | 내 로그인 기기 목록과 현재 기기 여부를 조회합니다. |

**Company**
| API | 설명 |
|---|---|
| `GET /api/companies` | 회사 목록을 검색, 다중 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/companies/export/xlsx` | 현재 검색과 다중 필터 조건의 회사 목록을 엑셀 파일로 다운로드합니다. |
| `GET /api/companies/{companyId}` | 회사 단건 상세 정보를 조회합니다. |
| `POST /api/companies` | 새 회사를 생성하고 선택적으로 초기 메모를 남깁니다. |
| `PATCH /api/companies/{companyId}` | 회사명, 분야, 지역 정보를 수정합니다. |
| `DELETE /api/companies/{companyId}` | 회사를 휴지통 상태로 전환합니다. |
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
| `DELETE /api/contacts/{contactId}` | 연락처를 휴지통 상태로 전환합니다. |
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

**BusinessCard OCR**
| API | 설명 |
|---|---|
| `POST /api/business-card-scans` | 명함 이미지를 업로드해 OpenAI OCR 후보 값을 만들고 성공/실패 로그를 저장합니다. Company/Contact는 아직 생성하지 않습니다. |
| `GET /api/business-card-scans` | 명함 스캔 내역을 등록일 최신순으로 조회합니다. `status`는 반복 query 또는 comma-separated query로 여러 값을 필터링할 수 있습니다. |
| `GET /api/business-card-scans/{scanLogId}` | 명함 스캔 로그 단건 상세를 조회합니다. |
| `POST /api/business-card-scans/{scanLogId}/confirm` | 사용자가 확인/수정한 값으로 기존 회사/담당자를 재사용하거나 새로 생성하고 scan log를 `CONFIRMED`로 업데이트합니다. |

**Product**
| API | 설명 |
|---|---|
| `GET /api/products` | 제품 목록을 검색, 필터, 정렬, 페이지네이션으로 조회합니다. |
| `GET /api/products/export/xlsx` | 현재 필터 조건의 제품 목록을 엑셀 파일로 다운로드합니다. |
| `GET /api/products/{productId}` | 제품 단건 상세 정보를 조회합니다. |
| `POST /api/products` | 새 제품을 생성하고 선택적으로 초기 메모를 남깁니다. |
| `PATCH /api/products/{productId}` | 제품명, 가격, 카테고리, 상태를 수정합니다. |
| `DELETE /api/products/{productId}` | 제품을 휴지통 상태로 전환합니다. |
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
| `DELETE /api/deals/{dealId}` | 거래를 휴지통 상태로 전환합니다. |
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
| `POST /api/meeting-notes/{meetingNoteId}/deals` | 저장된 회의록에 거래를 추가 연결하고 연결된 거래의 다음 행동 로그를 생성합니다. |
| `PATCH /api/meeting-notes/{meetingNoteId}` | 회의록 본문과 연결 스냅샷 정보를 수정합니다. |
| `DELETE /api/meeting-notes/{meetingNoteId}` | 회의록을 휴지통 상태로 전환합니다. |

**Search**
| API | 설명 |
|---|---|
| `GET /api/search` | 회사, 담당자, 제품, 거래, 일정, 회의록을 한 번에 검색하고 상세 화면 이동에 필요한 target 정보를 반환합니다. |

**Trash**
| API | 설명 |
|---|---|
| `GET /api/trash` | 휴지통에 있는 회사, 담당자, 제품, 거래, 회의록, 지원 로그 목록을 조회합니다. |
| `GET /api/trash/{targetType}/{targetId}` | 휴지통 항목의 상세 미리보기 정보를 조회합니다. |
| `POST /api/trash/{targetType}/{targetId}/restore` | 7일 복구 기간 안의 휴지통 항목을 복구합니다. |

**DataImport**
| API | 설명 |
|---|---|
| `GET /api/import-templates/active` | 회사/담당자/제품/딜 데이터 불러오기 활성 양식 목록을 조회합니다. |
| `GET /api/import-templates/{templateId}/download` | 선택한 데이터 불러오기 양식을 xlsx 파일로 다운로드합니다. 담당자 양식은 `companyName` query로 회사 context를 받을 수 있습니다. |
| `POST /api/imports` | CSV/XLSX 파일을 업로드해 확정 전 임시 import job과 preview row를 생성합니다. 지원 대상은 회사/담당자/제품/딜이며 파일은 최대 10MB입니다. |
| `GET /api/imports/{importJobId}` | 확정 전 임시 import job 상세와 전체 row 상태를 조회합니다. |
| `POST /api/imports/{importJobId}/map` | AI 컬럼 자동 매핑을 생성합니다. provider 실패 시 규칙 기반 매핑으로 fallback합니다. |
| `PATCH /api/imports/{importJobId}/mapping` | 사용자가 수정한 컬럼 매핑을 적용하고 row 검증 결과를 반환합니다. |
| `POST /api/imports/{importJobId}/confirm` | 검증된 row를 회사/담당자/제품/딜 데이터로 확정 저장하고 성공 내역을 남깁니다. 현재 HTTP 경로는 연락처 회사 보정값, 딜 회사/담당자/제품 보정값, row override를 전달합니다. |
| `GET /api/import-user-logs` | 확정 저장된 데이터 불러오기 성공 내역 목록을 조회합니다. |
| `GET /api/import-user-logs/{importUserLogId}` | 데이터 불러오기 성공 내역 상세와 row snapshot을 조회합니다. |

**기타**
| API | 설명 |
|---|---|
| `GET /api/health` | 백엔드 서버가 정상 동작 중인지 확인합니다. |

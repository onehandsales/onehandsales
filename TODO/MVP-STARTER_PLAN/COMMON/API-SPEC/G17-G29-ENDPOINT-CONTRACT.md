# G17-G29 엔드포인트별 구현 계약

## 1. 목적

이 문서는 `G17-G29-WORKFLOW-AUTOMATION-API.md`를 일정, 회의록, 명함 OCR, Import/Export, 알림, 휴지통, 통합검색 API별 구현 계약으로 확장한다.

이 범위는 외부 provider, AI, 파일 처리, 위험 액션이 섞여 있으므로 Backend 구현자는 adapter 경계, transaction, 에러 정책을 이 문서 기준으로 고정한다.

## 2. 공통 처리 기준

- 모든 User API는 `AuthGuard`와 `userId` ownership 필터를 적용한다.
- Google Calendar, OCR, AI meeting note, Import mapping, Export file 생성은 port/adapter 뒤에서 실행한다.
- MVP local 구현에서는 외부 provider를 직접 호출하지 않고 mock adapter를 기본값으로 둔다.
- 파일 업로드 API는 확장자, MIME type, 파일 크기, row count를 validation한다.
- 민감정보가 포함될 수 있는 Export는 기본 제외이며, 포함 요청 시 `sensitiveConfirm = true`를 필수로 요구한다.
- 복구/완전 삭제는 대상 모델별 `deletedAt` 정책과 `BE-TODO/DB-SCHEMA.md`를 함께 따른다.

## 3. G17 Schedule 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 일정 목록 API | `ListSchedules` | `ListSchedulesRequest`: `from`, `to`, `dealId`, `companyId`, `contactId`, `source` | 사용자 소유 일정만 조회한다. 기간 query가 없으면 기본 표시 기간을 서비스에서 정한다. 연결 딜/회사/거래처 필터를 소유권 검증 후 적용한다. | `ScheduleListResponse`: `items:ScheduleResponse[]`, pagination 또는 기간 그룹 | `Schedule`, `Deal`, `Company`, `Contact` 조회. transaction 없음. | `InvalidScheduleRange` 400, `OwnershipViolation` 403 |
| 일정 생성 API | `CreateSchedule` | `CreateScheduleRequest`: `title`, `startAt`, `endAt`, `location`, `dealId`, `companyId`, `contactId`, `memo`, `reminderMinutes` | 시간 범위를 검증한다. 연결 대상이 있으면 소유권을 확인한다. Schedule을 생성하고 reminder가 있으면 함께 생성한다. | `ScheduleResponse`: `id`, `title`, `startAt`, `endAt`, 연결명, `reminders`, timestamps | `Schedule` insert, `ScheduleReminder` insert, 연결 모델 조회. reminder 포함 시 transaction 필요. | `InvalidScheduleRange` 400, `RelatedEntityNotFound` 404, `OwnershipViolation` 403 |
| 일정 상세 API | `GetSchedule` | `GetScheduleRequest`: `scheduleId` path 필수 | 일정 소유권을 확인한다. 연결 딜/회사/거래처와 reminder를 함께 조회한다. | `ScheduleDetailResponse`: `schedule`, `deal`, `company`, `contact`, `reminders` | `Schedule`, `ScheduleReminder`, 연결 모델 조회. transaction 없음. | `ScheduleNotFound` 404, `OwnershipViolation` 403 |
| 일정 수정 API | `UpdateSchedule` | `UpdateScheduleRequest`: `scheduleId`, 수정 필드 | 일정 소유권과 삭제 여부를 확인한다. 시간 범위와 연결 대상 소유권을 다시 검증한다. reminder 배열이 오면 기존 값을 재구성한다. | `ScheduleResponse`: 수정된 일정 정보 | `Schedule` update, `ScheduleReminder` 재구성. reminder 변경 시 transaction 필요. | `ScheduleNotFound` 404, `InvalidScheduleRange` 400, `DeletedResource` 409 |
| 일정 삭제 API | `DeleteSchedule` | `DeleteScheduleRequest`: `scheduleId` path 필수 | 일정 소유권을 확인하고 `deletedAt`을 기록한다. reminder는 유지하되 삭제 일정에서는 발송 대상에서 제외한다. | `DeleteScheduleResponse`: `id`, `deletedAt` | `Schedule.deletedAt` update. transaction 없음. | `ScheduleNotFound` 404, `OwnershipViolation` 403 |
| 일정 복구 API | `RestoreSchedule` | `RestoreScheduleRequest`: `scheduleId` path 필수 | 일정 소유권을 확인하고 `deletedAt`을 null로 되돌린다. | `ScheduleResponse`: 복구된 일정 정보 | `Schedule.deletedAt` update. transaction 없음. | `ScheduleNotFound` 404, `OwnershipViolation` 403 |
| 주간 일정 조회 API | `GetWeeklySchedules` | `GetWeeklySchedulesRequest`: `weekStart`, `timezone` | `weekStart` 기준 7일 범위를 계산한다. 사용자 소유 일정을 날짜별로 그룹화한다. | `WeeklyScheduleResponse`: `weekStart`, `weekEnd`, `days[].schedules[]` | `Schedule`, `ScheduleReminder` 조회. transaction 없음. | `InvalidScheduleRange` 400 |
| 주간 일정 Export API | `CreateWeeklyScheduleExport` | `CreateWeeklyScheduleExportRequest`: `weekStart`, `format`, `includeSensitiveData`, `sensitiveConfirm` | 주간 범위를 검증한다. 민감정보 포함 요청은 확인값을 요구한다. ExportJob을 생성하고 mock exporter로 파일 생성 상태를 갱신한다. | `ExportJobResponse`: `id`, `targetType`, `format`, `status`, `downloadReady`, timestamps | `ExportJob` insert/update, `Schedule` 조회. job 생성과 상태 갱신은 transaction 또는 queue boundary로 분리. | `SensitiveExportConfirmationRequired` 400, `InvalidScheduleRange` 400 |
| Google Calendar 연결 시작 API | `StartGoogleCalendarConnect` | `StartGoogleCalendarConnectRequest`: provider account hint 선택 | 외부 calendar connection port를 호출한다. MVP local은 mock 연결 URL 또는 connected 상태를 반환한다. | `ExternalCalendarConnectResponse`: `connectionId`, `connectUrl`, `status` | `ExternalCalendarConnection` upsert. transaction 없음. | `ExternalCalendarProviderUnavailable` 503 |
| Google Calendar 가져오기 API | `ImportGoogleCalendarEvents` | `ImportGoogleCalendarEventsRequest`: `from`, `to`, `connectionId` | 연결 상태를 확인한다. provider port에서 이벤트를 가져온다. external id 중복을 건너뛰고 Schedule로 저장한다. | `GoogleCalendarImportResponse`: `importedCount`, `skippedCount`, `createdScheduleIds[]` | `ExternalCalendarConnection`, `Schedule` insert. 여러 일정 생성 시 transaction 또는 batch 처리. | `ExternalCalendarNotConnected` 409, `InvalidScheduleRange` 400 |

## 4. G19 MeetingNote 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 회의록 목록 API | `ListMeetingNotes` | `ListMeetingNotesRequest`: `page`, `pageSize`, `dealId`, `search`, `includeDeleted` | 사용자 소유 회의록만 조회한다. 딜 필터가 있으면 딜 소유권을 확인한다. 기본 목록에는 원문 전체 대신 요약 필드를 우선 반환한다. | `MeetingNoteListResponse`: `items:MeetingNoteResponse[]`, pagination | `MeetingNote`, `Deal` 조회. transaction 없음. | `DealNotFound` 404, `OwnershipViolation` 403 |
| AI 회의록 생성 API | `GenerateMeetingNote` | `GenerateMeetingNoteRequest`: `rawText`, `meetingDate`, `companyHint`, `contactHint` | rawText 길이와 필수값을 검증한다. `AiMeetingNotePort`를 호출한다. MVP local은 mock adapter 결과를 반환하고 `AiJob`을 기록한다. | `GeneratedMeetingNoteResponse`: `aiJobId`, 추출 필드, `candidates` | `AiJob` insert/update. transaction 없음. | `InvalidMeetingNoteGeneratedFields` 400, `AiProviderUnavailable` 503 |
| 회의록 저장 API | `CreateMeetingNote` | `CreateMeetingNoteRequest`: `rawText`, `meetingDate`, `companyName`, `contactName`, `department`, `item`, `stage`, `details`, `nextPlan`, `requiredAction`, `dealId` | 필수 필드를 검증한다. 딜이 있으면 소유권을 확인한다. MeetingNote를 저장하고 딜 연결이 있으면 선택적으로 활동 로그를 생성한다. | `MeetingNoteResponse`: `id`, 회의 필드, `dealId`, `dealTitle`, timestamps | `MeetingNote` insert, `Deal` 조회, `DealActivity` 선택 insert. 딜 활동 생성 시 transaction 필요. | `DealNotFound` 404, `ValidationError` 400 |
| 회의록 상세 API | `GetMeetingNote` | `GetMeetingNoteRequest`: `meetingNoteId` path 필수 | 회의록 소유권을 확인한다. 연결 딜과 원문/정리 필드를 조회한다. | `MeetingNoteDetailResponse`: `meetingNote`, `deal`, `rawText`, `aiJob` 선택 | `MeetingNote`, `Deal`, `AiJob` 조회. transaction 없음. | `MeetingNoteNotFound` 404, `OwnershipViolation` 403 |
| 회의록 수정 API | `UpdateMeetingNote` | `UpdateMeetingNoteRequest`: `meetingNoteId`, 수정 필드 | 회의록 소유권과 삭제 여부를 확인한다. 딜 변경 시 새 딜 소유권을 확인한다. | `MeetingNoteResponse`: 수정된 회의록 정보 | `MeetingNote` update, `Deal` 조회. transaction 없음. | `MeetingNoteNotFound` 404, `DeletedResource` 409 |
| 회의록 딜 연결 API | `LinkMeetingNoteToDeal` | `LinkMeetingNoteToDealRequest`: `meetingNoteId`, `dealId`, `activityTitle` | 회의록과 딜 소유권을 모두 확인한다. 회의록의 `dealId`를 갱신하고 딜 활동 로그를 자동 생성한다. | `MeetingNoteResponse`: 딜 연결이 반영된 회의록 정보 | `MeetingNote` update, `DealActivity` insert. transaction 필요. | `MeetingNoteNotFound` 404, `DealNotFound` 404, `OwnershipViolation` 403 |
| 회의록 삭제 API | `DeleteMeetingNote` | `DeleteMeetingNoteRequest`: `meetingNoteId` path 필수 | 회의록 소유권을 확인하고 `deletedAt`을 기록한다. 연결 딜 활동은 유지한다. | `DeleteMeetingNoteResponse`: `id`, `deletedAt` | `MeetingNote.deletedAt` update. transaction 없음. | `MeetingNoteNotFound` 404, `OwnershipViolation` 403 |
| 회의록 복구 API | `RestoreMeetingNote` | `RestoreMeetingNoteRequest`: `meetingNoteId` path 필수 | 회의록 소유권을 확인하고 `deletedAt`을 null로 되돌린다. | `MeetingNoteResponse`: 복구된 회의록 정보 | `MeetingNote.deletedAt` update. transaction 없음. | `MeetingNoteNotFound` 404, `OwnershipViolation` 403 |

## 5. G21 BusinessCard OCR 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 명함 OCR 요청 API | `ScanBusinessCard` | `ScanBusinessCardRequest`: `imageFile`, `memo` | 파일 확장자, MIME type, 용량을 검증한다. OCR port를 호출하고 local은 mock 추출 결과를 저장한다. 자동으로 Company/Contact를 생성하지 않는다. | `BusinessCardScanResponse`: `scanId`, `status`, `createdAt` | `BusinessCardScan` insert, `AiJob` insert/update. transaction 필요. | `InvalidImageFile` 400, `OcrProviderUnavailable` 503 |
| OCR 결과 조회 API | `GetBusinessCardScan` | `GetBusinessCardScanRequest`: `scanId` path 필수 | 스캔 소유권을 확인한다. 추출 결과와 회사 후보를 조회한다. | `BusinessCardScanDetailResponse`: `scanId`, `status`, `extracted`, `companyCandidates[]`, `errorMessage` | `BusinessCardScan`, `Company` 조회. transaction 없음. | `BusinessCardScanNotFound` 404, `OwnershipViolation` 403 |
| OCR 결과 확정 저장 API | `ConfirmBusinessCardScan` | `ConfirmBusinessCardScanRequest`: `scanId`, `companyMode`, `companyId`, `companyName`, `contactName`, 연락처 필드 | 스캔 소유권과 확정 가능 상태를 확인한다. 기존 회사 연결 또는 신규 회사 생성을 처리한다. Contact를 만들고 scan 상태를 confirmed로 변경한다. | `BusinessCardConfirmResponse`: `company`, `contact` | `BusinessCardScan` update, `Company` 선택 insert, `Contact` insert. transaction 필요. | `BusinessCardScanNotFound` 404, `BusinessCardAlreadyConfirmed` 409, `CompanyNotFound` 404 |

## 6. G23-G26 Import/Export 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| Import 업로드 API | `CreateImportJob` | `CreateImportJobRequest`: `targetType`, `file` | 파일 형식과 row count를 검증한다. parser adapter로 preview row를 만들고 ImportJob/Row를 저장한다. | `ImportJobResponse`: `id`, `targetType`, `status`, `rowCount`, `mapping`, timestamps | `ImportJob`, `ImportJobRow` insert. transaction 필요. | `InvalidImportFile` 400, `ImportRowLimitExceeded` 400 |
| Import AI 매핑 API | `GenerateImportMapping` | `GenerateImportMappingRequest`: `importJobId` path 필수 | ImportJob 소유권과 상태를 확인한다. AI mapping port를 호출하고 local은 mock mapping을 반환한다. | `ImportMappingResponse`: `suggestedMapping`, `confidence`, `unmappedColumns[]` | `ImportJob` 조회/update, `AiJob` insert/update. transaction 없음. | `ImportJobNotFound` 404, `AiProviderUnavailable` 503 |
| Import 매핑 수정 API | `UpdateImportMapping` | `UpdateImportMappingRequest`: `importJobId`, `mapping` | ImportJob 소유권을 확인한다. mapping 구조와 필수 target field 매핑 여부를 검증하고 저장한다. | `ImportJobResponse`: mapping이 반영된 job | `ImportJob.mapping` update. transaction 없음. | `ImportJobNotFound` 404, `ValidationError` 400 |
| Import 확정 실행 API | `ConfirmImportJob` | `ConfirmImportJobRequest`: `importJobId`, `confirm` | confirm 값과 mapping 존재 여부를 확인한다. row별 validation 후 targetType에 맞는 도메인 데이터를 생성한다. 성공/실패 row 결과를 저장한다. | `ImportJobResultResponse`: `id`, `status`, `successCount`, `failedCount`, `errors[]` | `ImportJob`, `ImportJobRow`, target 모델 insert/update. row batch transaction 필요. | `ImportMappingRequired` 409, `InvalidImportRow` 400 |
| Import 결과 조회 API | `GetImportJob` | `GetImportJobRequest`: `importJobId` path 필수 | ImportJob 소유권을 확인하고 row 결과와 에러 요약을 조회한다. | `ImportJobDetailResponse`: `job`, `rows`, `errors` | `ImportJob`, `ImportJobRow` 조회. transaction 없음. | `ImportJobNotFound` 404, `OwnershipViolation` 403 |
| Export 생성 API | `CreateExportJob` | `CreateExportJobRequest`: `targetType`, `format`, `includeSensitiveData`, `sensitiveConfirm`, `filters` | export 대상과 필터를 검증한다. 민감정보 포함은 확인값을 요구한다. ExportJob을 만들고 exporter adapter로 파일 생성 상태를 갱신한다. | `ExportJobResponse`: `id`, `targetType`, `format`, `status`, `includeSensitiveData`, `downloadReady`, `createdAt` | `ExportJob` insert/update, target 모델 조회. job 상태 갱신은 transaction 또는 queue boundary. | `SensitiveExportConfirmationRequired` 400, `ValidationError` 400 |
| Export 상태 조회 API | `GetExportJob` | `GetExportJobRequest`: `exportJobId` path 필수 | ExportJob 소유권을 확인하고 현재 상태를 반환한다. | `ExportJobResponse`: job 상태와 다운로드 가능 여부 | `ExportJob` 조회. transaction 없음. | `ExportJobNotFound` 404, `OwnershipViolation` 403 |
| Export 다운로드 API | `DownloadExportFile` | `DownloadExportFileRequest`: `exportJobId` path 필수 | ExportJob 소유권과 `downloadReady` 상태를 확인한다. file storage adapter에서 파일 스트림 또는 signed URL을 반환한다. | file stream 또는 `ExportDownloadResponse`: `downloadUrl`, `expiresAt` | `ExportJob` 조회. transaction 없음. | `ExportJobNotFound` 404, `ExportFileNotReady` 409 |

## 7. G27-G29 Notification, Trash, Search 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 알림 목록 API | `ListNotifications` | `ListNotificationsRequest`: `page`, `pageSize`, `status` | 사용자 소유 알림만 조회한다. 읽음/안읽음 필터를 적용하고 최신 scheduledAt 순으로 정렬한다. | `NotificationListResponse`: `items:NotificationResponse[]`, pagination | `Notification` 조회. transaction 없음. | `ValidationError` 400 |
| 알림 읽음 API | `MarkNotificationRead` | `MarkNotificationReadRequest`: `notificationId` path 필수 | 알림 소유권을 확인한다. `readAt`과 상태를 갱신한다. 이미 읽은 알림은 idempotent 성공으로 처리한다. | `NotificationResponse`: 읽음 처리된 알림 | `Notification` update. transaction 없음. | `NotificationNotFound` 404, `OwnershipViolation` 403 |
| 알림 설정 수정 API | `UpdateNotificationSettings` | `UpdateNotificationSettingsRequest`: `defaultReminderMinutes`, `emailNotificationEnabled`, `browserPushEnabled` | 설정 값을 validation한다. 사용자 설정을 upsert한다. | `UserSettingResponse`: 알림 설정 포함 사용자 설정 | `UserSetting` upsert. transaction 없음. | `ValidationError` 400 |
| 휴지통 목록 API | `ListTrash` | `ListTrashRequest`: `targetType`, `page`, `pageSize` | deletedAt이 있는 주요 모델을 대상별로 조회한다. targetType이 없으면 타입별 최신 삭제 항목을 병합한다. | `TrashListResponse`: `items[].targetType`, `targetId`, `title`, `deletedAt`, `permanentDeleteAt` | `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote` 조회. transaction 없음. | `ValidationError` 400 |
| 휴지통 복구 API | `RestoreTrashItem` | `RestoreTrashItemRequest`: `targetType`, `targetId` path 필수 | targetType별 모델과 소유권을 확인한다. 해당 모델의 `deletedAt`을 null로 되돌린다. | `TrashRestoreResponse`: `targetType`, `targetId`, `restoredAt`, `resource` | target 모델 update. 연결 데이터 복구 정책이 있으면 transaction 필요. | `TrashItemNotFound` 404, `OwnershipViolation` 403 |
| 완전 삭제 API | `PermanentlyDeleteTrashItem` | `PermanentlyDeleteTrashItemRequest`: `targetType`, `targetId`, 확인값 선택 | MVP에서는 위험 액션으로 본다. G28에서 정책이 확정되기 전에는 기본적으로 409로 막는다. 허용 시 연결 데이터 삭제 정책을 명시적으로 따른다. | `TrashPermanentDeleteResponse`: `targetType`, `targetId`, `deleted:true` | target 모델 hard delete와 연결 모델 delete. 허용 시 transaction 필수. | `PermanentDeleteNotAllowed` 409, `TrashItemNotFound` 404 |
| 통합검색 API | `SearchAll` | `SearchAllRequest`: `q`, `types`, `limit` | 검색어를 trim하고 최소 길이를 검증한다. 타입별 DB `ILIKE` 검색을 수행하고 진행 중 딜과 최근 항목을 우선 정렬한다. | `SearchAllResponse`: `groups[].type`, `groups[].items[].title`, `subtitle`, `targetId` | `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote` 조회. transaction 없음. | `SearchQueryRequired` 400, `ValidationError` 400 |

## 8. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P3-G17-G20-SCHEDULE-MEETING.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`

# G17-G29 업무 흐름/자동화 API 명세

## 1. 목적

이 문서는 일정, 회의록, 명함 OCR, Import/Export, 알림, 휴지통, 통합검색 API 계약을 정의한다.

이 범위의 API는 MVP 핵심 루프를 확장하며, Google Calendar, OCR, OpenAI는 MVP 기능에서 처음부터 실제 provider adapter를 호출한다. 자동 테스트에서는 같은 port 뒤의 stub/mock adapter를 사용할 수 있다.

파일 저장소 기준:

- MVP 1차 파일 저장소는 `StoragePort` 뒤의 Supabase Storage adapter를 사용한다.
- application/domain 계층은 Supabase Storage SDK, bucket URL, public URL 형식에 직접 의존하지 않는다.
- DB에는 provider 전용 public URL을 정본으로 저장하지 않고 `storageProvider`, `bucket`, `objectKey`, `contentType`, `sizeBytes`, `fileName` 같은 중립 metadata를 저장한다.
- 나중에 AWS S3로 옮길 때는 `AwsS3StorageAdapter`를 추가하고 `StoragePort` 구현체를 전환한다.
- 파일 다운로드나 미리보기 URL이 필요하면 Backend가 `StoragePort`를 통해 짧은 만료 시간의 signed URL 또는 stream을 만든다.

## 2. 포함 goal

- G17-G18. Schedule Backend/User Web
- G19-G20. MeetingNote Backend/User Web
- G21-G22. BusinessCard OCR Backend/User Web
- G23-G24. Import Backend/User Web
- G25-G26. Export Backend/User Web
- G27. Notification 기본 흐름
- G28. Trash 기본 흐름
- G29. 통합검색 기본 흐름

구현 시 API별 request 필드, 비즈니스 로직 흐름, response 필드, 연결 DB, adapter, transaction, 에러 기준은 `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`를 상세 계약 정본으로 본다.

## 3. Schedule API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 일정 목록 API | `ListSchedules` | `GET` | `/api/schedules` | `ListSchedulesRequest` | `ScheduleListResponse` | Schedule |
| 일정 생성 API | `CreateSchedule` | `POST` | `/api/schedules` | `CreateScheduleRequest` | `ScheduleResponse` | Schedule, ScheduleReminder |
| 일정 상세 API | `GetSchedule` | `GET` | `/api/schedules/:scheduleId` | `GetScheduleRequest` | `ScheduleDetailResponse` | Schedule |
| 일정 수정 API | `UpdateSchedule` | `PATCH` | `/api/schedules/:scheduleId` | `UpdateScheduleRequest` | `ScheduleResponse` | Schedule |
| 일정 삭제 API | `DeleteSchedule` | `DELETE` | `/api/schedules/:scheduleId` | `DeleteScheduleRequest` | `DeleteScheduleResponse` | Schedule |
| 일정 복구 API | `RestoreSchedule` | `POST` | `/api/schedules/:scheduleId/restore` | `RestoreScheduleRequest` | `ScheduleResponse` | Schedule |
| 주간 보고서 조회 API | `GetWeeklySchedules` | `GET` | `/api/schedules/week` | `GetWeeklySchedulesRequest` | `WeeklyScheduleResponse` | Schedule |
| 주간 일정 Export API | `CreateWeeklyScheduleExport` | `POST` | `/api/schedules/week/export` | `CreateWeeklyScheduleExportRequest` | `ExportJobResponse` | ExportJob |
| Google Calendar 연결 시작 API | `StartGoogleCalendarConnect` | `POST` | `/api/schedules/google/connect` | `StartGoogleCalendarConnectRequest` | `ExternalCalendarConnectResponse` | ExternalCalendarConnection |
| Google Calendar 가져오기 API | `ImportGoogleCalendarEvents` | `POST` | `/api/schedules/google/import` | `ImportGoogleCalendarEventsRequest` | `GoogleCalendarImportResponse` | Schedule, ExternalCalendarConnection |

### Schedule request/response

| Request 이름 | 필드 |
|---|---|
| `ListSchedulesRequest` | `from?:string`, `to?:string`, `timezone?:string`, `dealId?:string`, `companyId?:string`, `contactId?:string`, `source?:INTERNAL|GOOGLE` |
| `CreateScheduleRequest` | `title:string 필수`, `startAt:string 필수`, `endAt:string 필수`, `location?:string`, `dealId?:string`, `companyId?:string`, `contactId?:string`, `memo?:string`, `reminderMinutes?:number[]` |
| `UpdateScheduleRequest` | `scheduleId:string path 필수`, 생성 필드 중 수정할 필드 |
| `GetWeeklySchedulesRequest` | `weekStart:string 필수`, `timezone?:string`. 주간 보고서/Export용 |
| `CreateWeeklyScheduleExportRequest` | `weekStart:string 필수`, `format:PDF|EXCEL`, `includeSensitiveData?:boolean`, `sensitiveConfirm?:boolean` |

| Response 이름 | 주요 필드 |
|---|---|
| `ScheduleListResponse` | `rangeStart`, `rangeEnd`, `items:ScheduleResponse[]`, pagination 또는 날짜 그룹 |
| `ScheduleResponse` | `id`, `title`, `startAt`, `endAt`, `location`, `source`, `dealId`, `dealTitle`, `companyId`, `companyName`, `contactId`, `contactName`, `reminders`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `WeeklyScheduleResponse` | `weekStart`, `weekEnd`, `days[]`, `days[].schedules[]` |
| `GoogleCalendarImportResponse` | `importedCount`, `skippedCount`, `createdScheduleIds[]` |

### Schedule 비즈니스 로직과 DB

1. 모든 User API는 AuthGuard와 userId ownership 필터를 적용한다.
2. 일정은 딜 없이 저장할 수 있다.
3. 딜에서 만든 일정은 회사/거래처 기본값을 상속할 수 있다.
4. `GET /api/schedules`에서 `from`, `to`가 없으면 사용자 timezone 기준 이번 달 1일~말일 범위를 기본 조회 기간으로 적용한다.
5. User Web `/schedules`는 월간 캘린더를 기본으로 보여주고 월간/주간 view mode 전환을 제공한다.
6. `/schedules` 주간 보기는 `GET /api/schedules`에 선택된 주의 `from`, `to`를 명시해 조회한다.
7. 주간 보고서와 주간 일정 Export는 `/api/schedules/week`, `/api/schedules/week/export`에서 `weekStart` 기준 7일 범위로 별도 처리한다.
8. Google Calendar 가져오기는 외부 provider port를 통해 실제 Google Calendar API에서 수행한다.
9. Google Calendar에서 가져온 일정은 `source = GOOGLE`과 external id를 저장해 중복 생성을 막는다.

- 생성: Schedule, ScheduleReminder, ExportJob
- 조회: Schedule, Deal, Company, Contact, ExternalCalendarConnection
- 수정: Schedule, ScheduleReminder
- 삭제: Schedule.deletedAt, Schedule.permanentDeleteAt
- transaction: 일정과 알림 생성 동시 처리 시 필요
- 에러: `ScheduleNotFound` 404, `InvalidScheduleRange` 400, `OwnershipViolation` 403, `DeletedResource` 조회 410/변경 409, `ExternalCalendarNotConnected` 409

## 4. MeetingNote API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 회의록 목록 API | `ListMeetingNotes` | `GET` | `/api/meeting-notes` | `ListMeetingNotesRequest` | `MeetingNoteListResponse` | MeetingNote |
| AI 회의록 생성 API | `GenerateMeetingNote` | `POST` | `/api/meeting-notes/generate` | `GenerateMeetingNoteRequest` | `GeneratedMeetingNoteResponse` | AiJob |
| 회의록 저장 API | `CreateMeetingNote` | `POST` | `/api/meeting-notes` | `CreateMeetingNoteRequest` | `MeetingNoteResponse` | MeetingNote |
| 회의록 상세 API | `GetMeetingNote` | `GET` | `/api/meeting-notes/:meetingNoteId` | `GetMeetingNoteRequest` | `MeetingNoteDetailResponse` | MeetingNote |
| 회의록 수정 API | `UpdateMeetingNote` | `PATCH` | `/api/meeting-notes/:meetingNoteId` | `UpdateMeetingNoteRequest` | `MeetingNoteResponse` | MeetingNote |
| 회의록 딜 연결 API | `LinkMeetingNoteToDeal` | `POST` | `/api/meeting-notes/:meetingNoteId/link-deal` | `LinkMeetingNoteToDealRequest` | `MeetingNoteResponse` | MeetingNote, DealActivity |
| 회의록 삭제 API | `DeleteMeetingNote` | `DELETE` | `/api/meeting-notes/:meetingNoteId` | `DeleteMeetingNoteRequest` | `DeleteMeetingNoteResponse` | MeetingNote |
| 회의록 복구 API | `RestoreMeetingNote` | `POST` | `/api/meeting-notes/:meetingNoteId/restore` | `RestoreMeetingNoteRequest` | `MeetingNoteResponse` | MeetingNote |

### MeetingNote request/response

| Request 이름 | 필드 |
|---|---|
| `GenerateMeetingNoteRequest` | `rawText:string 필수`, `meetingDate?:string`, `companyHint?:string`, `contactHint?:string` |
| `CreateMeetingNoteRequest` | `rawText:string 필수`, `meetingDate:string 필수`, `companyName?:string`, `contactName?:string`, `department?:string`, `item?:string`, `stage?:string`, `details:string`, `nextPlan?:string`, `requiredAction?:string`, `dealId?:string` |
| `LinkMeetingNoteToDealRequest` | `meetingNoteId:string path 필수`, `dealId:string 필수`, `activityTitle?:string` |

| Response 이름 | 주요 필드 |
|---|---|
| `GeneratedMeetingNoteResponse` | `aiJobId`, `meetingDate`, `company`, `contact`, `department`, `item`, `stage`, `details`, `nextPlan`, `requiredAction`, `candidates` |
| `MeetingNoteResponse` | `id`, `meetingDate`, `companyName`, `contactName`, `department`, `item`, `stage`, `details`, `nextPlan`, `requiredAction`, `dealId`, `dealTitle`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |

### MeetingNote 비즈니스 로직과 DB

1. AI 회의록 생성은 `AiMeetingNotePort` 뒤의 실제 OpenAI adapter로 실행한다.
2. 자동 테스트에서는 같은 port 뒤에 stub/mock adapter를 주입할 수 있다.
3. 회의록 원문 입력값 `rawText`는 저장 전 `EncryptionPort`로 암호화해 `MeetingNote.rawInputCiphertext`에 저장한다.
4. 회의록 구조화 요약 필드(`detail`, `futurePlan`, `requiredAction` 등)는 MVP 1차 암호화 대상은 아니지만 Admin 응답에서는 기본 마스킹한다.
5. 회의록은 딜 없이 저장 가능하다.
6. 딜 연결 시 현재 사용자 소유 딜인지 검증한다.
7. 딜 연결 성공 시 `DealActivity`를 자동 생성한다.

- 생성: MeetingNote, AiJob, DealActivity
- 조회: MeetingNote, Deal, Company, Contact
- 수정: MeetingNote
- 삭제: MeetingNote.deletedAt, MeetingNote.permanentDeleteAt
- transaction: 딜 연결과 DealActivity 생성은 transaction 필요
- 에러: `MeetingNoteNotFound` 404, `DealNotFound` 404, `InvalidMeetingNoteGeneratedFields` 400, `OwnershipViolation` 403, `DeletedResource` 조회 410/변경 409

## 5. BusinessCard OCR API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 명함 OCR 요청 API | `ScanBusinessCard` | `POST` | `/api/business-cards/scan` | `ScanBusinessCardRequest` | `BusinessCardScanResponse` | BusinessCardScan, AiJob |
| OCR 결과 조회 API | `GetBusinessCardScan` | `GET` | `/api/business-cards/:scanId` | `GetBusinessCardScanRequest` | `BusinessCardScanDetailResponse` | BusinessCardScan |
| OCR 결과 확정 저장 API | `ConfirmBusinessCardScan` | `POST` | `/api/business-cards/:scanId/confirm` | `ConfirmBusinessCardScanRequest` | `BusinessCardConfirmResponse` | Company, Contact, BusinessCardScan |

### BusinessCard request/response

| Request 이름 | 필드 |
|---|---|
| `ScanBusinessCardRequest` | `imageFile:file 필수`, `memo?:string` |
| `ConfirmBusinessCardScanRequest` | `scanId:string path 필수`, `companyMode:EXISTING|NEW|NONE`, `companyId?:string`, `companyName?:string`, `contactName:string 필수`, `department?:string`, `position?:string`, `phone?:string`, `email?:string` |

| Response 이름 | 주요 필드 |
|---|---|
| `BusinessCardScanResponse` | `scanId`, `status`, `createdAt` |
| `BusinessCardScanDetailResponse` | `scanId`, `status`, `extracted`, `companyCandidates[]`, `errorMessage` |
| `BusinessCardConfirmResponse` | `company?:CompanyResponse`, `contact:ContactResponse` |

### BusinessCard 비즈니스 로직과 DB

1. 이미지 확장자와 용량을 validation한다.
2. Backend가 `StoragePort`로 명함 이미지를 Supabase Storage에 저장한다.
3. `BusinessCardScan`에는 이미지 public URL이 아니라 bucket/object key 중심 metadata를 저장한다.
4. OCR adapter는 port 뒤에서 호출하며 MVP 기능은 실제 OpenAI/OCR provider를 사용한다.
5. OCR 결과는 자동 저장하지 않는다.
6. 기존 회사 후보를 보여주고 사용자가 확정해야 Company/Contact가 생성된다.
7. 회사 없이 거래처(담당자) 저장도 허용한다.

- 생성: BusinessCardScan, AiJob, Company, Contact, storage object
- 조회: BusinessCardScan, Company
- 수정: BusinessCardScan.status
- transaction: 확정 저장 시 Company/Contact/BusinessCardScan 상태 변경 transaction 필요
- 에러: `InvalidImageFile` 400, `BusinessCardScanNotFound` 404, `BusinessCardAlreadyConfirmed` 409

## 6. Import/Export API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| Import 업로드 API | `CreateImportJob` | `POST` | `/api/imports` | `CreateImportJobRequest` | `ImportJobResponse` | ImportJob, ImportJobRow |
| Import AI 매핑 API | `GenerateImportMapping` | `POST` | `/api/imports/:importJobId/map` | `GenerateImportMappingRequest` | `ImportMappingResponse` | ImportJob, AiJob |
| Import 매핑 수정 API | `UpdateImportMapping` | `PATCH` | `/api/imports/:importJobId/mapping` | `UpdateImportMappingRequest` | `ImportJobResponse` | ImportJob |
| Import 확정 실행 API | `ConfirmImportJob` | `POST` | `/api/imports/:importJobId/confirm` | `ConfirmImportJobRequest` | `ImportJobResultResponse` | ImportJob, Company, Contact, Product, Deal |
| Import 결과 조회 API | `GetImportJob` | `GET` | `/api/imports/:importJobId` | `GetImportJobRequest` | `ImportJobDetailResponse` | ImportJob, ImportJobRow |
| Export 생성 API | `CreateExportJob` | `POST` | `/api/exports` | `CreateExportJobRequest` | `ExportJobResponse` | ExportJob |
| Export 상태 조회 API | `GetExportJob` | `GET` | `/api/exports/:exportJobId` | `GetExportJobRequest` | `ExportJobResponse` | ExportJob |
| Export 다운로드 API | `DownloadExportFile` | `GET` | `/api/exports/:exportJobId/download` | `DownloadExportFileRequest` | file stream | ExportJob |

### Import/Export request/response

| Request 이름 | 필드 |
|---|---|
| `CreateImportJobRequest` | `targetType:COMPANY|CONTACT|PRODUCT|DEAL`, `file:file 필수` |
| `GenerateImportMappingRequest` | `importJobId:string path 필수` |
| `UpdateImportMappingRequest` | `mapping:object 필수` |
| `ConfirmImportJobRequest` | `confirm:boolean 필수` |
| `CreateExportJobRequest` | `targetType:COMPANY|CONTACT|PRODUCT|DEAL|SCHEDULE|MEETING_NOTE`, `format:PDF|EXCEL|CSV`, `includeSensitiveData?:boolean`, `sensitiveConfirm?:boolean`, `filters?:object` |

| Response 이름 | 주요 필드 |
|---|---|
| `ImportJobResponse` | `id`, `targetType`, `status`, `rowCount`, `validRowCount`, `invalidRowCount`, `mapping`, `previewRows[]`, `errors[]`, `createdAt`, `updatedAt` |
| `ImportMappingResponse` | `suggestedMapping`, `confidence`, `unmappedColumns[]` |
| `ImportJobResultResponse` | `id`, `status`, `successCount`, `failedCount`, `errors[].rowNumber`, `errors[].message` |
| `ExportJobResponse` | `id`, `targetType`, `format`, `status`, `includeSensitiveData`, `downloadReady`, `createdAt` |

### Import/Export 비즈니스 로직과 DB

1. Import는 CSV/Excel parser adapter로 파일을 파싱한다.
2. Import 원본 파일은 `StoragePort`로 저장하고 `ImportJob`에는 bucket/object key 중심 metadata를 저장한다.
3. 업로드 후 Backend는 preview row와 1차 validation 결과를 만든다.
4. AI 매핑은 mapping port 뒤에서 실행하며 MVP 기능은 실제 OpenAI adapter를 사용한다.
5. mapping 수정 후 Backend는 mapped preview와 row별 validation 결과를 다시 계산한다.
6. 사용자가 preview와 mapping을 확인해야 Import를 실행한다.
7. preview에 validation error row가 있으면 확정 실행을 막는다.
8. Import 확정 실행은 all-or-nothing transaction으로 처리한다.
9. 확정 실행 중 한 row라도 실패하면 도메인 데이터 변경은 전체 rollback하고, 실패 row number와 사유를 결과로 저장한다.
10. Export는 민감 데이터 기본 제외다.
11. Export 생성 파일은 `StoragePort`로 저장하고 `ExportJob`에는 bucket/object key 중심 metadata를 저장한다.
12. Export 다운로드는 `StoragePort`에서 stream 또는 signed URL을 얻어 반환한다.
13. 민감 데이터 포함 시 `sensitiveConfirm = true`가 없으면 실패한다.

- 생성: ImportJob, ImportJobRow, AiJob, ExportJob, storage object
- 조회: Company, Contact, Product, Deal, Schedule, MeetingNote
- 수정: ImportJob.status, ImportJobRow.status, ExportJob.status
- transaction: Import 확정 실행 시 target 도메인 insert/update는 단일 transaction, 실패 row 기록은 rollback 이후 별도 상태 갱신
- 에러: `InvalidImportFile` 400, `ImportMappingRequired` 409, `ImportValidationFailed` 409, `ImportExecutionFailed` 409, `SensitiveExportConfirmationRequired` 400

## 7. Notification, Trash, Search API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 알림 목록 API | `ListNotifications` | `GET` | `/api/notifications` | `ListNotificationsRequest` | `NotificationListResponse` | Notification |
| 알림 읽음 API | `MarkNotificationRead` | `PATCH` | `/api/notifications/:notificationId/read` | `MarkNotificationReadRequest` | `NotificationResponse` | Notification |
| 알림 설정 수정 API | `UpdateNotificationSettings` | `PATCH` | `/api/notifications/settings` | `UpdateNotificationSettingsRequest` | `UserSettingResponse` | UserSetting |
| 휴지통 목록 API | `ListTrash` | `GET` | `/api/trash` | `ListTrashRequest` | `TrashListResponse` | 주요 deletedAt 모델 |
| 휴지통 복구 API | `RestoreTrashItem` | `POST` | `/api/trash/:targetType/:targetId/restore` | `RestoreTrashItemRequest` | `TrashRestoreResponse` | 주요 deletedAt 모델 |
| 완전 삭제 차단 API | `PermanentlyDeleteTrashItem` | `DELETE` | `/api/trash/:targetType/:targetId/permanent` | `PermanentlyDeleteTrashItemRequest` | `PermanentDeleteNotAllowed` | 없음. MVP 1차 사용자 즉시 완전 삭제는 차단 |
| 통합검색 API | `SearchAll` | `GET` | `/api/search` | `SearchAllRequest` | `SearchAllResponse` | Company, Contact, Product, Deal, Schedule, MeetingNote |

### Notification/Trash/Search request/response

| Request 이름 | 필드 |
|---|---|
| `ListNotificationsRequest` | `page?:number`, `pageSize?:number`, `status?:UNREAD|READ` |
| `UpdateNotificationSettingsRequest` | `defaultReminderMinutes?:number`, `emailNotificationEnabled?:boolean`, `browserPushEnabled?:boolean` |
| `ListTrashRequest` | `targetType?:enum`, `page?:number`, `pageSize?:number` |
| `SearchAllRequest` | `q:string 필수`, `types?:(COMPANY|CONTACT|PRODUCT|DEAL|SCHEDULE|MEETING_NOTE)[]`, `limit?:number`. `limit`은 type별 limit이며 기본값은 5 |

| Response 이름 | 주요 필드 |
|---|---|
| `NotificationResponse` | `id`, `type`, `channel`, `status`, `title`, `body`, `scheduledAt`, `readAt`, `targetType`, `targetId` |
| `TrashListResponse` | `items[]`, `items[].targetType`, `items[].targetId`, `items[].title`, `items[].deletedAt`, `items[].permanentDeleteAt` |
| `SearchAllResponse` | `groups[]`, `groups[].type`, `groups[].items[]`, `groups[].items[].title`, `groups[].items[].subtitle`, `groups[].items[].targetId`, `groups[].items[].targetPath?` |

### Notification/Trash/Search 비즈니스 로직과 DB

1. 알림은 일정 시작 전, 딜 마감일, 다음 행동, 회의록 생성 완료를 대상으로 생성한다.
2. 알림 발송 adapter는 MVP local에서 mock으로 둔다.
3. 휴지통은 주요 엔티티의 `deletedAt` 데이터를 모아 보여준다.
4. 사용자 즉시 완전 삭제는 MVP 1차에서 제공하지 않고 시스템 자동 완전 삭제만 수행한다.
5. 통합검색은 초기에는 DB `ILIKE` 기반으로 구현한다.
6. 통합검색 기본 대상은 Company, Contact, Product, Deal, Schedule, MeetingNote다.
7. 통합검색은 `deletedAt IS NULL`인 데이터만 기본 검색한다.
8. 검색어는 trim 후 2자 이상부터 실행한다.
9. 검색 결과는 type별 최대 5개를 기본으로 하며 진행 중 딜과 최근 항목을 우선 정렬한다.
10. Memo 원문, `MeetingNote.rawInput`, Admin 민감 원문은 검색 결과 title/subtitle에 노출하지 않는다.

- 생성: Notification
- 조회: Company, Contact, Product, Deal, Schedule, MeetingNote, Notification
- 수정: Notification, UserSetting, deletedAt 복구
- 삭제: 30일 경과 후 시스템 자동 완전 삭제 대상 모델
- transaction: 휴지통 복구와 연결 데이터 복구 정책에 따라 필요
- 에러: `NotificationNotFound` 404, `TrashItemNotFound` 404, `SearchQueryRequired` 400, `PermanentDeleteNotAllowed` 409

## 8. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P3-G17-G20-SCHEDULE-MEETING.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`

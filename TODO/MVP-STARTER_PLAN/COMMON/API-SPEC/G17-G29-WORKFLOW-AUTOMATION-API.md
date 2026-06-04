# G17-G29 업무 흐름/자동화 API 명세

## 1. 목적

이 문서는 일정, 회의록, 명함 OCR, Import/Export, 알림, 휴지통, 통합검색 API 계약을 정의한다.

이 범위의 API는 MVP 핵심 루프를 확장하지만, 외부 Provider 실제 호출은 기본적으로 mock adapter 뒤에 둔다.

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
| 주간 일정 조회 API | `GetWeeklySchedules` | `GET` | `/api/schedules/week` | `GetWeeklySchedulesRequest` | `WeeklyScheduleResponse` | Schedule |
| 주간 일정 Export API | `CreateWeeklyScheduleExport` | `POST` | `/api/schedules/week/export` | `CreateWeeklyScheduleExportRequest` | `ExportJobResponse` | ExportJob |
| Google Calendar 연결 시작 API | `StartGoogleCalendarConnect` | `POST` | `/api/schedules/google/connect` | `StartGoogleCalendarConnectRequest` | `ExternalCalendarConnectResponse` | ExternalCalendarConnection |
| Google Calendar 가져오기 API | `ImportGoogleCalendarEvents` | `POST` | `/api/schedules/google/import` | `ImportGoogleCalendarEventsRequest` | `GoogleCalendarImportResponse` | Schedule, ExternalCalendarConnection |

### Schedule request/response

| Request 이름 | 필드 |
|---|---|
| `ListSchedulesRequest` | `from?:string`, `to?:string`, `dealId?:string`, `companyId?:string`, `contactId?:string`, `source?:INTERNAL|GOOGLE` |
| `CreateScheduleRequest` | `title:string 필수`, `startAt:string 필수`, `endAt:string 필수`, `location?:string`, `dealId?:string`, `companyId?:string`, `contactId?:string`, `memo?:string`, `reminderMinutes?:number[]` |
| `UpdateScheduleRequest` | `scheduleId:string path 필수`, 생성 필드 중 수정할 필드 |
| `GetWeeklySchedulesRequest` | `weekStart:string 필수`, `timezone?:string` |
| `CreateWeeklyScheduleExportRequest` | `weekStart:string 필수`, `format:PDF|EXCEL`, `includeSensitiveData?:boolean`, `sensitiveConfirm?:boolean` |

| Response 이름 | 주요 필드 |
|---|---|
| `ScheduleResponse` | `id`, `title`, `startAt`, `endAt`, `location`, `source`, `dealId`, `dealTitle`, `companyId`, `companyName`, `contactId`, `contactName`, `reminders`, `createdAt`, `updatedAt`, `deletedAt` |
| `WeeklyScheduleResponse` | `weekStart`, `weekEnd`, `days[]`, `days[].schedules[]` |
| `GoogleCalendarImportResponse` | `importedCount`, `skippedCount`, `createdScheduleIds[]` |

### Schedule 비즈니스 로직과 DB

1. 모든 User API는 AuthGuard와 userId ownership 필터를 적용한다.
2. 일정은 딜 없이 저장할 수 있다.
3. 딜에서 만든 일정은 회사/거래처 기본값을 상속할 수 있다.
4. Google Calendar 가져오기는 외부 provider port를 통해 수행하고, MVP 구현 전에는 mock adapter를 사용한다.
5. Google Calendar에서 가져온 일정은 `source = GOOGLE`과 external id를 저장해 중복 생성을 막는다.

- 생성: Schedule, ScheduleReminder, ExportJob
- 조회: Schedule, Deal, Company, Contact, ExternalCalendarConnection
- 수정: Schedule, ScheduleReminder
- 삭제: Schedule.deletedAt
- transaction: 일정과 알림 생성 동시 처리 시 필요
- 에러: `ScheduleNotFound` 404, `InvalidScheduleRange` 400, `OwnershipViolation` 403, `ExternalCalendarNotConnected` 409

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
| `MeetingNoteResponse` | `id`, `meetingDate`, `companyName`, `contactName`, `department`, `item`, `stage`, `details`, `nextPlan`, `requiredAction`, `dealId`, `dealTitle`, `createdAt`, `updatedAt`, `deletedAt` |

### MeetingNote 비즈니스 로직과 DB

1. AI 회의록 생성은 OpenAI 직접 호출이 아니라 `AiMeetingNotePort` 뒤에서 실행한다.
2. MVP local에서는 mock AI adapter를 사용한다.
3. 회의록은 딜 없이 저장 가능하다.
4. 딜 연결 시 현재 사용자 소유 딜인지 검증한다.
5. 딜 연결 성공 시 `DealActivity`를 자동 생성한다.

- 생성: MeetingNote, AiJob, DealActivity
- 조회: MeetingNote, Deal, Company, Contact
- 수정: MeetingNote
- 삭제: MeetingNote.deletedAt
- transaction: 딜 연결과 DealActivity 생성은 transaction 필요
- 에러: `MeetingNoteNotFound` 404, `DealNotFound` 404, `InvalidMeetingNoteGeneratedFields` 400, `OwnershipViolation` 403

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
2. OCR adapter는 port 뒤에서 호출하며 local은 mock adapter를 사용한다.
3. OCR 결과는 자동 저장하지 않는다.
4. 기존 회사 후보를 보여주고 사용자가 확정해야 Company/Contact가 생성된다.
5. 회사 없이 거래처(담당자) 저장도 허용한다.

- 생성: BusinessCardScan, AiJob, Company, Contact
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
| `ImportJobResponse` | `id`, `targetType`, `status`, `rowCount`, `mapping`, `createdAt`, `updatedAt` |
| `ImportMappingResponse` | `suggestedMapping`, `confidence`, `unmappedColumns[]` |
| `ImportJobResultResponse` | `id`, `status`, `successCount`, `failedCount`, `errors[]` |
| `ExportJobResponse` | `id`, `targetType`, `format`, `status`, `includeSensitiveData`, `downloadReady`, `createdAt` |

### Import/Export 비즈니스 로직과 DB

1. Import는 CSV/Excel parser adapter로 파일을 파싱한다.
2. AI 매핑은 mapping port 뒤에서 실행하며 local은 mock adapter를 사용한다.
3. 사용자가 매핑을 확인해야 Import를 실행한다.
4. Export는 민감 데이터 기본 제외다.
5. 민감 데이터 포함 시 `sensitiveConfirm = true`가 없으면 실패한다.

- 생성: ImportJob, ImportJobRow, AiJob, ExportJob
- 조회: Company, Contact, Product, Deal, Schedule, MeetingNote
- 수정: ImportJob.status, ImportJobRow.status, ExportJob.status
- transaction: Import 확정 실행 시 row별 처리와 job 상태 갱신
- 에러: `InvalidImportFile` 400, `ImportMappingRequired` 409, `SensitiveExportConfirmationRequired` 400

## 7. Notification, Trash, Search API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 알림 목록 API | `ListNotifications` | `GET` | `/api/notifications` | `ListNotificationsRequest` | `NotificationListResponse` | Notification |
| 알림 읽음 API | `MarkNotificationRead` | `PATCH` | `/api/notifications/:notificationId/read` | `MarkNotificationReadRequest` | `NotificationResponse` | Notification |
| 알림 설정 수정 API | `UpdateNotificationSettings` | `PATCH` | `/api/notifications/settings` | `UpdateNotificationSettingsRequest` | `UserSettingResponse` | UserSetting |
| 휴지통 목록 API | `ListTrash` | `GET` | `/api/trash` | `ListTrashRequest` | `TrashListResponse` | 주요 deletedAt 모델 |
| 휴지통 복구 API | `RestoreTrashItem` | `POST` | `/api/trash/:targetType/:targetId/restore` | `RestoreTrashItemRequest` | `TrashRestoreResponse` | 주요 deletedAt 모델 |
| 완전 삭제 API | `PermanentlyDeleteTrashItem` | `DELETE` | `/api/trash/:targetType/:targetId/permanent` | `PermanentlyDeleteTrashItemRequest` | `TrashPermanentDeleteResponse` | 주요 deletedAt 모델 |
| 통합검색 API | `SearchAll` | `GET` | `/api/search` | `SearchAllRequest` | `SearchAllResponse` | Company, Contact, Product, Deal, Schedule, MeetingNote |

### Notification/Trash/Search request/response

| Request 이름 | 필드 |
|---|---|
| `ListNotificationsRequest` | `page?:number`, `pageSize?:number`, `status?:UNREAD|READ` |
| `UpdateNotificationSettingsRequest` | `defaultReminderMinutes?:number`, `emailNotificationEnabled?:boolean`, `browserPushEnabled?:boolean` |
| `ListTrashRequest` | `targetType?:enum`, `page?:number`, `pageSize?:number` |
| `SearchAllRequest` | `q:string 필수`, `types?:string[]`, `limit?:number` |

| Response 이름 | 주요 필드 |
|---|---|
| `NotificationResponse` | `id`, `type`, `channel`, `status`, `title`, `body`, `scheduledAt`, `readAt`, `targetType`, `targetId` |
| `TrashListResponse` | `items[]`, `items[].targetType`, `items[].targetId`, `items[].title`, `items[].deletedAt`, `items[].permanentDeleteAt` |
| `SearchAllResponse` | `groups[]`, `groups[].type`, `groups[].items[]`, `groups[].items[].title`, `groups[].items[].subtitle`, `groups[].items[].targetId` |

### Notification/Trash/Search 비즈니스 로직과 DB

1. 알림은 일정 시작 전, 딜 마감일, 다음 행동, 회의록 생성 완료를 대상으로 생성한다.
2. 알림 발송 adapter는 MVP local에서 mock으로 둔다.
3. 휴지통은 주요 엔티티의 `deletedAt` 데이터를 모아 보여준다.
4. 완전 삭제는 MVP에서 위험 액션으로 보고 별도 확인 UI가 필요하다.
5. 통합검색은 초기에는 DB `ILIKE` 기반으로 구현한다.
6. 검색 결과는 진행 중 딜과 최근 항목을 우선 정렬한다.

- 생성: Notification
- 조회: Company, Contact, Product, Deal, Schedule, MeetingNote, Notification
- 수정: Notification, UserSetting, deletedAt 복구
- 삭제: 완전 삭제 대상 모델
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

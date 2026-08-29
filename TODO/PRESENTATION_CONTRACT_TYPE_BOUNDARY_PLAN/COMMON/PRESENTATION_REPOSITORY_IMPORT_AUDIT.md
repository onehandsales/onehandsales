# Presentation Repository Import Audit

상태: G01 DTO boundary completed / G02 mapper boundary next
감사일: 2026-08-29
재검토일: 2026-08-29

## 1. 감사 명령

```bash
cd BE
rg -n 'application/ports/.+repository|application\\ports\\.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg 'presentation'
```

직접 repository token/interface 사용 확인:

```bash
cd BE
rg -n '@Inject\(|REPOSITORY|Repository' src/modules/*/presentation -g '*.ts' -g '!*.spec.ts'
```

## 2. 결론

- G08 baseline에서 presentation의 repository port import는 22 line, 20 file이었다.
- G01 완료 후 presentation의 repository port import는 9 line, 9 file이며 모두 response mapper 대상이다.
- presentation에서 repository token 또는 repository interface를 직접 주입/사용한 항목은 없다.
- DTO validation enum/const/type은 `G01`에서 repository port 밖의 non-repository contract 파일로 분리 완료했다.
- response mapper 입력 projection record는 application service 출력/read model 계약으로 분리해야 하며 범위가 넓으므로 `G02`에서 별도 처리한다.

## 3. DTO validation 경계 대상

| 파일 | repository port import | 사용 방식 | 후속 |
| --- | --- | --- | --- |
| `BE/src/modules/schedule/presentation/http/dto/schedule-request.dto.ts` | `ScheduleViewMode`, `ScheduleSourceTypeFilter`, `ScheduleVisibility` | `@IsEnum`, `@IsIn`, query type | G01 Completed |
| `BE/src/modules/schedule/presentation/http/dto/google-calendar-request.dto.ts` | `GoogleCalendarDisconnectScheduleAction`, `GoogleCalendarSyncTrigger` | type-only + local `@IsIn` values | G01 Completed |
| `BE/src/modules/company/presentation/http/dto/company-request.dto.ts` | `CompanyListSort` | `@IsEnum`, query type | G01 Completed |
| `BE/src/modules/contact/presentation/http/dto/contact-request.dto.ts` | `ContactListSort` | `@IsEnum`, query type | G01 Completed |
| `BE/src/modules/product/presentation/http/dto/product-request.dto.ts` | `ProductListSort` | `@IsEnum`, query type | G01 Completed |
| `BE/src/modules/deal/presentation/http/dto/deal-request.dto.ts` | `DealListSort`, `DEAL_ACTIVITY_TYPES`, `MANUAL_DEAL_ACTIVITY_TYPES`, `DealActivityTypeCode`, `ManualDealActivityTypeCode` | `@IsEnum`, `@IsIn`, query/body type | G01 Completed |
| `BE/src/modules/meeting-note/presentation/http/dto/meeting-note-request.dto.ts` | `MeetingNoteSort`, `MeetingNoteSourceTypeValue` | `@IsEnum`, query/body type | G01 Completed |
| `BE/src/modules/trash/presentation/http/dto/trash-request.dto.ts` | `TrashDomainFilter`, `TrashItemKindFilter`, `TrashLogTypeFilter`, `TrashSort`, `TrashTargetType` | type-only + local `@IsIn` values | G01 Completed |
| `BE/src/modules/data-import/presentation/http/dto/import-job-request.dto.ts` | `ImportTemplateType` | type-only + local `@IsIn` values | G01 Completed |
| `BE/src/modules/business-card/presentation/http/dto/business-card-request.dto.ts` | `BusinessCardScanStatusValue` | `@IsEnum`, query type | G01 Completed |
| `BE/src/modules/admin-operation/presentation/http/dto/admin-user-request.dto.ts` | `AdminUserListSort` | `@IsEnum`, query type | G01 Completed |

## 4. Response mapper projection 경계 대상

| 파일 | repository port import | 사용 방식 | 후속 |
| --- | --- | --- | --- |
| `BE/src/modules/account-request/presentation/http/account-request-response.mapper.ts` | `AccountDeletionRequestRecord`, `UserDataExportRequestRecord`, `UserDataExportRequestStatusValue` | mapper input/response type | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-system-operation-response.mapper.ts` | `AdminOperationCheckItemsRecord`, `AdminOperationCheckRunRecord` | mapper input/response alias | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-provider-failure-response.mapper.ts` | `AdminProviderFailureDetailRecord`, `AdminProviderFailureListPageRecord`, `AdminProviderFailureRecord`, `AdminProviderFailureSafeContext` | mapper input/response type | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-account-request-response.mapper.ts` | `AdminAccountDeletionRequestsPageRecord`, `AdminDataExportRequestsPageRecord` | mapper input type | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-user-response.mapper.ts` | `AdminUserActivityTimelinePageRecord`, `AdminUserActivityTimelineRecord`, `AdminUserAnalyticsSummaryRecord`, `AdminUserListDomainCountsRecord`, `AdminUserListItemRecord`, `AdminUserListPageRecord`, `AdminUserNotificationSummaryRecord`, `AdminUserOverviewDomainCountsRecord`, `AdminUserOverviewRecord`, `AdminUserProfileRecord`, `AdminUserTrashSummaryRecord` | mapper input/response type | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-domain-record-response.mapper.ts` | `AdminDomainRecordDomain`, `AdminDomainRecordItemRecord`, `AdminDomainRecordSensitiveFlags`, `AdminDomainRecordStatus`, `AdminDomainRecordSummary`, `AdminDomainRecordsPageRecord` | mapper input/response type | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-trash-response.mapper.ts` | `AdminTrashRecoveryRequestsPageRecord`, `AdminTrashRecordsPageRecord`, `AdminTrashSummaryRecord` | mapper input/response type | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-analytics-response.mapper.ts` | `AdminAnalyticsActivationRecord`, `AdminAnalyticsAiUsageRecord`, `AdminAnalyticsEventCountRecord`, `AdminAnalyticsMobileFieldUseRecord`, `AdminAnalyticsOverviewRecord`, `AdminAnalyticsRangeRecord`, `AdminAnalyticsRetentionRecord`, `AdminAnalyticsRouteViewRecord` | mapper input/response alias | G02 |
| `BE/src/modules/admin-operation/presentation/http/admin-audit-response.mapper.ts` | `AdminAuditLogPageRecord`, `AdminAuditLogRecord`, `AdminSensitiveAccessRecord`, `AdminSensitiveRawDataRecord` | mapper input type | G02 |

## 5. 직접 repository 사용 확인 결과

아래 패턴은 0건이다.

- presentation controller/DTO/mapper의 repository token import
- presentation constructor의 repository interface 주입
- presentation 계층의 `@Inject(...REPOSITORY...)`

## 5.1 G01 완료 후 잔여 import

2026-08-29 G01 완료 후 아래 명령 결과 DTO import는 0건이다.

```bash
cd BE
rg -n 'application/ports/.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg '/presentation/http/dto/'
```

전체 presentation 잔여 repository port import는 아래 9개 response mapper 파일이다.

```text
src/modules/account-request/presentation/http/account-request-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-account-request-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-analytics-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-audit-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-domain-record-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-provider-failure-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-system-operation-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-trash-response.mapper.ts
src/modules/admin-operation/presentation/http/admin-user-response.mapper.ts
```

2026-08-29 추가 재검토에서 위 9개 파일 외 presentation repository port import는 발견하지 못했다. DTO repository port import, presentation 직접 repository token/interface 사용, G01 이동 대상의 `*repository.ts` export 잔존 검색은 모두 출력 없음이다.

## 6. 분리 방향

- DTO validation 값 중 application service input과 repository input이 함께 쓰는 값은 `application/ports/*.types.ts`처럼 non-repository contract 파일로 이동한다.
- HTTP 검증에만 필요한 값은 presentation DTO 내부 또는 presentation contract 파일에 둔다.
- response mapper 입력 타입은 repository port record가 아니라 application service output/read model contract를 참조하도록 분리한다.
- API 계약 의미가 바뀌는 경우 해당 goal 안에서 처리하지 않고 API-SPEC 갱신이 필요한 별도 계획으로 승격한다.

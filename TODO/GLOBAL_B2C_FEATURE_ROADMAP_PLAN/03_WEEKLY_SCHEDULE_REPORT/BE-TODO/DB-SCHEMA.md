# DB Schema TODO

상태: Draft

## 모델 후보

- 1차는 기존 `Schedule`, `ScheduleDeal`, `Deal` 조회로 충분할 수 있다.
- snapshot 저장이 필요하면 `WeeklyScheduleReportSnapshot` 후보를 검토한다.
- 파일 job이 필요하면 `ExportJob` 또는 schedule report 전용 job을 검토한다.
- 범용 export를 넣으면 `ExportJob`, `ExportJobFile`, `ExportJobFilter` 후보를 검토한다.
- 반복 일정을 넣으면 `ScheduleRecurringRule`, `ScheduleRecurringException` 후보를 검토한다.

## 결정 필요

- 보고서가 실시간 계산인지 snapshot인지
- PDF/Excel 파일을 DB metadata와 storage에 저장할지
- export job table이 06/12 등 다른 기능과 공유될지
- 민감 데이터 포함 export를 audit log와 연결할지
- 반복 일정 instance를 materialize할지, 조회 시 계산할지

## migration 주의

- 실시간 조회만 하면 새 migration이 없을 수 있다.
- 파일 저장을 넣으면 storage metadata와 TTL이 필요하다.
- 범용 ExportJob은 대량 데이터와 provider/storage 실패를 전제로 설계한다.
- 반복 일정은 timezone 경계와 DST 처리가 필요하다.

# DB Schema TODO

상태: Draft

## 모델 후보

- `ImportJob`
- `ImportJobRow`
- `ImportJobError`
- `ImportUploadedFile` 후보
- 기존 `ImportUserLog`, `ImportUserLogRow` 재사용 또는 분리

## 결정 필요

- 확정 전 job과 확정 완료 log를 같은 table로 둘지 분리할지
- 원본 파일 metadata 저장 여부
- 원본 파일 storage key, checksum, byte size, MIME type 저장 여부
- preview raw row 저장 여부
- mapped row JSON 저장 여부
- TTL cleanup job 구현 위치
- 개인정보 삭제 요청 시 처리 범위

## migration 주의

- 기존 `ImportUserLog`와 의미가 충돌하지 않아야 한다.
- 대량 row 저장 시 index와 JSON column 사용 범위를 검토한다.
- 원본 파일을 저장하면 encryption, virus scan, signed URL, purge 처리 기준이 필요하다.

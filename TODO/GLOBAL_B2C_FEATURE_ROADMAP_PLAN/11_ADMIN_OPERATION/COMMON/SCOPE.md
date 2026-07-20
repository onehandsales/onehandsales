# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| 사용자 조회 | 사용자 목록/상세/상태 |
| 도메인 조회 | 회사/담당자/제품/딜/일정/회의록 read-only 조회 |
| 민감정보 마스킹 | 기본 masked response |
| 원문 조회 사유 | 민감 원문 조회 시 reason과 audit |
| Provider failure | AI/OCR/Calendar/Push 실패 확인 |
| Trash/삭제 정책 | 만료, purge, 복구 불가, 유료 복구 후보 |
| 계정 삭제/데이터 삭제 | 사용자 요청 기반 삭제 정책과 API 후보 |
| 사용자 데이터 export 정책 | 자기 데이터 export, 민감정보 포함/제외 정책 |
| 자동 민감정보 감지 | 회의록, 메모, export, Admin 원문 조회와 연결 |
| DB/Prisma/migration gate | migration status, seed 정책, 배포 DB 정합성 |
| Backup/restore | 데이터 복구, 장애 대응, 운영 절차 |
| Provider failure log | OpenAI/OCR/STT/Calendar/Push 장애 추적 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 결제 관리 전체 | 12와 연결하되 여기서는 운영 기반 |
| 내부 직원 권한 체계 고도화 | 최소 Admin 이후 |
| 고객 성공 CRM | 별도 운영 도구 후보 |

## 열린 질문

- 첫 Admin 사용자는 `INITIAL_ADMIN_EMAILS` 기반으로 충분한가?
- 운영자가 어떤 민감정보 원문을 볼 수 있어야 하는가?
- Admin 조회가 가능한 도메인 범위는 어디까지인가?
- audit log는 모든 조회를 남길지 원문 조회만 남길지?
- Trash 보관 기간과 purge 시점을 7일/30일 중 무엇으로 볼지?
- 사용자가 자기 계정과 데이터를 삭제할 수 있어야 하는 범위는?
- 사용자 데이터 export는 03 ExportJob을 재사용할지 별도 privacy export로 둘지?
- DB/Prisma gate는 배포 전 수동 checklist인지 자동 smoke인지?
- backup/restore는 provider 기능을 사용할지 앱 레벨 절차를 둘지?

## 완료 기준 초안

- Admin이 사용자와 핵심 도메인 데이터를 조회할 수 있다.
- 민감정보는 기본 마스킹된다.
- 원문 조회는 사유와 audit log가 필요하다.
- User Web이 Admin API를 호출할 수 없다.
- Trash/삭제/계정 삭제/데이터 export 정책이 문서화된다.
- DB/Prisma/migration gate와 backup/restore 기준이 문서화된다.
- provider failure log가 사용자 메시지와 분리된다.

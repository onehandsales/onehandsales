# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| DB 영속화 | 확정 전 ImportJob과 preview row를 DB에 저장한다. |
| 이어받기 | 사용자가 `/app/import/:importJobId` 또는 최근 job에서 작업을 재개한다. |
| TTL/cleanup | 오래된 확정 전 job을 자동 정리하는 기준을 둔다. |
| 개인정보 정책 | 업로드 원본/preview row 보관 기간과 삭제 기준을 정한다. |
| Import file metadata | 업로드 원본 저장 여부, storage key, 파일명/크기/MIME, checksum 기준을 정한다. |
| Export와의 경계 | 공통 파일 저장 기반이 필요하면 03 ExportJob과 정책을 맞춘다. |
| 배포 안정성 | BE 재시작 후에도 mapping/validation 상태가 유지된다. |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 일정/회의록 Import | 현재 Import 대상은 회사/담당자/제품/딜이다. |
| 대용량 background import worker | 필요하면 후속으로 분리한다. |
| 범용 file storage platform 전체 | 이 슬롯에서는 ImportJob에 필요한 저장/삭제/보안 범위만 다룬다. |

## 열린 질문

- 확정 전 job TTL은 몇 시간/며칠인가?
- 업로드 원본 파일을 저장할지, parsed row만 저장할지?
- 원본 파일 저장 시 storage key와 사용자 데이터 export/delete 정책은 11과 어떻게 연결할지?
- 사용자가 진행 중 job을 수동 취소할 수 있어야 하는가?
- confirm 후 job row를 ImportUserLog로 복사하고 원본 job을 삭제할지?

## 완료 기준 초안

- 서버 재시작 후에도 확정 전 ImportJob을 조회할 수 있다.
- refresh 후 사용자가 mapping/validation 화면으로 돌아올 수 있다.
- 만료/삭제된 job에 대해 사용자 메시지가 명확하다.
- 사용자 ownership이 보장된다.
- 원본 파일/preview row 보관과 삭제 정책이 11 운영 정책과 충돌하지 않는다.

# User Web TODO

상태: Draft

## 화면 후보

- `/app/import`
- `/app/import/:importJobId`

## 작업 후보

- 진행 중 ImportJob 목록 또는 최근 job resume 진입점
- refresh 후 mapping/preview 상태 복구
- 만료된 job 안내
- 취소/삭제된 job 안내
- 업로드 원본이 보관되는 경우 보관 기간/삭제 안내
- confirm 완료 후 import log detail 이동

## 검증 후보

- 업로드 후 새로고침해도 preview가 유지된다.
- 다른 사용자 job URL 접근 시 접근할 수 없다.
- expired job은 명확한 안내 후 새 import를 시작하게 한다.
- 개인정보/원본 파일 보관 안내가 11 데이터 정책과 어긋나지 않는다.

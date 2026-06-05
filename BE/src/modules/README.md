# 백엔드 모듈

이 폴더는 비즈니스 모듈을 두는 공간이다. 각 모듈은 자기 도메인 모델, use case, infrastructure adapter, presentation layer를 소유한다.

현재 모듈 지도:

| 모듈 | 목적 |
|---|---|
| `auth` | Supabase token 교환, App token, session, device |
| `user` | 현재 사용자, 설정, 계정 삭제 |
| `company` | 회사 CRUD, 회사 로그 |
| `contact` | 거래처(담당자) CRUD, 회사 관계, 거래처 로그 |
| `product` | 제품 CRUD, 제품 로그, 제품 연결 |
| `deal` | 딜 CRUD, 단계, 다음 행동, 활동 |
| `schedule` | 일정, 알림, Google Calendar import |
| `meeting-note` | 회의록, AI 생성, 딜 연결 |
| `business-card` | 명함 OCR scan과 확정 |
| `import-export` | import job, export job, 파일 adapter |
| `notification` | 인앱/email/browser push 알림 |
| `tag` | 태그, 태그 연결, append-only 태그 로그 |
| `audit-log` | 감사 로그 조회와 기록 port |
| `admin` | Admin 조회 모델과 민감정보 원문 조회 workflow |
| `health` | 가벼운 health endpoint |

전체 vertical slice를 추가할 때는 `_template`을 폴더 계약으로 사용한다.

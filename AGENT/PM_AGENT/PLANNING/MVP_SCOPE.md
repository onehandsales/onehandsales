# MVP 기능 범위

현재 MVP 문서는 고정형 CRM 기능 제거 이후 남은 foundation 범위를 설명한다.

## 포함

- OAuth 기반 로그인과 앱 세션 관리
- 내 프로필, 연결 계정, 로그인 기기, 세션 관리
- `/app` 빈 홈
- `/app/more` 더보기와 계정 설정 모달
- 오류 신고, 지원 문의, 공개 문의
- 관리자 access token 권한 확인
- locale 기반 공개 사이트

## 제외

- 고정형 고객사 관리
- 고정형 고객사 검색과 xlsx export
- 팀/조직 권한 구조
- 결제와 구독 운영 화면
- 대량 데이터 관리 기능
- 외부 업무 도구 양방향 연동
- Workspace/Object/Attribute/Record/List/View 기반 CRM 코어 구현

## 완료 기준

- 남은 기능이 BE/FE/Prisma에서 모두 빌드된다.
- 사용자 화면의 `/app` 이후 route가 현재 활성 기능만 노출한다.
- 문서와 코드의 도메인 목록이 일치한다.

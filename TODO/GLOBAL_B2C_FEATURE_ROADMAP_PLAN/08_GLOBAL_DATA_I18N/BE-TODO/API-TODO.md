# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `PATCH` | `/api/users/me/profile` | locale/country/timezone 설정 보강 후보 |
| 기존 domain API | 회사/담당자/제품/딜 | phone/currency/address field 보강 후보 |
| 후보 | `/api/auth/providers` | Apple/LINE provider 노출 후보 |
| 후보 | `/api/auth/exchange` | Apple/LINE token exchange 후보 |

## 계약 보강 필요

- user locale/country preference
- phone country code
- currency code
- date/time response는 ISO 유지, FE 표시 책임
- validation error locale 처리 범위
- OAuth provider별 profile normalization
- provider account linking 정책
- Import/Export locale parameter 후보

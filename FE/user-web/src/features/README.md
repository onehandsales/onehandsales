# User Web Features

활성 feature는 실제 route/API가 연결된 범위만 기준으로 유지한다.

- `app-i18n`
- `auth`
- `company`
- `error-report`
- `public-contact-request`
- `public-site`
- `search`
- `support-request`
- `trash`

자리만 남은 feature folder:

- `schedule`
- `meeting-note`

새 feature를 추가할 때는 API client, query key, UI state, route ownership을 같은 feature 경계 안에서 관리한다.

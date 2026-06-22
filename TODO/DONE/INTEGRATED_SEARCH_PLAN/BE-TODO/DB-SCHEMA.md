# 통합검색 DB 스키마

## 1. 목적

통합검색은 기존 업무 데이터를 읽는 기능이다. 새 DB table과 migration을 만들지 않는다.

## 2. 조회 대상 모델

| 검색 타입 | Prisma model | 주요 검색 필드 | ownership |
|---|---|---|---|
| `COMPANY` | `Company`, `CompanyField`, `CompanyRegion` | `companyName`, `field`, `region` | `Company.userId` |
| `CONTACT` | `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade` | `username`, `email`, `mobile`, `companyName`, `departmentName`, `jobGradeName` | `Contact.userId` |
| `PRODUCT` | `Product`, `ProductCategory`, `ProductStatus` | `productName`, `categoryName`, `statusName` | `Product.userId` |
| `DEAL` | `Deal`, `Company`, `Contact` | `dealName`, `dealStatus`, `companyName`, `username` | `Deal.userId` |
| `SCHEDULE` | `Schedule`, `ScheduleDeal`, `Deal` | `scheduleTitle`, `location`, `memo`, `dealName` | `Schedule.userId` |
| `MEETING_NOTE` | `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal` | `details`, `nextPlan`, `requiredAction`, snapshot fields | `MeetingNote.userId` |

## 3. 인덱스 기준

기존 schema에 `userId`와 주요 목록 정렬 필드 인덱스가 있다. MVP 통합검색은 `contains` 기반 부분 검색으로 시작하고, 성능 문제가 확인되면 후속 계획에서 PostgreSQL full-text index 또는 별도 search engine을 검토한다.

## 4. 민감정보 기준

- 검색 query는 이메일, 휴대폰, 회의록 본문 일부와 매칭될 수 있다.
- 응답 subtitle은 화면 식별에 필요한 짧은 요약만 반환한다.
- 로그에는 검색어 원문과 결과 subtitle 원문을 남기지 않는다.

## 5. migration

- 필요 없음

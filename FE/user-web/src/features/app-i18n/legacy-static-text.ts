import type { AppLocale } from "@/features/app-i18n/constants";

type LegacyTextPattern = {
  readonly pattern: RegExp;
  readonly translate: (match: RegExpMatchArray, locale: AppLocale) => string;
};

// 기능 : 아직 직접 리소스화되지 않은 /app 정적 문구를 영어 locale에서 보조 번역합니다.
const LEGACY_KO_TO_EN: Readonly<Record<string, string>> = {
  저장: "Save",
  "저장 중": "Saving",
  "저장 중...": "Saving",
  닫기: "Close",
  취소: "Cancel",
  삭제: "Delete",
  수정: "Edit",
  추가: "Add",
  생성: "Create",
  검색: "Search",
  필터: "Filter",
  초기화: "Reset",
  전체: "All",
  상세: "Detail",
  완료: "Done",
  "다시 시도": "Try again",
  재시도: "Retry",
  예: "Yes",
  아니요: "No",
  "더 보기": "More",
  "불러오는 중": "Loading",
  "불러오는 중...": "Loading",
  "추가 중": "Adding",
  "목록으로": "Back to list",
  "전체 생성 페이지로 열기": "Open Full Page",
  "알림 닫기": "Close alert",
  "완료 처리": "Mark Complete",
  "완료 취소": "Mark Incomplete",

  알림: "Alert",
  설정: "Settings",
  내보내기: "Export",
  파일: "File",
  행: "Row",
  대상: "Target",
  유형: "Type",
  상태: "Status",
  제목: "Title",
  내용: "Content",
  이름: "Name",
  이메일: "Email",
  전화번호: "Phone",
  휴대폰번호: "Mobile",
  지역: "Region",
  분야: "Field",
  주소: "Address",
  장소: "Location",
  카테고리: "Category",
  "연결": "Connect",
  "연결됨": "Connected",
  "연결 안 됨": "Not Connected",
  "연결 해제": "Disconnect",
  "일반": "General",
  "제목 없음": "Untitled",
  "데이터가 존재하지 않아요": "No data.",
  "조건을 바꾸면 데이터를 찾을 수 있어요": "Change filters to find data.",
  "조건을 바꾸면 상태를 찾을 수 있어요.": "Change filters to find statuses.",
  "조건을 바꾸면 카테고리를 찾을 수 있어요.": "Change filters to find categories.",
  "조건을 바꾸면 지역을 찾을 수 있어요.": "Change filters to find regions.",
  "조건을 바꾸면 분야를 찾을 수 있어요.": "Change filters to find fields.",
  "항목을 추가하면 여기에서 볼 수 있어요.": "Add items to see them here.",

  "데이터를 삭제할까요?": "Delete this data?",
  "삭제했어요.": "Deleted.",
  "저장 완료": "Saved",
  "취소하기": "Cancel",
  "취소됨": "Canceled",
  "이름을 입력해 주세요.": "Enter a name.",
  "상세 내용을 입력해 주세요.": "Enter details.",
  "지역을 선택해 주세요.": "Select a region.",
  "상태를 선택해 주세요.": "Select a status.",
  "이메일 형식을 확인해 주세요.": "Check the email format.",

  "내용 입력": "Enter content",
};

// 기능 : 정규식 capture 값을 noUncheckedIndexedAccess 환경에서 안전하게 읽습니다.
function getLegacyMatchValue(match: RegExpMatchArray, index: number) {
  return match[index] ?? "";
}

// 기능 : 조사와 숫자 조합으로 만들어지는 레거시 문구를 영어로 보조 변환합니다.
const LEGACY_PATTERNS: readonly LegacyTextPattern[] = [
  {
    pattern: /^(\d+)건$/,
    translate: (match) => getLegacyMatchValue(match, 1),
  },
  {
    pattern: /^(\d+)개$/,
    translate: (match) => getLegacyMatchValue(match, 1),
  },
  {
    pattern: /^(\d+)명$/,
    translate: (match) => getLegacyMatchValue(match, 1),
  },
  {
    pattern: /^(\d+)일 지남$/,
    translate: (match) => `${getLegacyMatchValue(match, 1)}d overdue`,
  },
  {
    pattern: /^(\d+)일 남음$/,
    translate: (match) => `${getLegacyMatchValue(match, 1)}d left`,
  },
  {
    pattern: /^작성 (.+)$/,
    translate: (match) => `Created ${getLegacyMatchValue(match, 1)}`,
  },
  {
    pattern: /^등록 (.+)$/,
    translate: (match) => `Created ${getLegacyMatchValue(match, 1)}`,
  },
  {
    pattern: /^마감 (.+)$/,
    translate: (match) => `Close ${getLegacyMatchValue(match, 1)}`,
  },
  {
    pattern: /^외 (\d+)개$/,
    translate: (match) => `+${getLegacyMatchValue(match, 1)} more`,
  },
  {
    pattern: /^(.+) 선택 지우기$/,
    translate: (match, locale) => {
      const label = getLegacyMatchValue(match, 1);

      return `Clear ${translateLegacyAppStaticText(label, locale)}`;
    },
  },
  {
    pattern: /^(.+) 선택$/,
    translate: (match, locale) =>
      `Select ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^(.+) 검색$/,
    translate: (match, locale) =>
      `Search ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^(.+) 검색 실행$/,
    translate: (match, locale) =>
      `Search ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^(.+) 초기화$/,
    translate: (match, locale) =>
      `Reset ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^새 (.+) 추가$/,
    translate: (match, locale) =>
      `Add ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^(.+) 추가$/,
    translate: (match, locale) =>
      `Add ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^(.+)[을를] 입력해 주세요\.?$/,
    translate: (match, locale) =>
      `Enter ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}.`,
  },
  {
    pattern: /^(.+)[을를] 선택해 주세요\.?$/,
    translate: (match, locale) =>
      `Select ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}.`,
  },
  {
    pattern: /^조건을 바꾸면 (.+)[을를] 찾을 수 있어요\.?$/,
    translate: (match, locale) =>
      `Change filters to find ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}.`,
  },
  {
    pattern: /^(.+)[을를] 추가하면 여기에서 볼 수 있어요\.?$/,
    translate: (match, locale) =>
      `Add ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)} to see it here.`,
  },
  {
    pattern: /^(.+)[을를] 연결하면 여기에서 볼 수 있어요\.?$/,
    translate: (match, locale) =>
      `Link ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)} to see it here.`,
  },
  {
    pattern: /^(.+)[을를] 삭제할까요\?$/,
    translate: (match, locale) =>
      `Delete ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}?`,
  },
  {
    pattern: /^(.+) 목록으로 이동$/,
    translate: (match, locale) =>
      `Back to ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)}`,
  },
  {
    pattern: /^(.+) 페이지 옵션$/,
    translate: (match, locale) =>
      `${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)} Page Options`,
  },
  {
    pattern: /^(.+) 생성 패널 접기$/,
    translate: (match, locale) =>
      `Collapse ${translateLegacyAppStaticText(getLegacyMatchValue(match, 1), locale)} Panel`,
  },
];

// 기능 : 공백을 정규화해서 DOM text node와 attribute 번역 비교를 안정화합니다.
function normalizeLegacyText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

// 기능 : 한국어 앱 정적 문구를 locale에 맞게 변환합니다.
export function translateLegacyAppStaticText(value: string, locale: AppLocale) {
  const normalized = normalizeLegacyText(value);

  if (locale !== "en" || normalized.length === 0) {
    return value;
  }

  const exact = LEGACY_KO_TO_EN[normalized];

  if (exact) {
    return exact;
  }

  for (const { pattern, translate } of LEGACY_PATTERNS) {
    const match = normalized.match(pattern);

    if (match) {
      return translate(match, locale);
    }
  }

  return value;
}

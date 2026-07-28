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
  "휴지통으로 이동": "Move to Trash",
  "전체 생성 페이지로 열기": "Open Full Page",
  "알림 닫기": "Close Notification",
  "완료 처리": "Mark Complete",
  "완료 취소": "Mark Incomplete",

  회사: "Company",
  회사명: "Company Name",
  담당자: "Contact",
  담당자명: "Contact Name",
  연락처: "Contact",
  제품: "Product",
  제품명: "Product Name",
  딜: "Deal",
  일정: "Schedule",
  회의록: "Meeting Note",
  알림: "Notification",
  "명함 스캔": "Business Cards",
  휴지통: "Trash",
  설정: "Settings",
  "데이터 업로드": "Data Upload",
  가져오기: "Import",
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
  부서: "Department",
  직급: "Job Grade",
  지역: "Region",
  분야: "Field",
  주소: "Address",
  장소: "Location",
  가격: "Price",
  금액: "Amount",
  단계: "Stage",
  카테고리: "Category",
  "제품 카테고리": "Product Category",
  "제품 상태": "Product Status",
  "딜 금액": "Deal Amount",
  "딜 단계": "Deal Stage",
  "예상 마감일": "Expected Close Date",
  "다음 행동": "Next Action",
  "연결 딜": "Linked Deals",
  "연결된 딜": "Linked Deals",
  "연결 회사": "Linked Companies",
  "연결 담당자": "Linked Contacts",
  "연결 제품": "Linked Products",
  "연결": "Connect",
  "연결됨": "Connected",
  "연결 안 됨": "Not Connected",
  "연결 해제": "Disconnect",
  재연결: "Reconnect",
  "재연결 필요": "Reconnect Required",
  "비밀 메모": "Private Memo",
  "사적인 비밀 메모": "Private Memo",
  "비공식 메모": "Private Memo",
  "일반 메모": "General Memo",
  "업무용 메모": "Work Memo",
  "메모": "Memo",
  "메모 로그": "Memo Log",
  "활동 로그": "Activity Log",
  "딜 로그": "Deal Log",
  "담당자 로그": "Contact Log",
  "제품 로그": "Product Log",
  "일반": "General",
  "제목 없음": "Untitled",
  "미팅 일시": "Meeting Time",
  "미팅 링크": "Meeting Link",
  "후속 연락": "Follow-up",
  "연락처 후속 연락 이력": "Contact Follow-up History",
  "딜 후속 연락 이력": "Deal Follow-up History",

  "데이터가 존재하지 않아요": "No data.",
  "조건을 바꾸면 데이터를 찾을 수 있어요": "Change filters to find data.",
  "조건을 바꾸면 회사를 찾을 수 있어요.": "Change filters to find companies.",
  "조건을 바꾸면 담당자를 찾을 수 있어요.": "Change filters to find contacts.",
  "조건을 바꾸면 제품을 찾을 수 있어요.": "Change filters to find products.",
  "조건을 바꾸면 딜을 찾을 수 있어요.": "Change filters to find deals.",
  "조건을 바꾸면 회의록을 찾을 수 있어요": "Change filters to find meeting notes.",
  "조건을 바꾸면 상태를 찾을 수 있어요.": "Change filters to find statuses.",
  "조건을 바꾸면 카테고리를 찾을 수 있어요.": "Change filters to find categories.",
  "조건을 바꾸면 지역을 찾을 수 있어요.": "Change filters to find regions.",
  "조건을 바꾸면 분야를 찾을 수 있어요.": "Change filters to find fields.",
  "조건을 바꾸면 부서를 찾을 수 있어요.": "Change filters to find departments.",
  "조건을 바꾸면 직급을 찾을 수 있어요.": "Change filters to find job grades.",
  "항목을 추가하면 여기에서 볼 수 있어요.": "Add items to see them here.",
  "딜을 연결하면 여기에서 볼 수 있어요.": "Link deals to see them here.",
  "제품을 연결하면 여기에서 볼 수 있어요.": "Link products to see them here.",
  "회사를 연결하면 여기에서 볼 수 있어요.": "Link companies to see them here.",
  "메모 로그를 추가하면 여기에서 볼 수 있어요.": "Add memo logs to see them here.",
  "활동 로그를 추가하면 여기에서 볼 수 있어요.": "Add activity logs to see them here.",
  "비밀 메모를 추가하면 여기에서 볼 수 있어요.": "Add private memos to see them here.",
  "제품 로그를 추가하면 여기에서 볼 수 있어요.": "Add product logs to see them here.",
  "사적인 나만의 아이디어와 생각들을 바로바로 기록해요.":
    "Capture private ideas and thoughts here.",

  "데이터를 삭제할까요?": "Delete this data?",
  "삭제했어요.": "Deleted.",
  "7일 안에는 휴지통에서 복구할 수 있어요.":
    "You can restore it from Trash within 7 days.",
  "회의록을 삭제할까요?": "Delete this meeting note?",
  "회의록을 삭제했어요.": "Meeting note deleted.",
  "회의록을 수정했어요.": "Meeting note saved.",
  "회사 정보를 저장했어요.": "Company saved.",
  "담당자 정보를 저장했어요.": "Contact saved.",
  "제품 정보를 저장했어요.": "Product saved.",
  "딜 정보를 저장했어요.": "Deal saved.",
  "비밀 메모를 추가했어요.": "Private memo added.",
  "비밀 메모를 수정했어요.": "Private memo saved.",
  "사적인 비밀 메모를 추가했어요.": "Private memo added.",
  "사적인 비밀 메모를 수정했어요.": "Private memo saved.",
  "업무용 메모를 추가했어요.": "Work memo added.",
  "업무용 메모를 수정했어요.": "Work memo saved.",
  "담당자 로그를 추가했어요.": "Contact log added.",
  "담당자 로그를 수정했어요.": "Contact log saved.",
  "제품 로그를 추가했어요.": "Product log added.",
  "제품 로그를 수정했어요.": "Product log saved.",
  "가져오기를 취소할까요?": "Cancel this import?",
  "가져오기를 취소했어요.": "Import canceled.",
  "가져오기가 완료됐어요.": "Import complete.",
  "가져오기를 불러오지 못했어요.": "Could not load import.",
  "가져오기를 찾지 못했어요. 새 파일로 다시 시작해 주세요.":
    "Could not find the import. Start again with a new file.",
  "일정을 삭제할까요?": "Delete this schedule?",
  "이메일 연결을 해제할까요?": "Disconnect email?",

  "저장 완료": "Saved",
  "확인 필요": "Needs Review",
  "오류 확인 필요": "Needs Error Review",
  "컬럼 매칭": "Column Mapping",
  "컬럼 매칭 필요": "Mapping Required",
  "가져오기 완료": "Import Complete",
  "가져오기 흐름": "Import Flow",
  "새 파일로 시작하기": "Start New File",
  "취소하기": "Cancel",
  "취소됨": "Canceled",
  만료됨: "Expired",
  제외: "Exclude",
  포함: "Include",
  민감정보: "Sensitive Data",
  "캘린더 선택": "Select Calendar",
  종일: "All Day",
  "주간 보고서": "Weekly Report",
  "Google Calendar가 연결됐어요.": "Google Calendar connected.",
  "Google Calendar 동기화 중이에요. 곧 반영할게요.":
    "Google Calendar is syncing. Changes will appear shortly.",
  "Google Calendar 연결 권한이 거절됐어요.":
    "Google Calendar permission was denied.",
  "Google Calendar와 연결하지 못했어요. 다시 시도해 주세요.":
    "Could not connect Google Calendar. Try again.",
  "가져올 캘린더를 선택해 주세요.": "Choose a calendar to import.",
  "가져온 Google 일정을 계속 표시합니다.":
    "Keep showing imported Google events.",
  "가져온 Google 일정을 기본 일정 화면에서 숨깁니다.":
    "Hide imported Google events from the main schedule.",
  "가져온 Google 일정을 휴지통으로 이동합니다.":
    "Move imported Google events to Trash.",

  "이름을 입력해 주세요.": "Enter a name.",
  "회사명을 입력해 주세요.": "Enter a company name.",
  "제품명을 입력해 주세요.": "Enter a product name.",
  "상세 내용을 입력해 주세요.": "Enter details.",
  "다음 행동을 입력해 주세요.": "Enter the next action.",
  "회사를 선택해 주세요.": "Select a company.",
  "직급을 선택해 주세요.": "Select a job grade.",
  "지역을 선택해 주세요.": "Select a region.",
  "상태를 선택해 주세요.": "Select a status.",
  "제품을 1개 이상 선택해 주세요.": "Select at least one product.",
  "회사를 1개 이상 선택해 주세요.": "Select at least one company.",
  "이메일 형식을 확인해 주세요.": "Check the email format.",
  "가격은 0 이상의 정수로 입력해 주세요.":
    "Enter the price as an integer of 0 or more.",
  "10MB 이하 파일만 올릴 수 있어요.": "Upload files up to 10 MB.",
  "10MB 이하 이미지만 올릴 수 있어요.": "Upload images up to 10 MB.",
  "10MB 이하 파일을 사용할 수 있어요.": "Use files up to 10 MB.",
  "010으로 시작하는 11자리 번호를 입력해 주세요.":
    "Enter an 11-digit number starting with 010.",
  "+821012345678 형식으로 입력해 주세요.":
    "Enter it in +821012345678 format.",

  "제품 로그 제목": "Product Log Title",
  "담당자 로그 제목": "Contact Log Title",
  "업무용 메모 제목": "Work Memo Title",
  "메모 제목": "Memo Title",
  "내용 입력": "Enter content",
  "비밀 메모 입력": "Enter private memo",
  "사적인 비밀 메모 입력": "Enter private memo",
  "제품 로그 추가": "Add Product Log",
  "제품 로그 수정": "Edit Product Log",
  "담당자 로그 추가": "Add Contact Log",
  "담당자 로그 수정": "Edit Contact Log",
  "업무용 메모 추가": "Add Work Memo",
  "업무용 메모 수정": "Edit Work Memo",
  "비밀 메모 추가": "Add Private Memo",
  "비밀 메모 수정": "Edit Private Memo",
  "사적인 비밀 메모 추가": "Add Private Memo",
  "사적인 비밀 메모 수정": "Edit Private Memo",
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

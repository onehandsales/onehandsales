/* eslint-disable no-console */
const { createCipheriv, createHash, randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  BusinessCardResolution,
  BusinessCardScanStatus,
  ImportTemplateType,
  MeetingNoteSourceType,
  OAuthProvider,
  PrismaClient,
  UserRole,
  UserStatus,
} = require("@prisma/client");

loadEnv(path.join(__dirname, "..", ".env"));

const prisma = new PrismaClient();

const USER_ID = "00000000-0000-4000-8000-000000000001";
const ADMIN_ID = "00000000-0000-4000-8000-000000000002";
const USER_DEVICE_ID = "00000000-0000-4000-8000-000000000011";
const ADMIN_DEVICE_ID = "00000000-0000-4000-8000-000000000021";

const dealStatuses = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const companySeeds = [
  ["한빛테크", "제조/스마트팩토리", "서울 강남", "반도체 장비 생산 라인의 영업 현황과 유지보수 계약을 통합 관리하려는 계정입니다."],
  ["누리커머스", "유통/커머스", "서울 송파", "입점 브랜드별 딜, 담당자, 캠페인 일정을 함께 추적해야 하는 고객입니다."],
  ["오름바이오", "바이오/헬스케어", "경기 성남", "병원 네트워크와 임상 협력 프로젝트가 많은 성장 계정입니다."],
  ["라온모빌리티", "모빌리티", "경기 수원", "법인 차량과 충전 인프라 패키지를 검토 중인 대형 고객입니다."],
  ["세움건설", "건설/부동산", "서울 마포", "현장별 장비 도입과 하자 대응 프로세스 개선 니즈가 있습니다."],
  ["다온클라우드", "IT/SaaS", "서울 구로", "파트너 영업과 엔터프라이즈 고객 대응 기록을 분리해 보고 싶어 합니다."],
  ["리버핀테크", "금융", "서울 여의도", "보안 검토와 계약 리스크 체크가 길게 이어지는 금융 계정입니다."],
  ["해솔교육", "공공/교육", "대전 유성", "캠퍼스별 상담 이력과 도입 의사결정권자를 연결해 관리합니다."],
  ["브릿지미디어", "미디어/콘텐츠", "서울 상암", "광고주 제안과 콘텐츠 제작 일정을 딜 중심으로 묶어 봅니다."],
  ["파인푸드", "식품/F&B", "부산 해운대", "프랜차이즈 지점 확장과 물류 계약이 함께 움직이는 계정입니다."],
  ["코어에너지", "에너지", "울산 남구", "설비 교체, 안전 점검, 장기 유지보수 계약을 병행합니다."],
  ["모아로지스", "물류", "인천 연수", "창고 자동화와 라스트마일 운영 리포트를 검토합니다."],
  ["비전메디컬", "바이오/헬스케어", "서울 종로", "의료기기 구매와 임상 세미나 일정을 함께 관리합니다."],
  ["플랜비리테일", "유통/커머스", "경기 고양", "오프라인 매장별 프로모션과 본사 승인 절차가 중요합니다."],
  ["아이든소프트", "IT/SaaS", "서울 판교", "SaaS 구독 확장과 기술 PoC가 동시에 진행됩니다."],
  ["청명소재", "제조/소재", "충북 청주", "소재 공급 계약과 품질 이슈 follow-up이 잦습니다."],
  ["그린하우스랩", "농식품/애그테크", "전북 전주", "스마트팜 구축과 지자체 협력 프로젝트를 검토합니다."],
  ["에이치큐파트너스", "컨설팅", "서울 중구", "고객사별 제안 산출물과 파트너 담당자를 촘촘히 관리합니다."],
  ["블루핀보험", "금융", "서울 강서", "대리점 영업망과 상품 교육 일정을 연동하고 싶어 합니다."],
  ["아크디자인", "디자인/브랜딩", "서울 성수", "브랜드 리뉴얼 프로젝트와 제작 일정이 딜별로 분리됩니다."],
  ["케이씨공공서비스", "공공/교육", "세종", "공공 입찰, 제안서, 현장 설명회 일정이 많은 계정입니다."],
  ["스텔라호텔", "여행/숙박", "제주 제주시", "지점별 B2B 행사 유치와 장기 계약을 동시에 추진합니다."],
  ["온유케어", "헬스케어/복지", "광주 북구", "복지시설 네트워크와 정기 납품 계약을 관리합니다."],
  ["메타팩토리", "제조/스마트팩토리", "경남 창원", "공장 자동화 PoC와 본계약 전환 가능성이 높은 계정입니다."],
];

const departments = ["영업기획팀", "구매팀", "전략사업팀", "디지털전환팀", "운영관리팀", "재무관리팀"];
const grades = ["매니저", "책임", "팀장", "이사", "본부장"];
const contactNames = [
  "김도윤", "박서연", "이민준", "최하린", "정유진", "강지훈", "윤서아", "장현우",
  "한지민", "오세준", "신다은", "류태오", "문채원", "백승현", "임나영", "고준서",
  "노유라", "서지호", "차예린", "권도현", "송하늘", "배지안", "홍민재", "유가은",
  "조윤호", "전소민", "남태현", "심아린", "허준영", "황서윤", "민재원", "주다현",
  "길성민", "방예지", "석지후", "엄채린", "변도겸", "여서진", "추가람", "표민성",
  "마유빈", "도시윤", "나현서", "피준호", "라서율", "곽지완", "설다인", "하준혁",
  "공채아", "기서준", "단유나", "봉시우", "안세아", "원지율", "진도하", "천수빈",
  "탁현준", "편아영", "감도윤", "견서현", "명지오", "소유림", "위태준", "재하린",
  "제민규", "창서우", "태아린", "하도현", "현유주", "가민준", "나서영", "다지환",
];

const productSeeds = [
  ["세일즈 파이프라인 Enterprise", 3200000, "CRM", "판매중"],
  ["AI 회의록 요약", 1250000, "AI 자동화", "판매중"],
  ["명함 OCR 자동입력", 850000, "업무 자동화", "프로모션"],
  ["모바일 영업 앱 패키지", 1480000, "모바일", "판매중"],
  ["임원 보고 대시보드", 2400000, "리포팅", "판매중"],
  ["보안 감사 옵션", 1900000, "보안/관리", "엔터프라이즈"],
  ["ERP 연동 커넥터", 3600000, "데이터 연동", "엔터프라이즈"],
  ["고객사 통합 검색", 980000, "검색", "판매중"],
  ["영업 교육 온보딩", 1100000, "교육", "판매중"],
  ["계약 리스크 체크리스트", 1350000, "보안/관리", "상담중"],
  ["주간 리마인더 자동화", 760000, "업무 자동화", "프로모션"],
  ["파트너 제휴 패키지", 2800000, "협업", "상담중"],
  ["현장 방문 리포트", 690000, "리포팅", "판매중"],
  ["견적 승인 워크플로", 1580000, "업무 자동화", "판매중"],
  ["고객 등급 분석", 1750000, "분석", "상담중"],
  ["대량 데이터 불러오기", 920000, "데이터 연동", "판매중"],
  ["세일즈 코칭 리포트", 1320000, "교육", "프로모션"],
  ["프리미엄 SLA", 4200000, "운영지원", "엔터프라이즈"],
];

const dealTemplates = [
  {
    suffix: "신규 도입 제안",
    action: "현업 부서별 필수 입력 항목과 승인 흐름 확인",
    memo: "초기 니즈는 명확하며 예산 승인 전에 보안 검토 자료가 필요합니다.",
    cost: 11800000,
  },
  {
    suffix: "운영 자동화 PoC",
    action: "PoC 범위와 성공 기준을 문서로 정리해 전달",
    memo: "반복 보고와 일정 follow-up을 줄이는 데 관심이 큽니다.",
    cost: 7200000,
  },
  {
    suffix: "확장 계약 협의",
    action: "기존 사용 부서의 정량 효과와 추가 라이선스 수량 확인",
    memo: "기존 도입 부서 만족도가 높아 인접 조직 확장이 가능합니다.",
    cost: 16400000,
  },
];

const accountMeetingTopics = [
  "생산라인 PoC 범위 확정 미팅",
  "하반기 입점 브랜드 CRM 연동 협의",
  "병원 네트워크 세미나 후속 미팅",
  "법인 차량 패키지 도입 검토",
  "현장 장비 리포트 자동화 협의",
  "파트너 영업 운영 기준 정리",
  "보안 심사 자료 사전 검토",
  "캠퍼스 상담 데이터 이관 미팅",
  "광고주 제안 현황 공유",
  "가맹점 물류 계약 조건 협의",
  "안전 점검 장기계약 리뷰",
  "창고 자동화 견적 조정 미팅",
  "의료기기 구매위원회 준비 미팅",
  "매장 프로모션 성과 리포트 협의",
  "SaaS 구독 확장 기술 검토",
  "품질 이슈 대응 프로세스 미팅",
  "스마트팜 구축 일정 조율",
  "컨설팅 고객사 제안서 리뷰",
  "대리점 교육 운영 회의",
  "브랜드 리뉴얼 프로젝트 킥오프",
  "공공 입찰 제안 범위 협의",
  "호텔 B2B 행사 유치 전략 미팅",
  "복지시설 정기 납품 협의",
  "공장 자동화 본계약 전환 미팅",
];

const accountScheduleTopics = [
  "PoC 착수 전 현업 인터뷰",
  "견적 승인 전 의사결정자 브리핑",
  "보안 체크리스트 검토",
  "제품 데모 리허설",
  "계약 조건 최종 조율",
  "도입 일정 운영팀 공유",
  "ROI 산출 기준 워크숍",
  "파트너 제휴 범위 협의",
  "파일럿 결과 회고",
  "하반기 확장 예산 리뷰",
  "레퍼런스 사례 공유",
  "데이터 이관 범위 확정",
];

const pipelineReviewSeeds = [
  {
    title: "스마트팩토리 PoC 지연 리스크 점검",
    location: "한빛테크 본사 프로젝트룸",
    memo: "설비 연동 일정, 현장 보안 승인, PoC 성공 기준을 같은 표로 맞춥니다.",
  },
  {
    title: "커머스 대형 계정 견적 승인 회의",
    location: "누리커머스 파트너 라운지",
    memo: "입점 브랜드별 견적 범위와 캠페인 운영 담당자를 연결해 확인합니다.",
  },
  {
    title: "바이오 헬스케어 세미나 후속 딜 리뷰",
    location: "오름바이오 판교 회의실",
    memo: "병원 네트워크 담당자 반응과 의료기기 구매위원회 일정 리스크를 점검합니다.",
  },
  {
    title: "금융 보안 심사 대응 현황 회의",
    location: "리버핀테크 여의도 오피스",
    memo: "감사 로그, 데이터 보관 정책, 접근권한 자료 제출 일정을 정리합니다.",
  },
  {
    title: "공공 입찰 제안서 마감 전 점검",
    location: "세종 공공서비스 컨퍼런스룸",
    memo: "제안 범위, 가격 산출 근거, 현장 설명회 질의 답변을 확인합니다.",
  },
  {
    title: "물류 자동화 본계약 전환 회의",
    location: "모아로지스 송도 물류센터",
    memo: "창고 자동화 PoC 결과와 라스트마일 운영 리포트 확장 범위를 검토합니다.",
  },
  {
    title: "호텔 B2B 행사 유치 파이프라인 리뷰",
    location: "스텔라호텔 제주 세일즈룸",
    memo: "장기 행사 계약 가능성과 지점별 담당자 follow-up을 묶어 봅니다.",
  },
  {
    title: "제조 소재 공급계약 품질 이슈 회의",
    location: "청명소재 청주 공장 회의실",
    memo: "품질 이슈 대응 일정과 공급계약 갱신 조건을 함께 점검합니다.",
  },
];

const strategicMeetingSeeds = [
  {
    title: "제조 계정 PoC 전환 전략 회의",
    details:
      "한빛테크와 메타팩토리의 설비 연동 조건을 비교했습니다. 두 계정 모두 현장 보안 승인이 병목이라, 데모 환경과 운영 데이터 범위를 분리해 제안하기로 했습니다.",
    nextPlan: "보안 승인 전에도 진행 가능한 샘플 데이터 기반 데모 시나리오를 준비합니다.",
    requiredAction: "한빛테크 설비 담당자와 메타팩토리 운영팀에게 PoC 체크리스트를 각각 전달합니다.",
  },
  {
    title: "커머스 계정 캠페인 CRM 연동 전략 회의",
    details:
      "누리커머스와 플랜비리테일의 프로모션 운영 흐름을 비교했습니다. 본사 승인 절차와 매장별 캠페인 리포트가 공통 요구라, 데이터 불러오기와 대시보드 묶음 제안이 적합합니다.",
    nextPlan: "입점 브랜드별 샘플 리포트와 매장별 승인 흐름 화면을 묶어 데모합니다.",
    requiredAction: "두 계정의 실제 캠페인 필드명을 받아 import 템플릿 샘플에 반영합니다.",
  },
  {
    title: "금융 계정 보안 패키지 제안 회의",
    details:
      "리버핀테크와 블루핀보험은 모두 보안 심사 자료가 딜 진행 속도를 좌우합니다. 감사 로그와 계약 리스크 체크리스트를 기본 제안에 포함하는 방향으로 정리했습니다.",
    nextPlan: "보안/관리 제품군 가격표와 내부 통제 예시 문서를 업데이트합니다.",
    requiredAction: "각 계정 보안 담당자에게 데이터 보관 정책 FAQ를 보냅니다.",
  },
  {
    title: "공공 교육 계정 입찰 대응 회의",
    details:
      "해솔교육과 케이씨공공서비스의 입찰 일정이 겹쳐 제안서 산출물 재사용 범위를 검토했습니다. 현장 설명회 질문은 일정과 회의록에 바로 연결해 관리하기로 했습니다.",
    nextPlan: "공공 제안서 공통 목차와 필수 증빙 자료 목록을 정리합니다.",
    requiredAction: "입찰 마감일 기준으로 회의록 후속 조치 알림을 세팅합니다.",
  },
  {
    title: "헬스케어 계정 구매위원회 준비 회의",
    details:
      "오름바이오와 비전메디컬은 실무 검토 후 구매위원회 자료가 필요합니다. 임상 협력 사례와 의료기기 도입 효과를 제품별로 나눠 제안하기로 했습니다.",
    nextPlan: "의료기기 구매위원회용 5장 요약 자료를 작성합니다.",
    requiredAction: "담당자별 관심 제품과 예상 질문을 담당자 메모에 업데이트합니다.",
  },
  {
    title: "물류 자동화 계정 ROI 산정 회의",
    details:
      "모아로지스와 파인푸드의 물류 운영 지표를 비교했습니다. 창고 자동화와 가맹점 납품 일정이 연결되어 있어 일정-딜 연결 데이터를 보여주는 데모가 효과적입니다.",
    nextPlan: "배송 리드타임 개선 가정과 운영 비용 절감 시나리오를 계산합니다.",
    requiredAction: "두 계정에서 최근 3개월 물류 KPI 샘플을 요청합니다.",
  },
  {
    title: "브랜드 리뉴얼 프로젝트 영업 회의",
    details:
      "아크디자인과 브릿지미디어는 제작 일정과 광고주 제안이 함께 움직입니다. 회의록에서 제작 산출물, 광고주 요구, 후속 액션을 같은 딜에 연결하는 방식으로 제안합니다.",
    nextPlan: "콘텐츠 제작 일정 샘플과 광고주 제안 히스토리 화면을 준비합니다.",
    requiredAction: "브랜드 리뉴얼 프로젝트의 주요 이해관계자를 담당자 목록에 보강합니다.",
  },
  {
    title: "호텔 행사 유치 장기계약 전략 회의",
    details:
      "스텔라호텔의 B2B 행사 유치 딜은 시즌별 수요가 달라 장기계약 옵션을 별도로 설명해야 합니다. 일정과 계약 예상 종료일을 함께 보여주는 흐름이 필요합니다.",
    nextPlan: "행사 성수기별 견적 범위와 우선순위 계정을 정리합니다.",
    requiredAction: "제주 지점 담당자와 서울 본사 승인 라인을 분리해 기록합니다.",
  },
  {
    title: "에너지 설비 유지보수 계약 회의",
    details:
      "코어에너지의 설비 교체 딜은 안전 점검과 유지보수 계약이 붙어 있습니다. 제품 패키지를 단일 견적이 아니라 도입 단계별로 쪼개 제시하기로 했습니다.",
    nextPlan: "유지보수 SLA와 안전 점검 리포트 샘플을 하나의 제안서로 묶습니다.",
    requiredAction: "설비 담당자에게 다음 정기점검 일정을 확인합니다.",
  },
  {
    title: "컨설팅 파트너 계정 공동제안 회의",
    details:
      "에이치큐파트너스는 고객사별 산출물과 파트너 담당자가 많아 딜-담당자 연결이 핵심입니다. 파트너 제휴 패키지와 회의록 요약 기능을 함께 제안합니다.",
    nextPlan: "파트너 공동제안 프로세스 예시와 권한 분리 기준을 정리합니다.",
    requiredAction: "공동제안 대상 고객사 5곳의 담당자 목록을 받아 import합니다.",
  },
  {
    title: "SaaS 기술 PoC 확장 회의",
    details:
      "아이든소프트와 다온클라우드는 기술 PoC 이후 구독 확장 가능성이 큽니다. API 연동 범위와 사용자 교육 계획을 제품 묶음으로 제안하기로 했습니다.",
    nextPlan: "기술 PoC 완료 후 확장 견적을 두 단계로 나눠 제출합니다.",
    requiredAction: "개발 담당자와 운영 담당자의 의사결정 기준을 담당자 메모에 분리합니다.",
  },
  {
    title: "복지시설 정기 납품 계정 회의",
    details:
      "온유케어는 복지시설별 정기 납품 일정과 담당자 변경 이력이 중요합니다. 일정 반복 관리와 담당자 메모 기능을 중심으로 제안합니다.",
    nextPlan: "정기 납품 주기별 알림과 회의록 후속 조치 예시를 준비합니다.",
    requiredAction: "시설별 담당자와 납품 주기를 contact import 양식으로 정리합니다.",
  },
];

const pendingBusinessCardSeeds = [
  ["라온모빌리티 EV사업추진단", "문서윤", "010-7312-4401", "sy.moon@demo.onehandsales.local", "EV사업추진단", "책임"],
  ["세움건설 현장혁신TF", "배준호", "010-7318-4407", "jh.bae@demo.onehandsales.local", "현장혁신TF", "팀장"],
  ["다온클라우드 파트너세일즈팀", "권하린", "010-7324-4413", "hr.kwon@demo.onehandsales.local", "파트너세일즈팀", "매니저"],
  ["리버핀테크 정보보호실", "임태경", "010-7330-4419", "tk.lim@demo.onehandsales.local", "정보보호실", "이사"],
  ["해솔교육 디지털캠퍼스팀", "오지안", "010-7336-4425", "jian.oh@demo.onehandsales.local", "디지털캠퍼스팀", "책임"],
  ["브릿지미디어 브랜드솔루션팀", "정다온", "010-7342-4431", "daon.jeong@demo.onehandsales.local", "브랜드솔루션팀", "팀장"],
  ["코어에너지 안전운영팀", "서민재", "010-7348-4437", "mj.seo@demo.onehandsales.local", "안전운영팀", "본부장"],
  ["모아로지스 물류자동화팀", "한유림", "010-7354-4443", "yr.han@demo.onehandsales.local", "물류자동화팀", "책임"],
];

const importFileNames = {
  COMPANY: ["상반기_전략계정_회사목록.xlsx", "전시회_상담기업_정리.xlsx", "파트너_추천계정_리스트.xlsx"],
  CONTACT: ["스마트팩토리_담당자_명함정리.xlsx", "금융보안_검토담당자.xlsx", "공공입찰_참석자명단.xlsx"],
  PRODUCT: ["Q3_제안제품_가격표.xlsx", "보안패키지_옵션목록.xlsx", "자동화제품_프로모션목록.xlsx"],
  DEAL: ["7월_핵심딜_파이프라인.xlsx", "PoC_전환대상_딜목록.xlsx", "하반기_확장계약_후보.xlsx"],
};

const importTemplates = [
  {
    type: ImportTemplateType.COMPANY,
    version: "demo-2026-06-30",
    name: "회사 불러오기 데모 양식.xlsx",
    columns: [
      column("companyName", "회사명", true, "text"),
      column("companyFieldName", "회사 분야", true, "text"),
      column("companyRegionName", "회사 지역", true, "text"),
    ],
    samples: [
      { companyName: "한빛테크", companyFieldName: "제조/스마트팩토리", companyRegionName: "서울 강남" },
      { companyName: "누리커머스", companyFieldName: "유통/커머스", companyRegionName: "서울 송파" },
    ],
  },
  {
    type: ImportTemplateType.CONTACT,
    version: "demo-2026-06-30",
    name: "담당자 불러오기 데모 양식.xlsx",
    columns: [
      column("companyName", "회사명", true, "text"),
      column("contactName", "담당자명", true, "text"),
      column("contactEmail", "담당자 이메일", true, "email"),
      column("contactPhone", "담당자 휴대폰", true, "phone"),
      column("contactDepartmentName", "담당자 부서", true, "text"),
      column("contactJobGradeName", "담당자 직급", true, "text"),
    ],
    samples: [
      {
        companyName: "한빛테크",
        contactName: "김도윤",
        contactEmail: "sample1@demo.onehandsales.local",
        contactPhone: "010-4100-6100",
        contactDepartmentName: "영업기획팀",
        contactJobGradeName: "팀장",
      },
    ],
  },
  {
    type: ImportTemplateType.PRODUCT,
    version: "demo-2026-06-30",
    name: "제품 불러오기 데모 양식.xlsx",
    columns: [
      column("productName", "제품명", true, "text"),
      column("productPrice", "제품 가격", true, "number"),
      column("productCategoryName", "제품 카테고리", true, "text"),
      column("productStatusName", "제품 상태", true, "text"),
    ],
    samples: [
      {
        productName: "세일즈 파이프라인 Enterprise",
        productPrice: 3200000,
        productCategoryName: "CRM",
        productStatusName: "판매중",
      },
    ],
  },
  {
    type: ImportTemplateType.DEAL,
    version: "demo-2026-06-30",
    name: "딜 불러오기 데모 양식.xlsx",
    columns: [
      column("dealName", "딜명", true, "text"),
      column("dealCost", "딜 금액", true, "number"),
      column("dealStatus", "딜 단계", true, "text"),
      column("expectedEndDate", "예상 종료일", true, "text"),
      column("companyName", "회사명", true, "text"),
      column("contactName", "담당자명", true, "text"),
      column("productName", "제품명", true, "text"),
    ],
    samples: [
      {
        dealName: "한빛테크 신규 도입 제안",
        dealCost: 11800000,
        dealStatus: "PROPOSAL_QUOTE",
        expectedEndDate: "2026-07-31",
        companyName: "한빛테크",
        contactName: "김도윤",
        productName: "세일즈 파이프라인 Enterprise",
      },
    ],
  },
];

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      continue;
    }

    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] = value;
  }
}

function envValue(name) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function column(key, label, required, type) {
  return { key, label, required, type };
}

function dateOnly(daysFromBase) {
  const date = new Date(Date.UTC(2026, 5, 30));
  date.setUTCDate(date.getUTCDate() + daysFromBase);
  return date;
}

function kstDateTime(daysFromBase, hour, minute = 0) {
  const date = new Date(Date.UTC(2026, 5, 30));
  date.setUTCDate(date.getUTCDate() + daysFromBase);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hour - 9,
      minute,
      0,
      0
    )
  );
}

function mobile(index) {
  const middle = String(4100 + index * 7).padStart(4, "0");
  const last = String(6100 + index * 11).padStart(4, "0");
  return `010-${middle.slice(-4)}-${last.slice(-4)}`;
}

function email(companyIndex, contactIndex) {
  return `contact-${String(companyIndex + 1).padStart(2, "0")}-${contactIndex + 1}@demo.onehandsales.local`;
}

function pick(items, index) {
  return items[index % items.length];
}

function range(count) {
  return Array.from({ length: count }, (_, index) => index);
}

function encryptPrivateMemo(scope, plaintext) {
  const secret =
    envValue(`${scope}_PRIVATE_MEMO_ENCRYPTION_KEY`) ||
    envValue("ENCRYPTION_MASTER_KEY") ||
    "local-demo-private-memo-secret";
  const keyVersion =
    envValue(`${scope}_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION`) ||
    envValue("ENCRYPTION_KEY_VERSION") ||
    "v1";
  const iv = randomBytes(12);
  const key = createHash("sha256").update(secret).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    memoCiphertext: [
      "aes-256-gcm",
      iv.toString("base64url"),
      authTag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(":"),
    memoKeyVersion: keyVersion,
  };
}

async function seedAuth() {
  await prisma.user.upsert({
    where: { id: USER_ID },
    create: {
      id: USER_ID,
      email: "local.user@example.com",
      displayName: "로컬 세일즈 사용자",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      lastLoginAt: new Date(),
    },
    update: {
      email: "local.user@example.com",
      displayName: "로컬 세일즈 사용자",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      deletedAt: null,
      lastLoginAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    create: {
      id: ADMIN_ID,
      email: "local.admin@example.com",
      displayName: "로컬 관리자",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      lastLoginAt: new Date(),
    },
    update: {
      email: "local.admin@example.com",
      displayName: "로컬 관리자",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      deletedAt: null,
      lastLoginAt: new Date(),
    },
  });

  await prisma.userOAuthAccount.deleteMany({
    where: { userId: { in: [USER_ID, ADMIN_ID] } },
  });
  await prisma.userOAuthAccount.createMany({
    data: [
      {
        userId: USER_ID,
        provider: OAuthProvider.GOOGLE,
        providerUserId: "local-google-user",
        providerEmail: "local.user@example.com",
      },
      {
        userId: USER_ID,
        provider: OAuthProvider.KAKAO,
        providerUserId: "local-kakao-user",
        providerEmail: "local.user@example.com",
      },
      {
        userId: ADMIN_ID,
        provider: OAuthProvider.GOOGLE,
        providerUserId: "local-google-admin",
        providerEmail: "local.admin@example.com",
      },
    ],
  });

  await upsertDeviceAndSessions({
    userId: USER_ID,
    deviceId: USER_DEVICE_ID,
    label: "Local user browser",
    sessions: [
      "00000000-0000-4000-8000-000000000101",
      "00000000-0000-4000-8000-000000000102",
    ],
  });
  await upsertDeviceAndSessions({
    userId: ADMIN_ID,
    deviceId: ADMIN_DEVICE_ID,
    label: "Local admin browser",
    sessions: ["00000000-0000-4000-8000-000000000201"],
  });
}

async function upsertDeviceAndSessions({ userId, deviceId, label, sessions }) {
  await prisma.authDevice.upsert({
    where: { id: deviceId },
    create: {
      id: deviceId,
      userId,
      deviceSlot: AuthDeviceSlot.PERSONAL_LAPTOP,
      deviceIdHash: `${userId}:local-device`,
      label,
      status: AuthDeviceStatus.ACTIVE,
      lastSeenAt: new Date(),
    },
    update: {
      label,
      status: AuthDeviceStatus.ACTIVE,
      revokedAt: null,
      replacedAt: null,
      lastSeenAt: new Date(),
    },
  });

  for (const sessionId of sessions) {
    await prisma.authSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId,
        authDeviceId: deviceId,
        status: AuthSessionStatus.ACTIVE,
        refreshTokenHash: `${sessionId}:local-refresh`,
        expiresAt: new Date("2099-12-31T00:00:00.000Z"),
        lastUsedAt: new Date(),
      },
      update: {
        userId,
        authDeviceId: deviceId,
        status: AuthSessionStatus.ACTIVE,
        revokedAt: null,
        expiresAt: new Date("2099-12-31T00:00:00.000Z"),
        lastUsedAt: new Date(),
      },
    });
  }
}

async function clearDemoData(userId) {
  const importLogs = await prisma.importUserLog.findMany({
    where: { userId },
    select: { id: true },
  });
  const importLogIds = importLogs.map((log) => log.id);

  if (importLogIds.length > 0) {
    await prisma.importUserLogRow.deleteMany({
      where: { importUserLogId: { in: importLogIds } },
    });
  }

  await prisma.importUserLog.deleteMany({ where: { userId } });
  await prisma.businessCardScanLog.deleteMany({ where: { userId } });
  await prisma.meetingNoteDeal.deleteMany({ where: { userId } });
  await prisma.meetingNoteProduct.deleteMany({ where: { userId } });
  await prisma.meetingNoteContact.deleteMany({ where: { userId } });
  await prisma.meetingNoteCompany.deleteMany({ where: { userId } });
  await prisma.meetingNote.deleteMany({ where: { userId } });
  await prisma.scheduleDeal.deleteMany({ where: { userId } });
  await prisma.schedule.deleteMany({ where: { userId } });
  await prisma.dealProduct.deleteMany({ where: { userId } });
  await prisma.dealContact.deleteMany({ where: { userId } });
  await prisma.dealCompany.deleteMany({ where: { userId } });
  await prisma.dealFollowingActionLog.deleteMany({ where: { userId } });
  await prisma.dealMemoLog.deleteMany({ where: { userId } });
  await prisma.deal.deleteMany({ where: { userId } });
  await prisma.productUserPrivateMemoLog.deleteMany({ where: { userId } });
  await prisma.productMemoLog.deleteMany({ where: { userId } });
  await prisma.product.deleteMany({ where: { userId } });
  await prisma.productCategory.deleteMany({ where: { userId } });
  await prisma.productStatus.deleteMany({ where: { userId } });
  await prisma.contactUserPrivateMemoLog.deleteMany({ where: { userId } });
  await prisma.contactMemoLog.deleteMany({ where: { userId } });
  await prisma.contact.deleteMany({ where: { userId } });
  await prisma.contactDepartment.deleteMany({ where: { userId } });
  await prisma.contactJobGrade.deleteMany({ where: { userId } });
  await prisma.companyUserPrivateMemoLog.deleteMany({ where: { userId } });
  await prisma.companyMemoLog.deleteMany({ where: { userId } });
  await prisma.company.deleteMany({ where: { userId } });
  await prisma.companyField.deleteMany({ where: { userId } });
  await prisma.companyRegion.deleteMany({ where: { userId } });
}

async function seedImportTemplates() {
  await prisma.importTemplate.updateMany({ data: { isActive: false } });

  for (const template of importTemplates) {
    await prisma.importTemplate.upsert({
      where: {
        templateType_templateVersion: {
          templateType: template.type,
          templateVersion: template.version,
        },
      },
      create: {
        templateType: template.type,
        templateVersion: template.version,
        templateName: template.name,
        columnsJson: template.columns,
        sampleRowsJson: template.samples,
        isActive: true,
      },
      update: {
        templateName: template.name,
        columnsJson: template.columns,
        sampleRowsJson: template.samples,
        isActive: true,
      },
    });
  }
}

async function seedDomainData(userId) {
  const fieldByName = new Map();
  const regionByName = new Map();
  const departmentByName = new Map();
  const gradeByName = new Map();
  const categoryByName = new Map();
  const productStatusByName = new Map();

  for (const field of [...new Set(companySeeds.map((seed) => seed[1]))]) {
    fieldByName.set(field, await prisma.companyField.create({ data: { userId, field } }));
  }

  for (const region of [...new Set(companySeeds.map((seed) => seed[2]))]) {
    regionByName.set(region, await prisma.companyRegion.create({ data: { userId, region } }));
  }

  for (const departmentName of departments) {
    departmentByName.set(
      departmentName,
      await prisma.contactDepartment.create({ data: { userId, departmentName } })
    );
  }

  for (const jobGradeName of grades) {
    gradeByName.set(
      jobGradeName,
      await prisma.contactJobGrade.create({ data: { userId, jobGradeName } })
    );
  }

  for (const categoryName of [...new Set(productSeeds.map((seed) => seed[2]))]) {
    categoryByName.set(
      categoryName,
      await prisma.productCategory.create({ data: { userId, categoryName } })
    );
  }

  for (const statusName of [...new Set(productSeeds.map((seed) => seed[3]))]) {
    productStatusByName.set(
      statusName,
      await prisma.productStatus.create({ data: { userId, statusName } })
    );
  }

  const companies = [];
  const contacts = [];
  const contactsByCompanyId = new Map();
  const products = [];
  const deals = [];
  const dealsByCompanyId = new Map();

  for (const [companyIndex, seed] of companySeeds.entries()) {
    const [companyName, field, region, memo] = seed;
    const company = await prisma.company.create({
      data: {
        userId,
        companyName,
        companyFieldId: fieldByName.get(field).id,
        companyRegionId: regionByName.get(region).id,
        createdAt: kstDateTime(-30 + companyIndex, 9),
      },
    });
    const companyRecord = { ...company, field, region, memo };
    companies.push(companyRecord);
    contactsByCompanyId.set(company.id, []);

    await prisma.companyMemoLog.createMany({
      data: [
        {
          userId,
          companyId: company.id,
          memoType: "계정 개요",
          memo,
          createdAt: kstDateTime(-25 + companyIndex, 10),
        },
        {
          userId,
          companyId: company.id,
          memoType: "최근 접점",
          memo: `${companyName} 담당자와 이번 분기 검토 범위, 예산 승인 일정, PoC 필요 여부를 확인했습니다.`,
          createdAt: kstDateTime(-18 + companyIndex, 15),
        },
      ],
    });

    await prisma.companyUserPrivateMemoLog.create({
      data: {
        userId,
        companyId: company.id,
        ...encryptPrivateMemo(
          "COMPANY",
          `${companyName} 내부 메모: 가격 민감도는 보통이며, 의사결정권자 일정 확인이 중요합니다.`
        ),
        createdAt: kstDateTime(-16 + companyIndex, 11),
      },
    });

    for (let contactIndex = 0; contactIndex < 3; contactIndex += 1) {
      const globalIndex = companyIndex * 3 + contactIndex;
      const departmentName = pick(departments, companyIndex + contactIndex);
      const jobGradeName = pick(grades, companyIndex + contactIndex + 2);
      const username = contactNames[globalIndex];
      const contact = await prisma.contact.create({
        data: {
          userId,
          companyId: company.id,
          username,
          mobile: mobile(globalIndex),
          email: email(companyIndex, contactIndex),
          contactDepartmentId: departmentByName.get(departmentName).id,
          contactJobGradeId: gradeByName.get(jobGradeName).id,
          createdAt: kstDateTime(-24 + companyIndex, 9 + contactIndex),
        },
      });
      const contactRecord = {
        ...contact,
        companyName,
        departmentName,
        jobGradeName,
      };
      contacts.push(contactRecord);
      contactsByCompanyId.get(company.id).push(contactRecord);

      await prisma.contactMemoLog.createMany({
        data: [
          {
            userId,
            contactId: contact.id,
            memoType: "관계 메모",
            memo: `${username}님은 ${companyName} ${departmentName}의 핵심 담당자입니다. 의사결정 자료는 짧은 요약과 수치 근거를 선호합니다.`,
            createdAt: kstDateTime(-20 + companyIndex, 12 + contactIndex),
          },
          {
            userId,
            contactId: contact.id,
            memoType: "커뮤니케이션",
            memo: "전화보다 이메일 회신이 빠르며, 미팅 전 아젠다를 먼저 공유하면 응답률이 높습니다.",
            createdAt: kstDateTime(-12 + companyIndex, 16),
          },
        ],
      });

      await prisma.contactUserPrivateMemoLog.create({
        data: {
          userId,
          contactId: contact.id,
          ...encryptPrivateMemo(
            "CONTACT",
            `${username} 개인 메모: 실무 영향력이 높고, 내부 승인 전에 레퍼런스 사례를 꼭 확인합니다.`
          ),
          createdAt: kstDateTime(-10 + companyIndex, 17),
        },
      });
    }
  }

  for (const [productIndex, seed] of productSeeds.entries()) {
    const [productName, productPrice, categoryName, statusName] = seed;
    const product = await prisma.product.create({
      data: {
        userId,
        productName,
        productPrice,
        productCategoryId: categoryByName.get(categoryName).id,
        productStatusId: productStatusByName.get(statusName).id,
        createdAt: kstDateTime(-40 + productIndex, 10),
      },
    });
    const productRecord = { ...product, categoryName, statusName };
    products.push(productRecord);

    await prisma.productMemoLog.createMany({
      data: [
        {
          userId,
          productId: product.id,
          memoType: "제품 설명",
          memo: `${productName}은 ${categoryName} 영역의 데모 제품이며 현재 상태는 ${statusName}입니다.`,
          createdAt: kstDateTime(-35 + productIndex, 11),
        },
        {
          userId,
          productId: product.id,
          memoType: "영업 포인트",
          memo: "반복 업무 절감, 보고 시간 단축, 고객 접점 누락 방지를 핵심 메시지로 사용합니다.",
          createdAt: kstDateTime(-28 + productIndex, 14),
        },
      ],
    });

    await prisma.productUserPrivateMemoLog.create({
      data: {
        userId,
        productId: product.id,
        ...encryptPrivateMemo(
          "PRODUCT",
          `${productName} 내부 메모: 할인 가능 범위는 데모 기준 최대 12%로 가정합니다.`
        ),
        createdAt: kstDateTime(-22 + productIndex, 15),
      },
    });
  }

  for (const [companyIndex, company] of companies.entries()) {
    const companyDeals = [];
    const companyContacts = contactsByCompanyId.get(company.id);

    for (const [templateIndex, template] of dealTemplates.entries()) {
      const status = pick(dealStatuses, companyIndex + templateIndex);
      const deal = await prisma.deal.create({
        data: {
          userId,
          dealName: `${company.companyName} ${template.suffix}`,
          dealCost: template.cost + companyIndex * 410000 + templateIndex * 680000,
          dealStatus: status,
          expectedEndDate: dateOnly(12 + companyIndex * 2 + templateIndex * 9),
          createdAt: kstDateTime(-15 + companyIndex, 10 + templateIndex),
        },
      });
      const linkedContacts = [
        companyContacts[templateIndex % companyContacts.length],
        companyContacts[(templateIndex + 1) % companyContacts.length],
      ];
      const linkedProducts = range(4).map((offset) =>
        pick(products, companyIndex + templateIndex * 3 + offset)
      );
      const dealRecord = {
        ...deal,
        company,
        contacts: linkedContacts,
        products: linkedProducts,
      };
      deals.push(dealRecord);
      companyDeals.push(dealRecord);

      await prisma.dealCompany.create({
        data: { userId, dealId: deal.id, companyId: company.id },
      });
      await prisma.dealContact.createMany({
        data: linkedContacts.map((contact) => ({
          userId,
          dealId: deal.id,
          contactId: contact.id,
        })),
        skipDuplicates: true,
      });
      await prisma.dealProduct.createMany({
        data: linkedProducts.map((product) => ({
          userId,
          dealId: deal.id,
          productId: product.id,
        })),
        skipDuplicates: true,
      });
      await prisma.dealFollowingActionLog.createMany({
        data: [
          {
            userId,
            dealId: deal.id,
            followingAction: template.action,
            checkComplete: status === "WON" || status === "LOST",
            createdAt: kstDateTime(-8 + companyIndex, 9),
          },
          {
            userId,
            dealId: deal.id,
            followingAction: "다음 미팅 전까지 제품별 견적 범위와 도입 일정표 공유",
            checkComplete: false,
            createdAt: kstDateTime(-5 + companyIndex, 16),
          },
        ],
      });
      await prisma.dealMemoLog.createMany({
        data: [
          {
            userId,
            dealId: deal.id,
            memoType: "딜 요약",
            memo: `${company.companyName} ${template.memo}`,
            createdAt: kstDateTime(-7 + companyIndex, 13),
          },
          {
            userId,
            dealId: deal.id,
            memoType: "연결 제품",
            memo: linkedProducts.map((product) => product.productName).join(", "),
            createdAt: kstDateTime(-4 + companyIndex, 17),
          },
        ],
      });
    }

    dealsByCompanyId.set(company.id, companyDeals);
  }

  const schedules = [];
  for (const [companyIndex, company] of companies.entries()) {
    const companyDeals = dealsByCompanyId.get(company.id);
    const scheduleTopic = pick(accountScheduleTopics, companyIndex);
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        scheduleTitle: `${company.companyName} ${scheduleTopic}`,
        startAt: kstDateTime(companyIndex % 21, 10 + (companyIndex % 5)),
        endAt: kstDateTime(companyIndex % 21, 11 + (companyIndex % 5)),
        timeZone: "Asia/Seoul",
        location: `${company.companyName} 담당자 회의`,
        memo: `${scheduleTopic}에서 연결된 딜의 예산, 의사결정권자, 다음 행동을 확인합니다.`,
        createdAt: kstDateTime(-3 + companyIndex, 9),
      },
    });
    schedules.push(schedule);
    await prisma.scheduleDeal.createMany({
      data: companyDeals.map((deal) => ({
        userId,
        scheduleId: schedule.id,
        dealId: deal.id,
      })),
      skipDuplicates: true,
    });
  }

  for (const [index, review] of pipelineReviewSeeds.entries()) {
    const linkedDeals = range(5).map((offset) => pick(deals, index * 6 + offset));
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        scheduleTitle: review.title,
        startAt: kstDateTime(3 + index * 2, 14),
        endAt: kstDateTime(3 + index * 2, 15, 30),
        timeZone: "Asia/Seoul",
        location: review.location,
        memo: review.memo,
        createdAt: kstDateTime(-2 + index, 10),
      },
    });
    schedules.push(schedule);
    await prisma.scheduleDeal.createMany({
      data: linkedDeals.map((deal) => ({
        userId,
        scheduleId: schedule.id,
        dealId: deal.id,
      })),
      skipDuplicates: true,
    });
  }

  for (const [companyIndex, company] of companies.entries()) {
    const meetingTopic = pick(accountMeetingTopics, companyIndex);
    await createMeetingNote({
      userId,
      title: `${company.companyName} ${meetingTopic}`,
      sourceType: pick(
        [MeetingNoteSourceType.MANUAL, MeetingNoteSourceType.TEXT_AI, MeetingNoteSourceType.STT_AI],
        companyIndex
      ),
      meetingAt: kstDateTime(-9 + companyIndex, 9 + (companyIndex % 7)),
      companies: [company, pick(companies, companyIndex + 1)],
      contacts: contactsByCompanyId.get(company.id),
      products: range(4).map((offset) => pick(products, companyIndex + offset)),
      deals: dealsByCompanyId.get(company.id).slice(0, 2),
      details: `${company.companyName} ${meetingTopic}에서 연결 딜의 단계, 담당자별 관심사, 제품별 제안 포인트를 확인했습니다. ${company.memo}`,
      nextPlan: `${meetingTopic} 후속으로 견적 범위, 검토 자료, 다음 미팅 일정을 정리해 공유합니다.`,
      requiredAction: "제품 데모 계정 준비, 의사결정권자 참석 일정 확인, 성공 기준 합의",
    });
  }

  for (const [index, seed] of strategicMeetingSeeds.entries()) {
    const firstDeal = pick(deals, index * 4);
    const secondDeal = pick(deals, index * 4 + 1);
    await createMeetingNote({
      userId,
      title: seed.title,
      sourceType: pick([MeetingNoteSourceType.TEXT_AI, MeetingNoteSourceType.MANUAL], index),
      meetingAt: kstDateTime(-5 + index, 16),
      companies: [firstDeal.company, secondDeal.company],
      contacts: [firstDeal.contacts[0], firstDeal.contacts[1], secondDeal.contacts[0]],
      products: [firstDeal.products[0], firstDeal.products[1], secondDeal.products[2]],
      deals: [firstDeal, secondDeal],
      details: seed.details,
      nextPlan: seed.nextPlan,
      requiredAction: seed.requiredAction,
    });
  }

  await seedBusinessCards({ userId, companies, contacts });
  await seedImportLogs({ userId, companies, contacts, products, deals });

  return { companies, contacts, products, deals, schedules };
}

async function createMeetingNote(input) {
  const note = await prisma.meetingNote.create({
    data: {
      userId: input.userId,
      sourceType: input.sourceType,
      title: input.title,
      meetingAt: input.meetingAt,
      timeZone: "Asia/Seoul",
      details: input.details,
      nextPlan: input.nextPlan,
      requiredAction: input.requiredAction,
      rawText:
        input.sourceType === MeetingNoteSourceType.MANUAL
          ? null
          : `${input.title} 회의 원문 기록입니다. 참석자별 발언, 의사결정 조건, 후속 조치가 포함되어 있습니다.`,
    },
  });

  await prisma.meetingNoteCompany.createMany({
    data: input.companies.map((company) => ({
      userId: input.userId,
      meetingNoteId: note.id,
      companyId: company.id,
      companyNameSnapshot: company.companyName,
      companyFieldSnapshot: company.field,
      companyRegionSnapshot: company.region,
    })),
  });

  await prisma.meetingNoteContact.createMany({
    data: input.contacts.map((contact) => ({
      userId: input.userId,
      meetingNoteId: note.id,
      contactId: contact.id,
      companyId: contact.companyId,
      contactUsernameSnapshot: contact.username,
      contactEmailSnapshot: contact.email,
      contactMobileSnapshot: contact.mobile,
      contactCompanyNameSnapshot: contact.companyName,
      contactDepartmentSnapshot: contact.departmentName,
      contactJobGradeSnapshot: contact.jobGradeName,
    })),
  });

  await prisma.meetingNoteProduct.createMany({
    data: input.products.map((product) => ({
      userId: input.userId,
      meetingNoteId: note.id,
      productId: product.id,
      productNameSnapshot: product.productName,
      productPriceSnapshot: product.productPrice,
      productCategorySnapshot: product.categoryName,
      productStatusSnapshot: product.statusName,
    })),
  });

  await prisma.meetingNoteDeal.createMany({
    data: input.deals.map((deal) => ({
      userId: input.userId,
      meetingNoteId: note.id,
      dealId: deal.id,
      dealNameSnapshot: deal.dealName,
      dealStatusSnapshot: deal.dealStatus,
      dealCostSnapshot: deal.dealCost,
      dealExpectedEndDateSnapshot: deal.expectedEndDate,
    })),
    skipDuplicates: true,
  });
}

async function seedBusinessCards({ userId, companies, contacts }) {
  for (const index of range(24)) {
    const contact = contacts[index];
    const company = companies.find((item) => item.id === contact.companyId);
    await prisma.businessCardScanLog.create({
      data: {
        userId,
        status: BusinessCardScanStatus.CONFIRMED,
        companyName: company.companyName,
        companyFieldName: company.field,
        companyRegionName: company.region,
        contactName: contact.username,
        contactMobile: contact.mobile,
        contactEmail: contact.email,
        contactDepartmentName: contact.departmentName,
        contactJobGradeName: contact.jobGradeName,
        companyId: company.id,
        contactId: contact.id,
        companyResolution: BusinessCardResolution.EXISTING,
        contactResolution: BusinessCardResolution.EXISTING,
        aiProvider: "OPENAI",
        aiModel: "gpt-4.1-mini-demo",
        promptSnapshot: "명함 이미지에서 회사명, 담당자명, 연락처, 직급, 부서를 JSON으로 추출합니다.",
        requestToken: 820 + index,
        responseToken: 210 + index,
        totalToken: 1030 + index * 2,
        requestCost: 0.0008,
        responseCost: 0.0004,
        totalCost: 0.0012,
        pendingTimeMs: 1200 + index * 35,
        confirmedAt: kstDateTime(-6 + index, 13),
        createdAt: kstDateTime(-7 + index, 11),
      },
    });
  }

  for (const [index, pendingCard] of pendingBusinessCardSeeds.entries()) {
    const company = pick(companies, index + 4);
    await prisma.businessCardScanLog.create({
      data: {
        userId,
        status: BusinessCardScanStatus.OCR_SUCCESS,
        companyName: pendingCard[0],
        companyFieldName: company.field,
        companyRegionName: company.region,
        contactName: pendingCard[1],
        contactMobile: pendingCard[2],
        contactEmail: pendingCard[3],
        contactDepartmentName: pendingCard[4],
        contactJobGradeName: pendingCard[5],
        aiProvider: "OPENAI",
        aiModel: "gpt-4.1-mini-demo",
        promptSnapshot: "명함 OCR 성공 후 사용자의 확인을 기다리는 스캔 로그입니다.",
        requestToken: 790 + index,
        responseToken: 180 + index,
        totalToken: 970 + index,
        requestCost: 0.0007,
        responseCost: 0.0003,
        totalCost: 0.001,
        pendingTimeMs: 980 + index * 42,
        createdAt: kstDateTime(-2 + index, 10),
      },
    });
  }

  for (const index of range(4)) {
    await prisma.businessCardScanLog.create({
      data: {
        userId,
        status: BusinessCardScanStatus.OCR_FAILED,
        companyName: null,
        contactName: null,
        aiProvider: "OPENAI",
        aiModel: "gpt-4.1-mini-demo",
        promptSnapshot: "흐린 명함 이미지로 OCR이 실패한 스캔 로그입니다.",
        requestToken: 610 + index,
        responseToken: 40,
        totalToken: 650 + index,
        requestCost: 0.0005,
        responseCost: 0.0001,
        totalCost: 0.0006,
        pendingTimeMs: 2100 + index * 80,
        createdAt: kstDateTime(-1 + index, 18),
      },
    });
  }
}

async function seedImportLogs({ userId, companies, contacts, products, deals }) {
  const rowsByType = {
    COMPANY: companies.slice(0, 18).map((company) => ({
      companyName: company.companyName,
      companyFieldName: company.field,
      companyRegionName: company.region,
    })),
    CONTACT: contacts.slice(0, 18).map((contact) => ({
      companyName: contact.companyName,
      contactName: contact.username,
      contactEmail: contact.email,
      contactPhone: contact.mobile,
      contactDepartmentName: contact.departmentName,
      contactJobGradeName: contact.jobGradeName,
    })),
    PRODUCT: products.slice(0, 18).map((product) => ({
      productName: product.productName,
      productPrice: product.productPrice,
      productCategoryName: product.categoryName,
      productStatusName: product.statusName,
    })),
    DEAL: deals.slice(0, 18).map((deal) => ({
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      dealStatus: deal.dealStatus,
      expectedEndDate: deal.expectedEndDate.toISOString().slice(0, 10),
      companyName: deal.company.companyName,
      contactName: deal.contacts[0].username,
      productName: deal.products[0].productName,
    })),
  };

  for (const template of importTemplates) {
    const rows = rowsByType[template.type];
    for (const batchIndex of range(3)) {
      const batchRows = rows.slice(batchIndex * 6, batchIndex * 6 + 6);
      const log = await prisma.importUserLog.create({
        data: {
          userId,
          targetType: template.type,
          templateVersion: template.version,
        templateColumnsJson: template.columns,
        contextLabel:
          template.type === ImportTemplateType.CONTACT
              ? batchRows[0]?.companyName ?? null
              : null,
          contextJson:
            template.type === ImportTemplateType.CONTACT
              ? { companyName: batchRows[0]?.companyName ?? null, batchSize: batchRows.length }
              : null,
          originalFileName: importFileNames[template.type][batchIndex],
          fileSizeBytes: 48_000 + batchIndex * 3200,
          totalRowCount: batchRows.length,
          importedRowCount: batchRows.length,
          createdAt: kstDateTime(-12 + batchIndex, 8 + batchIndex),
        },
      });

      await prisma.importUserLogRow.createMany({
        data: batchRows.map((row, rowIndex) => ({
          importUserLogId: log.id,
          rowNumber: rowIndex + 2,
          submittedDataJson: row,
          targetLabel:
            row.companyName || row.contactName || row.productName || row.dealName || `row-${rowIndex + 1}`,
          createdAt: kstDateTime(-12 + batchIndex, 8 + batchIndex, rowIndex),
        })),
      });
    }
  }
}

async function assertTrashEmpty(userId) {
  const trashModels = [
    "company",
    "contact",
    "product",
    "deal",
    "companyMemoLog",
    "companyUserPrivateMemoLog",
    "contactMemoLog",
    "contactUserPrivateMemoLog",
    "productMemoLog",
    "productUserPrivateMemoLog",
    "dealFollowingActionLog",
    "dealMemoLog",
    "meetingNote",
  ];

  const trash = {};
  for (const model of trashModels) {
    trash[model] = await prisma[model].count({
      where: { userId, deletedAt: { not: null } },
    });
  }

  const total = Object.values(trash).reduce((sum, count) => sum + count, 0);
  if (total !== 0) {
    throw new Error(`Trash is not empty: ${JSON.stringify(trash)}`);
  }
}

async function summary(userId) {
  const counts = {};
  const modelWhere = {
    companyField: { userId },
    companyRegion: { userId },
    company: { userId },
    companyMemoLog: { userId },
    companyUserPrivateMemoLog: { userId },
    contactDepartment: { userId },
    contactJobGrade: { userId },
    contact: { userId },
    contactMemoLog: { userId },
    contactUserPrivateMemoLog: { userId },
    productCategory: { userId },
    productStatus: { userId },
    product: { userId },
    productMemoLog: { userId },
    productUserPrivateMemoLog: { userId },
    deal: { userId },
    dealCompany: { userId },
    dealContact: { userId },
    dealProduct: { userId },
    dealFollowingActionLog: { userId },
    dealMemoLog: { userId },
    schedule: { userId },
    scheduleDeal: { userId },
    meetingNote: { userId },
    meetingNoteCompany: { userId },
    meetingNoteContact: { userId },
    meetingNoteProduct: { userId },
    meetingNoteDeal: { userId },
    businessCardScanLog: { userId },
    importUserLog: { userId },
  };

  for (const [model, where] of Object.entries(modelWhere)) {
    counts[model] = await prisma[model].count({ where });
  }

  counts.importUserLogRow = await prisma.importUserLogRow.count({
    where: { importUserLog: { userId } },
  });
  counts.activeImportTemplate = await prisma.importTemplate.count({
    where: { isActive: true },
  });

  return counts;
}

async function main() {
  console.log("Seeding rich local demo data...");
  await seedAuth();
  await clearDemoData(USER_ID);
  await seedImportTemplates();
  await seedDomainData(USER_ID);
  await assertTrashEmpty(USER_ID);
  console.log(JSON.stringify(await summary(USER_ID), null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

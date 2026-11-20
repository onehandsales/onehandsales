const base = "/bonsai-public/";

// 의미 : 2024-02-03 공식 웹 보관본에서 연결한 원본 자산이며 출처·해시는 G02 자산 목록에 기록한다.
export const publicAssets = {
  logo: base + "635b95cfdbc1e264b35486ad_Symbols.svg",
  girl: base + "64ec9c668a24d740103b39ac_Hero-home-girl.webp",
  branch: base + "64ec9cfc2661cc2d53ac8204_branch.webp",
  stars: base + "65af91044f83460397ae579b_stars.png",
  reviewBrands: base + "65b1179c7ed23201de2d1eaa_Group-40038.png",
  dashboard: base + "651297985c35c5047a250f7c_dashboard_bonsai.webp",
  phone: base + "64ec9dea06433233487f6cba_phone-hr.webp",
  contour: base + "635e8d2a61099e05c32ae3e6_background.webp",
  darkContour: base + "64f727fca255a9bff1d0b7a0_pattern_dark_bg.webp",
  alison: base + "64ec9e9a51e36108384d60f7_testimonial_hp_3.webp",
  laura: base + "64ec9e9afeae94b961247db6_testimonial_hp_1.webp",
  alexandre: base + "64ec9e9b21f40568e0696406_testimonial_hp_2.webp",
  invoice: base + "6389da1badcfdb837145a175_invoices-no-bg.webp",
  banking: base + "6389ee080e53ef8151ede964_phone-no-bg.webp",
  accounting: base + "63c11d0d6cbc4abd27f2a38b_accounting-hp-nobg.webp",
  client: base + "64eca02fbeacdc4daa96c320_client-crm.webp",
  documents: base + "64eca02fce92e53fa685f8de_doc-templates.webp",
  branding: base + "64eca030802d51cccbd82b5e_white-labelled.webp",
  support: base + "64eca0c51400178adcc26e7f_customer-support.webp",
  supportLeaf: base + "64eca0c573e65d3aa24f227c_leaf_1.webp",
  scheduling: base + "6398d9d0935e08a732d0c785_scheduling-preview.webp",
  paid: base + "638efda7d12d6b316c408c99_icon-2.svg",
  expense: base + "638efda8af44d4ca4a155818_icon.svg",
  lead: base + "638efda70cb055424da813c5_icon-1.svg",
  payment: base + "638f02d2a0a3536eca508822_icon-3.svg",
  linkedin: base + "635fe4f6f27b8975b546ae40_Frame-12620.svg",
  twitter: base + "635fe519af5055bb9acb73f3_Frame-12620-1.svg",
  arrow: base + "6368c5d2b1ee1c2a30bc9e9c_Vector-89-Stroke.svg",
  chevron: base + "635fbb776c5db6f1eef72e9e_Rectangle-3578.svg",
  menu: base + "6363a910018ea661db9d2000_Group-12489.svg",
};

export const productGroups = [
  { title: "Manage clients", links: [
    { label: "Contracts", href: "/contracts", icon: "635ea64cc7a1a7fca876b7cc_Send.svg" },
    { label: "Forms", href: "/forms", icon: "635eaa2a23db298fb18c620e_Document.svg" },
    { label: "Scheduling", href: "/scheduling", icon: "635eaa2a6c0ae085946555e1_Calendar.svg" },
    { label: "Client CRM", href: "/crm", icon: "635ea64cb165568d5eef83b5_Paper.svg" },
  ] },
  { title: "Manage projects", links: [
    { label: "Collaboration", href: "/crm", icon: "635ea64c78332f0a763c1063_users.svg" },
    { label: "Invoicing", href: "/invoicing", icon: "635ea64cb16556a9c6ef83b6_icon.svg" },
    { label: "Time Tracking", href: "/time-tracking", icon: "635eaa2970620b7e4dd73978_timer.svg" },
    { label: "Project Management", href: "/crm", icon: "635eaa2ae5fc3dcbfbc35665_Tick-Square.svg" },
  ] },
  { title: "Manage finances", links: [
    { label: "Payments", href: "/payments", icon: "635eaa2ac917933c88461916_Paper-1.svg" },
    { label: "Expense Tracking", href: "/bookkeeping", icon: "635eaa2abc9d9c4882eb064b_Activity.svg" },
    { label: "Tax Helper", href: "/taxes", icon: "635eaa29e5fc3d0061c35664_receipt.svg" },
    { label: "Banking", href: "/banking", icon: "649ea61eea45dd5ebd303113_card.svg" },
  ] },
];

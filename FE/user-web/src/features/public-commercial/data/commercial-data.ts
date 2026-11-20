import reviews from "./review-content.json";

export const reviewCards = reviews;
const base = "/bonsai-commercial/";
export const commercialAssets = {
  check: base + "637637410d31673cc7050386_green-check.svg",
  poster: base + "639b921d4434546acff1315f_testimonial-mary-mitchell.webp",
  play: base + "639b94e417a94b285f121a97_icon-play.svg",
  g2: base + "6368ee758abc407679fe354f_g2.svg",
  capterra: base + "6446774a3c07c5353f34dd13_Capterra.svg",
};
export const reviewDestinations = [
  { id: "g2", label: "Bonsai reviews on G2", sourceHref: "https://www.g2.com/products/bonsai/reviews" },
  { id: "capterra", label: "Bonsai reviews on Capterra", sourceHref: "https://www.capterra.com/p/238825/Bonsai/" },
  ...reviewCards.filter(card => card.sourceHref !== null).map(card => ({ id: card.id, label: `${card.name}, ${card.role}`, sourceHref: card.sourceHref })),
].map(item => ({ ...item, path: `/outbound/reviews/${item.id}`, goal: "G04" }));

export const commercialRoutes = [{ path: "/pricing", title: "Pricing" }, { path: "/reviews", title: "Reviews" }];
// 의미 : G79 본문이 아닌 공개 플랜 인계 전용 경계이며 실제 앱 URL로 확정하지 않는다.
export const subscriptionHandoffPath = "/preview/subscription";
export const commercialPendingDestinations = [
  ...reviewDestinations,
  { path: subscriptionHandoffPath, label: "Subscription selection", goal: "G79", sourceHref: null },
  // 의미 : 캡처의 라벨만 관찰했으며 주소는 로컬 목 후보이고 G03 본문은 미수록이다.
  { path: "/software/professional-services", label: "Professional services", goal: "G03", sourceHref: null },
];

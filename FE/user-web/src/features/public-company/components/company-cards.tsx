type CompanyCard = { title: string; body: string; icon: string };
// 기능 : 제휴·채용 원본의 정적 설명 카드와 아이콘을 같은 읽기 구조로 표시한다.
export function CompanyCards({ cards }: { cards: CompanyCard[] }) {
  return <div className="company-cards">{cards.map(card => <article key={card.title}><img src={card.icon} alt="" width="30" height="30" /><h3>{card.title}</h3><p>{card.body.replaceAll("\u200d", "").trim()}</p></article>)}</div>;
}

import { useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Link } from "react-router-dom";
import navigation from "../data/navigation-content.json";
import { publicAssets } from "../data/public-assets";
import { usePublicMenu } from "../hooks/use-public-menu";
import { PublicLink, SignupLink } from "./public-link";

// 기능 : 원본 유형별 추천 템플릿을 선택하고 후속 G06 목적지로 연결한다.
function TemplateMenu() {
  const [selected, setSelected] = useState(0);
  const group = navigation.templates[selected] ?? navigation.templates[0];
  const allTemplates = group?.links.find(link => link.label === "See all templates")?.sourceHref ?? "/templates";
  // 기능 : 터치 합성 진입을 제외하고 마우스가 가리킨 템플릿을 선택한다.
  function handlePointer(index: number, event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse") setSelected(index);
  }
  // 기능 : 세로 탭의 방향키·Home·End 입력으로 선택과 초점을 함께 옮긴다.
  function handleKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    const next = event.key === "ArrowDown" ? (index + 1) % navigation.templates.length
      : event.key === "ArrowUp" ? (index + navigation.templates.length - 1) % navigation.templates.length
      : event.key === "Home" ? 0 : event.key === "End" ? navigation.templates.length - 1 : null;
    // 이유 : Tab은 추천 링크로 이어져야 하므로 방향 이동 키에서만 기본 동작을 막는다.
    if (next !== null) { event.preventDefault(); setSelected(next); document.getElementById(`template-tab-${next}`)?.focus(); }
  }
  return <div className="public-template-menu">
    <div className="public-template-types" role="tablist" aria-label="Template categories" aria-orientation="vertical">
      {navigation.templates.map((item, index) => <button key={item.name} type="button" role="tab"
        id={`template-tab-${index}`} aria-controls="template-panel" aria-selected={selected === index}
        tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)}
        onPointerEnter={event => handlePointer(index, event)} onKeyDown={event => handleKeyDown(index, event)}>
        {item.name}{selected === index && <img src={publicAssets.arrow} alt="" />}</button>)}
      <PublicLink href="/templates">All Templates</PublicLink>
    </div>
    <div id="template-panel" role="tabpanel" aria-labelledby={`template-tab-${selected}`}>
      <p>{group?.hint}</p><div className="public-template-links">
        {group?.links.filter(link => link.label !== "See all templates").map(link => <PublicLink key={link.sourceHref} href={link.sourceHref}>{link.label}</PublicLink>)}
      </div><PublicLink className="public-text-link public-all-templates" href={allTemplates}>See all templates</PublicLink>
    </div>
  </div>;
}

// 기능 : 원본 메가메뉴의 그룹·문구·홍보 이미지를 로컬 링크로 표시한다.
function MegaMenu({ name }: { name: string }) {
  if (name === "Templates") return <TemplateMenu />;
  const menu = navigation.menus.find(item => item.name === name);
  return <div className="public-menu-grid">{menu?.groups.map(group => <div key={group.title}>
    <h2>{group.title}</h2>
    {group.title === "What’s new" && <><img className="public-scheduling-promo" src={publicAssets.scheduling} alt="" /><p>Branded scheduling portal</p></>}
    {group.links.map(link => <PublicLink key={link.label} className={group.title === "What’s new" ? "public-text-link" : undefined} href={link.sourceHref}>{link.label}</PublicLink>)}
  </div>)}</div>;
}

// 기능 : 공개 원본 헤더에서 메뉴 열기·닫기와 익명 CTA를 제공한다.
export function PublicHeader({ scrolled, signedIn = false }: { scrolled: boolean; signedIn?: boolean }) {
  const menu = usePublicMenu();
  return <header ref={menu.root} className={`public-header ${scrolled ? "is-scrolled" : ""}`}
    onBlur={menu.handleBlur} onFocus={menu.handleFocus} onPointerLeave={menu.leave}>
    <div className="public-header-row public-wide">
      <Link to="/" className="public-logo" aria-label="Bonsai home"><img src={publicAssets.logo} alt="bonsai" width="100" height="22" /></Link>
      <button className="public-mobile-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menu.mobileOpen}
        aria-controls="public-navigation" onClick={menu.toggleMobile}><img src={publicAssets.menu} alt="" /></button>
      <nav id="public-navigation" aria-label="Main navigation" className={menu.mobileOpen ? "is-mobile-open" : ""}>
        {["Product", "Industries", "Templates", "Pricing", "Resources", "Reviews"].map(name => name === "Pricing" || name === "Reviews"
          ? <PublicLink key={name} href={`/${name.toLowerCase()}`}>{name}</PublicLink>
          : <button type="button" key={name} aria-expanded={menu.open === name} aria-controls="public-mega-menu"
            onPointerEnter={event => menu.hover(name, event)} onClick={event => menu.toggle(name, event.currentTarget)}>{name}</button>)}
      </nav>
      <div className="public-auth-links">{signedIn ? <Link className="public-button" to="/app">Go to dashboard</Link>
        : <><Link to="/login">Log in</Link><SignupLink source="header">Start free</SignupLink></>}</div>
    </div>
    {menu.open && <div id="public-mega-menu" className="public-mega-menu"><div className="public-wide"><MegaMenu key={menu.open} name={menu.open} /></div></div>}
  </header>;
}

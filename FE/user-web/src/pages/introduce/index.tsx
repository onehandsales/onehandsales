import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Circle,
  ScanLine,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthSocialLoginModal } from "@/features/auth";

const heroImageUrl = "/introduce/hero-phone.jpg";
const dealImageUrl = "/introduce/deal-handshake.jpg";

const metrics = [
  { value: "1곳", label: "영업 정리" },
  { value: "24h", label: "일정 알림" },
  { value: "3개", label: "기기" },
  { value: "30초", label: "명함 입력" },
];

const firstScreenItems = [
  { label: "회사", value: "128" },
  { label: "담당자", value: "342" },
  { label: "딜", value: "47" },
  { label: "일정", value: "12" },
];

const actionRows = [
  { label: "재연락", value: "오늘", detail: "고객 A" },
  { label: "제안서", value: "D-2", detail: "견적 확인" },
  { label: "계약", value: "8건", detail: "진행 중" },
];

const records = [
  { label: "상담", value: "24" },
  { label: "회의록", value: "9" },
  { label: "메모", value: "86" },
];

const chapterLinks = [
  { label: "고객", href: "#first-screen" },
  { label: "상담", href: "#record" },
  { label: "딜", href: "#action" },
  { label: "일정", href: "#schedule" },
];

export function IntroducePage() {
  useIntroduceMotion();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <IntroduceMotionStyles />
      <Header onOpenLogin={openLoginModal} />
      <HeroSection onOpenLogin={openLoginModal} />
      <FirstScreenSection />
      <MetricsSection />
      <ActionSection onOpenLogin={openLoginModal} />
      <RecordSection onOpenLogin={openLoginModal} />
      <ScheduleSection />
      <FinalSection onOpenLogin={openLoginModal} />
      <AuthSocialLoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </main>
  );
}

function HeroSection({
  onOpenLogin,
}: {
  readonly onOpenLogin: () => void;
}) {
  return (
    <section
      className="introduce-hero-bg relative min-h-[760px] overflow-hidden bg-[#050505] md:min-h-screen"
      id="hero"
      style={{ "--introduce-bg": `url("${heroImageUrl}")` } as CSSProperties}
    >
      <div className="relative z-10 mx-auto flex min-h-[calc(760px-56px)] max-w-[1180px] items-center px-5 pb-16 pt-8 md:min-h-[calc(100vh-56px)] md:px-7">
        <div
          className="max-w-[560px]"
          data-introduce-reveal
          data-introduce-visible="true"
        >
          <p className="text-[11px] text-white/50">Sales CRM</p>
          <h1 className="mt-8 text-[44px] font-medium leading-[1.02] tracking-normal text-white md:text-[66px]">
            다음 액션을
            <br />
            놓치지 않게.
          </h1>
          <p className="mt-6 text-[15px] leading-7 text-white/60">
            고객. 상담. 일정. 계약.
          </p>
          <button
            className="mt-8 inline-flex h-8 items-center gap-2 rounded-full bg-white px-4 text-[12px] font-semibold text-black"
            onClick={onOpenLogin}
            type="button"
          >
            무료 시작
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Header({
  onOpenLogin,
}: {
  readonly onOpenLogin: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 -mb-14 h-14 border-b border-white/10 bg-black/45 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-5 md:px-7">
        <Link className="flex items-center gap-2 text-xs text-white" to="/introduce">
          <Circle className="h-3 w-3 fill-white" />
          <span>한손</span>
        </Link>

        <nav className="hidden items-center gap-6 text-[11px] text-white/60 md:flex">
          {chapterLinks.map((item) => (
            <a
              className="transition-colors hover:text-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className="inline-flex h-7 items-center rounded-full bg-white px-3 text-[11px] font-semibold text-black"
          onClick={onOpenLogin}
          type="button"
        >
          로그인
        </button>
      </div>
      <span className="introduce-scroll-progress pointer-events-none absolute bottom-0 left-0 h-px bg-white/80" />
    </header>
  );
}

function FirstScreenSection() {
  return (
    <LightScene
      id="first-screen"
      kicker="01"
      title={
        <>
          영업의
          <br />
          첫 화면.
        </>
      }
    >
      <div className="grid w-full gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductPanel>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="text-xs text-white/40">오늘</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black">
              12 액션
            </span>
          </div>
          <div className="grid gap-3 p-5">
            {firstScreenItems.map((item) => (
              <div
                className="grid grid-cols-[1fr_auto] items-center rounded-[6px] border border-white/10 bg-white/[0.04] px-4 py-3"
                key={item.label}
              >
                <span className="text-sm text-white/75">{item.label}</span>
                <span className="text-2xl font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </ProductPanel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MiniWhiteCard icon={<BriefcaseBusiness />} label="회사" value="고객사" />
          <MiniWhiteCard icon={<UserRound />} label="담당자" value="연락처" />
        </div>
      </div>
    </LightScene>
  );
}

function MetricsSection() {
  return (
    <DarkScene
      className="bg-[#060606]"
      id="metrics"
      kicker="02"
      title={
        <>
          모든 영업.
          <br />
          한 곳에.
        </>
      }
    >
      <div className="grid w-full gap-8 border-t border-white/10 pt-9 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[42px] font-medium leading-none tracking-normal md:text-[52px]">
              {metric.value}
            </p>
            <p className="mt-3 text-xs text-white/40">{metric.label}</p>
          </div>
        ))}
      </div>
    </DarkScene>
  );
}

function ActionSection({
  onOpenLogin,
}: {
  readonly onOpenLogin: () => void;
}) {
  return (
    <SplitDarkScene
      buttonLabel="액션 보기"
      id="action"
      kicker="03"
      onOpenLogin={onOpenLogin}
      title={
        <>
          오늘 할 일.
          <br />
          바로 보이게.
        </>
      }
      visual={<DesktopActionMock />}
    />
  );
}

function RecordSection({
  onOpenLogin,
}: {
  readonly onOpenLogin: () => void;
}) {
  return (
    <SplitDarkScene
      buttonLabel="기록 보기"
      id="record"
      kicker="04"
      onOpenLogin={onOpenLogin}
      title={
        <>
          상담 기록.
          <br />
          끊기지 않게.
        </>
      }
      visual={<PhoneRecordMock />}
    />
  );
}

function ScheduleSection() {
  return (
    <LightScene
      id="schedule"
      kicker="05"
      title={
        <>
          일정.
          <br />
          놓침 없이.
        </>
      }
    >
      <div className="grid w-full gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <MiniWhiteCard icon={<CalendarDays />} label="오늘" value="12" />
          <MiniWhiteCard icon={<Bell />} label="알림" value="24h" />
          <MiniWhiteCard icon={<ScanLine />} label="명함" value="30초" />
        </div>
        <CalendarMock />
      </div>
    </LightScene>
  );
}

function FinalSection({
  onOpenLogin,
}: {
  readonly onOpenLogin: () => void;
}) {
  return (
    <section
      className="introduce-deal-bg relative min-h-[760px] overflow-hidden bg-[#050505] md:min-h-screen"
      id="start"
      style={{ "--introduce-bg": `url("${dealImageUrl}")` } as CSSProperties}
    >
      <div className="mx-auto flex min-h-[760px] max-w-[1180px] items-center px-5 py-20 md:min-h-screen md:px-7">
        <div className="max-w-[720px]" data-introduce-reveal>
          <p className="text-[11px] text-white/40">Start</p>
          <h2 className="mt-6 text-[48px] font-medium leading-[1.02] tracking-normal md:text-[82px]">
            영업.
            <br />
            한 손에.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {["고객", "상담", "일정", "계약"].map((item) => (
              <span
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/70"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <button
            className="mt-10 inline-flex h-9 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black"
            onClick={onOpenLogin}
            type="button"
          >
            무료 시작
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function LightScene({
  id,
  kicker,
  title,
  children,
}: {
  readonly id: string;
  readonly kicker: string;
  readonly title: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section
      className="flex min-h-[760px] scroll-mt-16 items-center bg-[#FAFAF8] px-5 py-20 text-neutral-950 md:min-h-screen md:px-7"
      id={id}
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-10" data-introduce-reveal>
        <div>
          <p className="text-[11px] text-black/40">{kicker}</p>
          <h2 className="mt-4 text-[38px] font-medium leading-[1.06] tracking-normal md:text-[58px]">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function DarkScene({
  id,
  kicker,
  title,
  children,
  className = "",
}: {
  readonly id: string;
  readonly kicker: string;
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section
      className={`flex min-h-[760px] scroll-mt-16 items-center px-5 py-20 md:min-h-screen md:px-7 ${className}`}
      id={id}
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-14" data-introduce-reveal>
        <div className="mx-auto max-w-[680px] text-center">
          <p className="text-[11px] text-white/40">{kicker}</p>
          <h2 className="mt-4 text-[38px] font-medium leading-[1.06] tracking-normal md:text-[58px]">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function SplitDarkScene({
  id,
  kicker,
  title,
  buttonLabel,
  visual,
  onOpenLogin,
}: {
  readonly id: string;
  readonly kicker: string;
  readonly title: ReactNode;
  readonly buttonLabel: string;
  readonly visual: ReactNode;
  readonly onOpenLogin: () => void;
}) {
  return (
    <section
      className="flex min-h-[760px] scroll-mt-16 items-center bg-[#050505] px-5 py-20 md:min-h-screen md:px-7"
      id={id}
    >
      <div
        className="mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[0.46fr_0.54fr] lg:items-center"
        data-introduce-reveal
      >
        <div>
          <p className="text-[11px] text-white/40">{kicker}</p>
          <h2 className="mt-5 text-[34px] font-medium leading-[1.08] tracking-normal md:text-[52px]">
            {title}
          </h2>
          <button
            className="mt-9 inline-flex h-8 items-center rounded-full bg-white px-4 text-[12px] font-semibold text-black"
            onClick={onOpenLogin}
            type="button"
          >
            {buttonLabel}
          </button>
        </div>
        {visual}
      </div>
    </section>
  );
}

function ProductPanel({ children }: { readonly children: ReactNode }) {
  return (
    <div
      className="min-h-[360px] overflow-hidden rounded-[8px] bg-[#101010] text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.58)), url("${heroImageUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {children}
    </div>
  );
}

function MiniWhiteCard({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-h-[172px] rounded-[8px] border border-black/10 bg-white p-5">
      <div className="text-black/50 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <p className="mt-8 text-[11px] text-black/40">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-normal">{value}</p>
    </div>
  );
}

function DesktopActionMock() {
  const [activeAction, setActiveAction] = useState(actionRows[0]?.label ?? "");
  const activeActionRow =
    actionRows.find((row) => row.label === activeAction) ?? actionRows[0];

  return (
    <div className="introduce-card-lift min-h-[430px] rounded-[8px] bg-[#181818] p-5">
      <div className="h-full min-h-[390px] rounded-[8px] bg-[#F4F1EC] p-5 text-neutral-950">
        <div className="flex items-center gap-2 border-b border-black/10 pb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
          <span className="ml-auto rounded-full bg-white px-3 py-1 text-[11px] text-black/40">
            오늘
          </span>
        </div>
        <div className="mt-8 grid gap-3">
          {actionRows.map((row) => (
            <button
              className={[
                "grid grid-cols-[32px_1fr_auto] items-center rounded-[8px] border px-4 py-4 text-left transition duration-300",
                activeAction === row.label
                  ? "border-black bg-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
                  : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/20",
              ].join(" ")}
              key={row.label}
              onClick={() => setActiveAction(row.label)}
              type="button"
            >
              <Check
                className={
                  activeAction === row.label
                    ? "h-4 w-4 text-white"
                    : "h-4 w-4 text-emerald-600"
                }
              />
              <span className="text-sm font-medium">{row.label}</span>
              <span
                className={
                  activeAction === row.label
                    ? "text-sm text-white/70"
                    : "text-sm text-black/50"
                }
              >
                {row.value}
              </span>
            </button>
          ))}
        </div>

        {activeActionRow ? (
          <div className="mt-6 rounded-[8px] border border-black/10 bg-white p-4">
            <p className="text-[11px] text-black/40">선택</p>
            <p className="mt-2 text-xl font-medium">{activeActionRow.detail}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PhoneRecordMock() {
  return (
    <div
      className="introduce-card-lift grid min-h-[430px] place-items-center rounded-[8px] bg-cover bg-center p-8"
      style={{
        backgroundImage: `linear-gradient(rgba(250,250,248,0.7), rgba(250,250,248,0.7)), url("${heroImageUrl}")`,
      }}
    >
      <div className="introduce-phone-float h-[360px] w-[180px] rounded-[32px] border-[7px] border-black bg-white p-4 text-neutral-950 shadow-2xl">
        <div className="mx-auto h-3 w-14 rounded-full bg-black" />
        <p className="mt-7 text-[11px] text-black/40">상담 이력</p>
        <div className="mt-4 grid gap-3">
          {records.map((row) => (
            <div className="rounded-[8px] bg-[#F1F5F9] p-3" key={row.label}>
              <p className="text-[11px] text-black/40">{row.label}</p>
              <p className="mt-1 text-lg font-medium">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarMock() {
  const days = ["월", "화", "수", "목", "금"];
  const [activeDay, setActiveDay] = useState(days[2] ?? "수");

  return (
    <div className="introduce-card-lift min-h-[390px] rounded-[8px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[11px] text-black/40">이번 주</p>
        <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
          12
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {days.map((day, index) => (
          <button
            className={[
              "min-h-[250px] rounded-[8px] border p-3 text-left transition duration-300",
              activeDay === day
                ? "border-black bg-white shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
                : "border-black/10 bg-[#FAFAF8] hover:-translate-y-0.5",
            ].join(" ")}
            key={day}
            onClick={() => setActiveDay(day)}
            type="button"
          >
            <p className="text-xs font-medium">{day}</p>
            <div className="mt-5 grid gap-2">
              {Array.from({
                length: activeDay === day ? 3 : index % 2 === 0 ? 2 : 1,
              }).map((_, itemIndex) => (
                <div
                  className={[
                    "h-10 rounded-[6px]",
                    activeDay === day ? "bg-black" : "bg-black/90",
                  ].join(" ")}
                  key={`${day}-${itemIndex}`}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function useIntroduceMotion() {
  useEffect(() => {
    const root = document.documentElement;
    let animationFrame = 0;

    const updateScrollProgress = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

        root.style.setProperty(
          "--introduce-scroll",
          `${Math.min(100, Math.max(0, progress * 100))}%`
        );
      });
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-introduce-reveal]")
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      revealTargets.forEach((target) => {
        target.dataset.introduceVisible = "true";
      });
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              target.dataset.introduceVisible = "true";
              observer.unobserve(target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
      );

      revealTargets.forEach((target) => observer.observe(target));

      return () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("scroll", updateScrollProgress);
        window.removeEventListener("resize", updateScrollProgress);
        observer.disconnect();
      };
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);
}

function IntroduceMotionStyles() {
  return (
    <style>{`
      html {
        scroll-behavior: smooth;
        scrollbar-width: none;
      }

      body {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none;
      }

      .introduce-scroll-progress {
        width: var(--introduce-scroll, 0%);
        transition: width 120ms linear;
      }

      .introduce-hero-bg,
      .introduce-deal-bg {
        background-image:
          linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 38%, rgba(0,0,0,0.22) 76%),
          var(--introduce-bg);
        background-position: center;
        background-size: 104%;
        animation: introduceBackgroundDrift 22s ease-in-out infinite alternate;
      }

      .introduce-deal-bg {
        background-image:
          linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.3) 100%),
          var(--introduce-bg);
      }

      [data-introduce-reveal] {
        opacity: 0;
        transform: translateY(28px);
        transition:
          opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      [data-introduce-reveal][data-introduce-visible="true"] {
        opacity: 1;
        transform: translateY(0);
      }

      .introduce-card-lift {
        transition:
          transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .introduce-card-lift:hover {
        transform: translateY(-6px);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.24);
      }

      .introduce-phone-float {
        animation: introducePhoneFloat 5.8s ease-in-out infinite;
      }

      @keyframes introduceBackgroundDrift {
        from {
          background-position: center center;
          background-size: 104%;
        }
        to {
          background-position: 58% center;
          background-size: 110%;
        }
      }

      @keyframes introducePhoneFloat {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @media (max-width: 767px) {
        .introduce-hero-bg,
        .introduce-deal-bg {
          background-size: cover;
          animation: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }

        .introduce-scroll-progress,
        .introduce-hero-bg,
        .introduce-deal-bg,
        [data-introduce-reveal],
        .introduce-card-lift,
        .introduce-phone-float {
          animation: none;
          transition: none;
        }

        [data-introduce-reveal] {
          opacity: 1;
          transform: none;
        }
      }
    `}</style>
  );
}

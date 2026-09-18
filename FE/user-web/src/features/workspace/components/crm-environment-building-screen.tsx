type CrmEnvironmentBuildingScreenProps = {
  readonly errorMessage?: string | null;
  readonly htmlLang: string;
  readonly progress: number;
  readonly progressLabel: string;
  readonly title: string;
};

// 기능 : CRM 환경을 준비하는 전체 화면 진행률 UI를 렌더링합니다.
export function CrmEnvironmentBuildingScreen({
  errorMessage = null,
  htmlLang,
  progress,
  progressLabel,
  title,
}: CrmEnvironmentBuildingScreenProps) {
  return (
    <main
      className="min-h-screen overflow-x-hidden bg-white text-[#111111]"
      lang={htmlLang}
    >
      <section className="flex min-h-screen w-full items-center justify-center px-5">
        <div className="w-full max-w-[360px] text-center">
          <h1 className="text-[24px] font-semibold leading-[1.25] tracking-normal text-[#111111]">
            {title}
          </h1>
          <div
            aria-label={progressLabel}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="mt-7 h-2 overflow-hidden rounded-full bg-[#EEEDEA]"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#111111] transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p
            aria-live="polite"
            className="mt-3 text-[13px] font-medium text-[#787774]"
          >
            {progress}%
          </p>
          {errorMessage ? (
            <p className="mt-4 rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

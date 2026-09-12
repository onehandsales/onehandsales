type OneHandLogoMarkProps = {
  readonly className?: string;
};

// 기능 : OneHandLogoMark 컴포넌트를 렌더링합니다.
export function OneHandLogoMark({ className }: OneHandLogoMarkProps) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={["block select-none object-contain", className]
        .filter(Boolean)
        .join(" ")}
      draggable={false}
      src="/brand/logo-mark.svg"
    />
  );
}

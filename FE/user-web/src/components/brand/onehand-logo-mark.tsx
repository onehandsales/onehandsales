type OneHandLogoMarkProps = {
  readonly className?: string;
};

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

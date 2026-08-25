type OnehandLogoMarkProps = {
  readonly className?: string;
};

export function OnehandLogoMark({ className }: OnehandLogoMarkProps) {
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

export function RISymbolLogo({
  size = "lg",
  className = "",
  alt = "Response Integrity symbol logo",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}) {
  const sizeMap = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 72,
  };

  return (
    <img
      src="/ri-symbol-logo.svg"
      alt={alt}
      style={{ height: sizeMap[size], width: "auto" }}
      className={`block shrink-0 ${className}`.trim()}
      loading="eager"
      decoding="async"
    />
  );
}

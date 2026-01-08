export function TTLogo({ size = "xl" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  // Responsive font sizes using clamp
  const sizeMap = {
    sm: "clamp(12px, 3vw, 16px)",
    md: "clamp(14px, 3.5vw, 19px)", // slightly smaller than before
    lg: "clamp(20px, 6vw, 32px)",
    xl: "clamp(28px, 8vw, 48px)",
  };
  const text = sizeMap[size];
  return (
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span
        style={{
          fontSize: text,
          fontWeight: 700,
          color: "#1A1A1A",
          letterSpacing: "-0.5px",
          wordBreak: "break-word",
        }}
      >
        TERRITORIAL
      </span>
      <span
        style={{
          fontSize: text,
          fontWeight: 700,
          color: "#E63946",
          letterSpacing: "-0.5px",
          wordBreak: "break-word",
        }}
      >
        TUTORING
      </span>
    </div>
  );
}

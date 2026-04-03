export function TTLogo({ size = "xl" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  // Responsive font sizes using clamp
  const sizeMap = {
    sm: "clamp(10px, 2.2vw, 12px)",
    md: "clamp(12px, 2.8vw, 14px)",
    lg: "clamp(14px, 3.2vw, 16px)",
    xl: "clamp(24px, 7vw, 40px)",
  };
  const text = sizeMap[size];

  return (
    <div
      style={{
        display: "inline-block",
        lineHeight: 1.05,
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont',
        position: "relative",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            fontSize: text,
            fontWeight: 600,
            color: "#222",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          THE
        </span>
        <span
          style={{
            fontSize: text,
            fontWeight: 700,
            color: "#E63946",
            letterSpacing: "normal",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          RESPONSE
        </span>
        <span
          style={{
            fontSize: text,
            fontWeight: 600,
            color: "#222",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          HUB
        </span>
      </div>
    </div>
  );
}

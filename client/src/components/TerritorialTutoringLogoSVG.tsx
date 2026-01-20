export function TerritorialTutoringLogoSVG({ width = 200 }: { width?: number }) {
  // Calculate height proportionally (assuming roughly 2:1 aspect ratio for stacked text)
  const height = width * 0.5;
  const fontSize = width / 12; // Adjust font size relative to width
  
  return (
    <div
      style={{
        display: "inline-block",
        lineHeight: 1,
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont',
        position: "relative",
        width: `${width}px`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}>
        <span
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600, // Inter SemiBold
            color: "#222",
            letterSpacing: "0.02em", // +2% tracking
            textTransform: "uppercase",
            wordBreak: "break-word",
          }}
        >
          T
        </span>
        <span
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            color: "#222",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            wordBreak: "break-word",
          }}
        >
          ERRITORIAL
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <span style={{
          fontSize: `${fontSize}px`,
          fontWeight: 700, // Inter Bold
          color: "#E63946",
          letterSpacing: "normal", // 0% tracking
          textTransform: "uppercase",
          marginLeft: `calc(1ch + 0.02em)`, // offset for 'T' and tracking
          wordBreak: "break-word",
        }}>
          TUTORING
        </span>
      </div>
    </div>
  );
}

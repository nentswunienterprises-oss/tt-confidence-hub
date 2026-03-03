export function TTLogo(_a) {
    var _b = _a.size, size = _b === void 0 ? "xl" : _b;
    // Responsive font sizes using clamp
    var sizeMap = {
        sm: "clamp(12px, 3vw, 16px)",
        md: "clamp(14px, 3.5vw, 19px)", // slightly smaller than before
        lg: "clamp(20px, 6vw, 32px)",
        xl: "clamp(28px, 8vw, 48px)",
    };
    var text = sizeMap[size];
    // To align 'TUTORING' under the 'E' in 'TERRITORIAL',
    // we measure the width of 'T' and add a left margin to 'TUTORING'.
    // We'll use a span for the first letter and the rest for the offset.
    return (<div style={{
            display: "inline-block",
            lineHeight: 1,
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont',
            position: "relative",
        }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end" }}>
        <span style={{
            fontSize: text,
            fontWeight: 600, // Inter SemiBold
            color: "#222",
            letterSpacing: "0.02em", // +2% tracking
            textTransform: "uppercase",
            wordBreak: "break-word",
        }}>
          T
        </span>
        <span style={{
            fontSize: text,
            fontWeight: 600,
            color: "#222",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            wordBreak: "break-word",
        }}>
          ERRITORIAL
        </span>
      </div>
      <div style={{
            display: "flex",
            flexDirection: "row",
        }}>
        <span style={{
            fontSize: text,
            fontWeight: 700, // Inter Bold
            color: "#E63946",
            letterSpacing: "normal", // 0% tracking
            textTransform: "uppercase",
            marginLeft: "calc(1ch + 0.02em)", // offset for 'T' and tracking
            wordBreak: "break-word",
        }}>
          TUTORING
        </span>
      </div>
    </div>);
}

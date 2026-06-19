import {
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
} from "react";

type DeepDiveDeterrentProps = {
  children: ReactNode;
};

const BLOCKED_SHORTCUT_KEYS = new Set(["c", "x", "s", "p"]);

export function DeepDiveDeterrent({ children }: DeepDiveDeterrentProps) {
  useEffect(() => {
    const blockEvent = (event: Event) => {
      event.preventDefault();
    };

    const handleCopy = (event: ClipboardEvent) => {
      blockEvent(event);
    };

    const handleContextMenu = (event: MouseEvent) => {
      blockEvent(event);
    };

    const handleDragStart = (event: DragEvent) => {
      blockEvent(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();
      const isShortcut = (event.ctrlKey || event.metaKey) && BLOCKED_SHORTCUT_KEYS.has(pressedKey);
      const isPrintScreen = pressedKey === "printscreen";

      if (!isShortcut && !isPrintScreen) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleReactCopy = (event: ReactClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleReactContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleReactKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const pressedKey = event.key.toLowerCase();
    const isShortcut = (event.ctrlKey || event.metaKey) && BLOCKED_SHORTCUT_KEYS.has(pressedKey);
    const isPrintScreen = pressedKey === "printscreen";

    if (!isShortcut && !isPrintScreen) {
      return;
    }

    event.preventDefault();
  };

  return (
    <div
      className="relative overflow-hidden"
      onContextMenu={handleReactContextMenu}
      onCopy={handleReactCopy}
      onCut={handleReactCopy}
      onKeyDown={handleReactKeyDown}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div className="relative z-0">{children}</div>
    </div>
  );
}

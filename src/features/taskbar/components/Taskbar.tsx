"use client";

import { useState, useRef, useEffect } from "react";
import { useDesktopStore } from "@/features/desktop/store/desktop-store";
import { DESKTOP_ICONS } from "@/features/desktop/data/desktop-items";
import Clock from "./Clock";
import ShutdownDialog from "@/features/desktop/components/ShutdownDialog";
import RunDialog from "@/features/desktop/components/RunDialog";
import BSODScreen from "@/features/desktop/components/BSODScreen";
import DisplayPropertiesDialog from "@/features/desktop/components/DisplayPropertiesDialog";

const FONT: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
};

/** Scales SVG to 16×16 for taskbar/menu use */
function SmallIcon({ svg }: { svg: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        display: "inline-flex",
        width: "16px",
        height: "16px",
        flexShrink: 0,
        imageRendering: "pixelated",
      }}
      className="[&>svg]:w-full [&>svg]:h-full"
    />
  );
}

interface TrayIconProps {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function TrayIcon({ label, children, onClick }: TrayIconProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center", padding: "0 4px", cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span style={{ fontSize: "14px", lineHeight: 1 }}>{children}</span>
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 4px)",
          right: 0,
          background: "#ffffe1",
          border: "1px solid #000",
          padding: "2px 6px",
          ...FONT,
          fontSize: "8px",
          whiteSpace: "nowrap",
          zIndex: 99999,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Menu item types
interface MenuItemBase {
  label: string;
  icon?: string;
  disabled?: boolean;
}
interface MenuItemAction extends MenuItemBase {
  kind: "action";
  action: () => void;
}
interface MenuItemSubmenu extends MenuItemBase {
  kind: "submenu";
  items: StartMenuItem[];
}
interface MenuItemSeparator {
  kind: "separator";
}
type StartMenuItem = MenuItemAction | MenuItemSubmenu | MenuItemSeparator;

interface SubmenuProps {
  items: StartMenuItem[];
  onAction: () => void;
}

function Submenu({ items, onAction }: SubmenuProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  return (
    <div style={{
      position: "absolute",
      left: "100%",
      top: 0,
      zIndex: 99999,
      background: "#c0c0c0",
      border: "2px solid",
      borderColor: "#fff #808080 #808080 #fff",
      minWidth: "180px",
      boxShadow: "2px 2px 0 #000",
    }}>
      {items.map((item, i) => {
        if (item.kind === "separator") {
          return (
            <div key={i} style={{ margin: "2px 4px", borderTop: "1px solid #808080", borderBottom: "1px solid #fff" }} />
          );
        }
        const isHovered = hoveredIdx === i;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 16px 4px 8px",
              background: isHovered ? "#000080" : "transparent",
              color: isHovered ? "#fff" : item.disabled ? "#808080" : "#000",
              cursor: item.disabled ? "default" : "pointer",
              position: "relative",
              ...FONT,
              fontSize: "9px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => {
              if (item.kind === "action" && !item.disabled) {
                item.action();
                onAction();
              }
            }}
          >
            {item.kind === "submenu" && <span style={{ position: "absolute", right: "6px" }}>▶</span>}
            {item.label}
            {item.kind === "submenu" && isHovered && (
              <Submenu items={item.items} onAction={onAction} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Taskbar() {
  const { windows, focusedWindowId, openWindow, toggleWindowFromTaskbar, muted, toggleMute } = useDesktopStore();
  const [startOpen, setStartOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [showShutdown, setShowShutdown] = useState(false);
  const [showRun, setShowRun] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [showDisplayProps, setShowDisplayProps] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const startRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = "portfolio_last_visit";
    const prev = localStorage.getItem(key);
    setLastVisit(prev);
    localStorage.setItem(key, new Date().toISOString());
  }, []);

  // Close start menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
        setHoveredMenu(null);
      }
    };
    if (startOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [startOpen]);

  function formatLastVisit(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  const desktopWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const desktopHeight = typeof window !== "undefined" ? window.innerHeight - 32 : 720;

  const getIconSvg = (id: string) => DESKTOP_ICONS.find((i) => i.id === id)?.icon ?? "";

  const closeMenu = () => {
    setStartOpen(false);
    setHoveredMenu(null);
  };

  const programsSubmenu: StartMenuItem[] = DESKTOP_ICONS.map((icon) => ({
    kind: "action" as const,
    label: icon.label,
    icon: icon.icon,
    action: () => openWindow(icon),
  }));

  const startMenuItems: StartMenuItem[] = [
    {
      kind: "submenu",
      label: "Programs",
      items: programsSubmenu,
    },
    { kind: "separator" },
    {
      kind: "submenu",
      label: "Documents",
      items: [{ kind: "action", label: "(Empty)", disabled: true, action: () => {} }],
    },
    {
      kind: "submenu",
      label: "Settings",
      items: [
        { kind: "action", label: "Control Panel", disabled: true, action: () => {} },
        { kind: "action", label: "Taskbar & Start Menu...", disabled: true, action: () => {} },
      ],
    },
    {
      kind: "submenu",
      label: "Find",
      items: [
        { kind: "action", label: "Files or Folders...", disabled: true, action: () => {} },
        { kind: "action", label: "On the Internet...", disabled: true, action: () => {} },
      ],
    },
    {
      kind: "action",
      label: "Help",
      action: () => {
        const readme = DESKTOP_ICONS.find((i) => i.id === "readme");
        if (readme) openWindow(readme);
      },
    },
    {
      kind: "action",
      label: "Run...",
      action: () => setShowRun(true),
    },
    { kind: "separator" },
    {
      kind: "action",
      label: "Shut Down...",
      action: () => setShowShutdown(true),
    },
  ];

  return (
    <>
      {showShutdown && (
        <ShutdownDialog
          onClose={() => setShowShutdown(false)}
          onBSOD={() => { setShowShutdown(false); setShowBSOD(true); }}
        />
      )}
      {showRun && <RunDialog onClose={() => setShowRun(false)} />}
      {showBSOD && <BSODScreen onDismiss={() => setShowBSOD(false)} />}
      {showDisplayProps && <DisplayPropertiesDialog onClose={() => setShowDisplayProps(false)} />}

      <div className="fixed bottom-0 left-0 right-0 z-[9999]" ref={startRef}>
        {/* ── Start Menu ───────────────────────────────────────── */}
        {startOpen && (
          <div
            className="window"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              width: 220,
              marginBottom: 2,
              display: "flex",
            }}
          >
            {/* Sidebar */}
            <div style={{
              width: 28,
              background: "linear-gradient(to top, #000080, #1a1aff)",
              flexShrink: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: "8px",
            }}>
              <span style={{
                ...FONT,
                fontSize: "11px",
                color: "#fff",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                letterSpacing: "2px",
                userSelect: "none",
              }}>
                <span style={{ color: "#c0c0c0", fontWeight: "bold" }}>Windows</span>
                {" "}
                <span style={{ fontWeight: "normal" }}>98</span>
              </span>
            </div>

            {/* Menu items */}
            <div style={{ flex: 1, padding: "2px 0" }}>
              {startMenuItems.map((item, i) => {
                if (item.kind === "separator") {
                  return (
                    <div key={i} style={{ margin: "2px 4px", borderTop: "1px solid #808080", borderBottom: "1px solid #fff" }} />
                  );
                }
                const key = `${item.label}-${i}`;
                const isHovered = hoveredMenu === key;
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 8px",
                      background: isHovered ? "#000080" : "transparent",
                      color: isHovered ? "#fff" : item.disabled ? "#808080" : "#000",
                      cursor: "pointer",
                      position: "relative",
                      ...FONT,
                      fontSize: "9px",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={() => setHoveredMenu(key)}
                    onMouseLeave={() => setHoveredMenu(null)}
                    onClick={() => {
                      if (item.kind === "action") {
                        item.action();
                        closeMenu();
                      }
                    }}
                  >
                    {item.kind === "submenu" && (
                      <span style={{ position: "absolute", right: "8px" }}>▶</span>
                    )}
                    {item.label}
                    {item.kind === "submenu" && isHovered && (
                      <Submenu items={item.items} onAction={closeMenu} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Taskbar bar ──────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "silver",
          boxShadow: "inset 0 1px #dfdfdf, inset 0 2px #fff",
          padding: "2px",
          height: "32px",
          gap: "2px",
        }}>
          {/* Start Button */}
          <button
            onClick={() => setStartOpen((p) => !p)}
            style={{
              ...FONT,
              fontSize: "10px",
              fontWeight: "bold",
              padding: "2px 8px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "14px" }}>⊞</span> Start
          </button>

          {/* Divider */}
          <div style={{ width: "2px", height: "20px", borderLeft: "1px solid #808080", borderRight: "1px solid #fff", margin: "0 1px" }} />

          {/* Window buttons */}
          {windows.map((w) => {
            const isActive = focusedWindowId === w.id && !w.minimized;
            return (
              <button
                key={w.id}
                onClick={() => toggleWindowFromTaskbar(w.id, desktopWidth, desktopHeight)}
                style={{
                  ...FONT,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "8px",
                  padding: "2px 8px",
                  minWidth: "120px",
                  maxWidth: "160px",
                  height: "24px",
                  textAlign: "left",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  opacity: w.minimized ? 0.7 : 1,
                  boxShadow: isActive
                    ? "inset -1px -1px #dfdfdf, inset 1px 1px #808080, inset -2px -2px #fff, inset 2px 2px #000"
                    : undefined,
                }}
              >
                <SmallIcon svg={getIconSvg(w.id)} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {w.title}
                </span>
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {/* System tray */}
          <div style={{
            display: "flex",
            alignItems: "center",
            boxShadow: "inset -1px -1px #dfdfdf, inset 1px 1px grey",
            padding: "0 4px",
            height: "22px",
            gap: "2px",
          }}>
            {lastVisit && (
              <TrayIcon label={`Last visited: ${formatLastVisit(lastVisit)}`}>👤</TrayIcon>
            )}
            {!lastVisit && (
              <TrayIcon label="Welcome! First visit 🎉">👤</TrayIcon>
            )}
            <TrayIcon label={muted ? "Volume: Muted (click to unmute)" : "Volume: 100% (click to mute)"} onClick={toggleMute}>
              {muted ? "🔇" : "🔊"}
            </TrayIcon>
            <TrayIcon label="Display Properties" onClick={() => setShowDisplayProps(true)}>🖥️</TrayIcon>
            <div style={{
              width: "1px",
              height: "16px",
              borderLeft: "1px solid #808080",
              borderRight: "1px solid #fff",
              margin: "0 2px",
            }} />
            <div style={{ ...FONT, fontSize: "9px", padding: "0 4px" }}>
              <Clock />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

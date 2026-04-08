"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDesktopStore } from "../store/desktop-store";
import { DESKTOP_ICONS } from "../data/desktop-items";

interface Marquee {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const ICON_W = 72;
const ICON_H = 90;
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import Taskbar from "@/features/taskbar/components/Taskbar";
import BootScreen from "./BootScreen";
import NotepadWrapper from "./NotepadWrapper";
import { playStartup, playWindowOpen, playError } from "../utils/sounds";
import ErrorDialog from "./ErrorDialog";
import ReadmeContent from "@/features/portfolio/components/ReadmeContent";
import ProjectsContent from "@/features/portfolio/components/ProjectsContent";
import MailContent from "@/features/portfolio/components/MailContent";
import CVContent from "@/features/portfolio/components/CVContent";
import MyComputerContent from "@/features/portfolio/components/MyComputerContent";
import RecycleBinContent from "@/features/portfolio/components/RecycleBinContent";
import PaintContent from "@/features/portfolio/components/PaintContent";
import IEContent from "@/features/portfolio/components/IEContent";
import CalculatorContent from "@/features/portfolio/components/CalculatorContent";
import TaskManagerContent from "@/features/portfolio/components/TaskManagerContent";
import SolitaireGame from "@/features/games/solitaire/SolitaireGame";
import SnakeGame from "@/features/games/snake/SnakeGame";
import Minesweeper from "@/features/games/minesweeper/Minesweeper";
import Screensaver from "./Screensaver";
import BSODScreen from "./BSODScreen";
import DisplayPropertiesDialog from "./DisplayPropertiesDialog";
import type { ReactNode } from "react";

/** Maps window IDs to their content components */
const WINDOW_CONTENT: Record<string, ReactNode> = {
  readme:      <NotepadWrapper><ReadmeContent /></NotepadWrapper>,
  projects:    <ProjectsContent />,
  mail:        <MailContent />,
  cv:          <NotepadWrapper><CVContent /></NotepadWrapper>,
  snake:       <SnakeGame />,
  minesweeper: <Minesweeper />,
  mycomputer:  <MyComputerContent />,
  recycle:     <RecycleBinContent />,
  paint:       <PaintContent />,
  ie:          <IEContent />,
  calculator:  <CalculatorContent />,
  solitaire:   <SolitaireGame />,
  taskmanager: <TaskManagerContent />,
};

interface ContextMenu {
  x: number;
  y: number;
}

interface IconContextMenu {
  x: number;
  y: number;
  icon: import("@/types").DesktopIconData;
}

const TASKBAR_HEIGHT = 32;

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "KeyB","KeyA",
];

export default function Desktop() {
  const { windows, selectIcon, selectIcons, iconPositions, arrangeIcons, wallpaper, fontScale } = useDesktopStore();
  const [booted, setBooted] = useState(false);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [showDisplayProps, setShowDisplayProps] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [iconContextMenu, setIconContextMenu] = useState<IconContextMenu | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiProgress = useRef<number>(0);
  const IDLE_MS = 120_000;

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setShowScreensaver(true), IDLE_MS);
  }, []);

  useEffect(() => {
    resetIdle();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
    };
  }, [resetIdle]);

  useEffect(() => {
    let progress = 0;
    const handler = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === KONAMI[progress]) {
        progress++;
        if (progress === KONAMI.length) {
          progress = 0;
          setShowBSOD(true);
        }
      } else {
        progress = code === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--content-zoom", String(fontScale));
  }, [fontScale]);

  const desktopRef = useRef<HTMLDivElement>(null);
  const suppressNextClick = useRef(false);
  const handleBootComplete = useCallback(() => {
    setBooted(true);
    playStartup();
  }, []);

  const desktopWidth = desktopRef.current?.offsetWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
  const desktopHeight = desktopRef.current?.offsetHeight ?? (typeof window !== "undefined" ? window.innerHeight - TASKBAR_HEIGHT : 720);

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (suppressNextClick.current) {
        suppressNextClick.current = false;
        return;
      }
      selectIcon(null);
      setContextMenu(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.target !== e.currentTarget) return; // only on bare desktop

    const rect = desktopRef.current?.getBoundingClientRect();
    const offsetX = rect?.left ?? 0;
    const offsetY = rect?.top ?? 0;
    const startX = e.clientX - offsetX;
    const startY = e.clientY - offsetY;

    selectIcons([]);
    setMarquee({ startX, startY, endX: startX, endY: startY });

    let hadMovement = false;

    const onMove = (moveE: MouseEvent) => {
      const endX = moveE.clientX - offsetX;
      const endY = moveE.clientY - offsetY;
      if (Math.abs(endX - startX) + Math.abs(endY - startY) > 4) {
        hadMovement = true;
      }
      setMarquee({ startX, startY, endX, endY });

      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const hit = DESKTOP_ICONS
        .filter((icon) => {
          const pos = iconPositions[icon.id] ?? { top: 20, left: 20 };
          return (
            pos.left < maxX &&
            pos.left + ICON_W > minX &&
            pos.top < maxY &&
            pos.top + ICON_H > minY
          );
        })
        .map((icon) => icon.id);

      selectIcons(hit);
    };

    const onUp = () => {
      setMarquee(null);
      if (hadMovement) suppressNextClick.current = true;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const closeContextMenu = () => setContextMenu(null);
  const closeIconContextMenu = () => setIconContextMenu(null);

  const handleIconContextMenu = (e: React.MouseEvent, icon: import("@/types").DesktopIconData) => {
    setContextMenu(null);
    setIconContextMenu({ x: e.clientX, y: e.clientY, icon });
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={
        wallpaper.type === "image"
          ? { backgroundImage: `url(${wallpaper.value})`, backgroundSize: "cover", backgroundPosition: "center" }
          : wallpaper.type === "gradient"
          ? { background: wallpaper.value }
          : { backgroundColor: wallpaper.value }
      }
      onClick={() => { setContextMenu(null); setIconContextMenu(null); }}
    >
      {!booted && <BootScreen onComplete={handleBootComplete} />}

      {/* Window area — stops above the taskbar */}
      <div
        id="desktop-area"
        ref={desktopRef}
        className="absolute top-0 left-0 right-0"
        style={{ bottom: TASKBAR_HEIGHT }}
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleDesktopMouseDown}
      >
        {/* Desktop Icons */}
        {DESKTOP_ICONS.map((icon) => (
          <DesktopIcon key={icon.id} icon={icon} onIconContextMenu={handleIconContextMenu} />
        ))}

        {/* Open Windows */}
        {windows.map((w) => (
          <Window
            key={w.id}
            windowData={w}
            desktopWidth={desktopWidth}
            desktopHeight={desktopHeight}
          >
            {WINDOW_CONTENT[w.id]}
          </Window>
        ))}

        {/* Marquee selection rectangle */}
        {marquee && (
          <div
            style={{
              position: "absolute",
              left: Math.min(marquee.startX, marquee.endX),
              top: Math.min(marquee.startY, marquee.endY),
              width: Math.abs(marquee.endX - marquee.startX),
              height: Math.abs(marquee.endY - marquee.startY),
              border: "1px dotted #fff",
              backgroundColor: "rgba(0, 0, 128, 0.25)",
              pointerEvents: "none",
              zIndex: 8000,
            }}
          />
        )}

        {/* Right-click context menu */}
        {contextMenu && (
          <div
            className="window"
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              width: 180,
              zIndex: 9998,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="window-body" style={{ padding: 0, margin: 0 }}>
              {[
                { label: "Arrange Icons", action: () => arrangeIcons(desktopHeight) },
                { label: "Refresh", action: () => window.location.reload() },
                null,
                { label: "New", hasSubmenu: true },
                null,
                { label: "Properties", action: () => setShowDisplayProps(true) },
              ].map((item, i) =>
                item === null ? (
                  <div
                    key={i}
                    style={{ margin: "2px 4px", borderTop: "1px solid #808080", borderBottom: "1px solid #fff" }}
                  />
                ) : (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.action) item.action();
                      closeContextMenu();
                    }}
                    disabled={item.disabled}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "4px 12px",
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "8px",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      color: item.disabled ? "#808080" : "#000",
                      cursor: item.disabled ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!item.disabled) {
                        e.currentTarget.style.background = "#000080";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = item.disabled ? "#808080" : "#000";
                    }}
                  >
                    <span>{item.label}</span>
                    {item.hasSubmenu && <span>▶</span>}
                  </button>
                )
              )}
            </div>
          </div>
        )}
        {/* Icon right-click context menu */}
        {iconContextMenu && (
          <div
            className="window"
            style={{
              position: "fixed",
              top: iconContextMenu.y,
              left: iconContextMenu.x,
              width: 160,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="window-body" style={{ padding: 0, margin: 0 }}>
              {[
                {
                  label: "Open",
                  action: () => {
                    const { openWindow } = useDesktopStore.getState();
                    playWindowOpen();
                    openWindow(iconContextMenu.icon);
                  },
                },
                null,
                {
                  label: "Rename",
                  action: () => {
                    playError();
                    setErrorDialog("Cannot rename system file.\n\nAccess is denied.");
                  },
                },
                {
                  label: "Delete",
                  action: () => {
                    playError();
                    setErrorDialog(`Cannot delete '${iconContextMenu?.icon.label}'.\n\nAccess is denied.`);
                  },
                },
                null,
                { label: "Properties", disabled: true },
              ].map((item, i) =>
                item === null ? (
                  <div
                    key={i}
                    style={{ margin: "2px 4px", borderTop: "1px solid #808080", borderBottom: "1px solid #fff" }}
                  />
                ) : (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.action) item.action();
                      closeIconContextMenu();
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "4px 12px",
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: "8px",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      color: item.disabled ? "#808080" : "#000",
                      cursor: item.disabled ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!item.disabled) {
                        e.currentTarget.style.background = "#000080";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = item.disabled ? "#808080" : "#000";
                    }}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Display Properties dialog */}
      {showDisplayProps && <DisplayPropertiesDialog onClose={() => setShowDisplayProps(false)} />}

      {/* Konami BSOD */}
      {showBSOD && <BSODScreen onDismiss={() => setShowBSOD(false)} />}

      {/* Screensaver */}
      {showScreensaver && booted && (
        <Screensaver onDismiss={() => { setShowScreensaver(false); resetIdle(); }} />
      )}

      {/* Taskbar — fixed at bottom, always on top */}
      <Taskbar />

      {/* Error dialog */}
      {errorDialog && (
        <ErrorDialog message={errorDialog} onClose={() => setErrorDialog(null)} />
      )}
    </div>
  );
}

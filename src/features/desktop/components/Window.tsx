"use client";

import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { useDesktopStore } from "../store/desktop-store";
import { playWindowClose } from "../utils/sounds";
import type { WindowInstance } from "@/types";

interface WindowProps {
  windowData: WindowInstance;
  children: React.ReactNode;
  desktopWidth: number;
  desktopHeight: number;
}

export default function Window({
  windowData,
  children,
  desktopWidth,
  desktopHeight,
}: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
    focusedWindowId,
  } = useDesktopStore();

  const lastClickTime = useRef(0);
  const isActive = focusedWindowId === windowData.id;
  const [minimizing, setMinimizing] = useState(false);
  const minimizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (minimizeTimer.current) clearTimeout(minimizeTimer.current); }, []);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimizing(true);
    minimizeTimer.current = setTimeout(() => {
      setMinimizing(false);
      minimizeWindow(windowData.id);
    }, 220);
  };

  // Alt+F4 closes the focused window
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "F4" && isActive) {
        e.preventDefault();
        closeWindow(windowData.id);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, closeWindow, windowData.id]);

  if (windowData.minimized) return null;

  const handleTitleBarClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 400) {
      // Double-click: toggle maximize/restore
      if (windowData.maximized) {
        restoreWindow(windowData.id);
      } else {
        maximizeWindow(windowData.id, desktopWidth, desktopHeight);
      }
    }
    lastClickTime.current = now;
  };

  const rndPosition = windowData.maximized
    ? { x: 0, y: 0 }
    : windowData.position;

  const rndSize = windowData.maximized
    ? { width: desktopWidth, height: desktopHeight }
    : windowData.size;

  return (
    <Rnd
      position={rndPosition}
      size={rndSize}
      style={{ zIndex: windowData.zIndex }}
      dragHandleClassName="title-bar"
      bounds="parent"
      minWidth={200}
      minHeight={150}
      disableDragging={windowData.maximized}
      enableResizing={!windowData.maximized}
      onMouseDown={() => focusWindow(windowData.id)}
      onDragStop={(_e, d) => {
        updateWindowPosition(windowData.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        updateWindowSize(
          windowData.id,
          { width: ref.offsetWidth, height: ref.offsetHeight },
          position
        );
      }}
    >
      <div
        className={`window${minimizing ? " win98-minimizing" : ""}`}
        style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div className="title-bar" onClick={handleTitleBarClick}>
          <div className="title-bar-text">{windowData.title}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={handleMinimize} />
            <button
              aria-label={windowData.maximized ? "Restore" : "Maximize"}
              onClick={(e) => {
                e.stopPropagation();
                if (windowData.maximized) {
                  restoreWindow(windowData.id);
                } else {
                  maximizeWindow(windowData.id, desktopWidth, desktopHeight);
                }
              }}
            />
            <button
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                playWindowClose();
                closeWindow(windowData.id);
              }}
            />
          </div>
        </div>
        <div className="window-body" style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </Rnd>
  );
}

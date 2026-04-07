"use client";

import { useRef } from "react";
import { useDesktopStore } from "../store/desktop-store";
import type { DesktopIconData, IconPosition } from "@/types";

interface DesktopIconProps {
  icon: DesktopIconData;
}

export default function DesktopIcon({ icon }: DesktopIconProps) {
  const {
    openWindow,
    selectIcon,
    moveMultipleIcons,
    dropIcons,
    selectedIcons,
    iconPositions,
  } = useDesktopStore();

  const position = iconPositions[icon.id] ?? { top: 20, left: 20 };
  const isSelected = selectedIcons.includes(icon.id);
  const lastClickTime = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const wasSelected = selectedIcons.includes(icon.id);

    // If not part of current selection, select only this icon
    if (!wasSelected) {
      selectIcon(icon.id);
    }

    // Snapshot positions of all icons that will be dragged
    const dragIds = wasSelected ? [...selectedIcons] : [icon.id];
    const startPositions: Record<string, IconPosition> = {};
    dragIds.forEach((id) => {
      startPositions[id] = { ...(iconPositions[id] ?? { top: 20, left: 20 }) };
    });

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    let hasDragged = false;

    const onMove = (moveE: MouseEvent) => {
      const dx = moveE.clientX - startMouseX;
      const dy = moveE.clientY - startMouseY;

      if (!hasDragged && Math.abs(dx) + Math.abs(dy) > 4) {
        hasDragged = true;
      }

      if (hasDragged) {
        const updates: Record<string, IconPosition> = {};
        dragIds.forEach((id) => {
          updates[id] = {
            top: Math.max(0, startPositions[id].top + dy),
            left: Math.max(0, startPositions[id].left + dx),
          };
        });
        moveMultipleIcons(updates);
      }
    };

    const onUp = () => {
      if (hasDragged) {
        dropIcons(dragIds);
      } else {
        const now = Date.now();
        if (now - lastClickTime.current < 400) {
          // Double-click → open
          openWindow(icon);
          selectIcon(null);
        } else if (wasSelected && selectedIcons.length > 1) {
          // Single click on multi-selected icon → narrow to just this one
          selectIcon(icon.id);
        }
        lastClickTime.current = now;
      }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="absolute flex flex-col items-center gap-1 select-none w-[72px]"
      style={{ top: position.top, left: position.left, cursor: "default" }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          outline: isSelected ? "1px dotted #fff" : "none",
          outlineOffset: "2px",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: icon.icon }}
          style={{
            imageRendering: "pixelated",
            filter: isSelected
              ? "brightness(0.6) sepia(1) hue-rotate(180deg) saturate(3)"
              : "none",
          }}
        />
      </div>

      <span
        className="text-center break-words leading-tight w-full px-1"
        style={{
          fontSize: "8px",
          fontFamily: "'Press Start 2P', cursive",
          color: "#fff",
          background: isSelected ? "#000080" : "transparent",
          textShadow: isSelected
            ? "none"
            : "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
          padding: isSelected ? "1px 3px" : "0",
        }}
      >
        {icon.label}
      </span>
    </div>
  );
}

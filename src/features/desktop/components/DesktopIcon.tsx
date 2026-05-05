"use client";

import { useRef } from "react";
import { useDesktopStore } from "../store/desktop-store";
import { playWindowOpen } from "../utils/sounds";
import type { DesktopIconData, IconPosition } from "@/types";

interface DesktopIconProps {
  icon: DesktopIconData;
  onIconContextMenu: (e: React.MouseEvent, icon: DesktopIconData) => void;
}

export default function DesktopIcon({ icon, onIconContextMenu }: DesktopIconProps) {
  const {
    openWindow,
    selectIcon,
    moveMultipleIcons,
    dropIcons,
    selectedIcons,
    iconPositions,
    recycleBinFull,
  } = useDesktopStore();

  const position = iconPositions[icon.id] ?? { top: 20, left: 20 };
  const isSelected = selectedIcons.includes(icon.id);
  const lastClickTime = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

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
    let rafId: number | null = null;
    let lastMx = e.clientX;
    let lastMy = e.clientY;

    // Measure desktop bounds once at drag start
    const desktopEl = document.getElementById("desktop-area");
    const maxLeft = (desktopEl?.offsetWidth ?? window.innerWidth) - 72;
    const maxTop = (desktopEl?.offsetHeight ?? window.innerHeight - 32) - 90;

    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    const onMove = (moveE: MouseEvent) => {
      lastMx = moveE.clientX;
      lastMy = moveE.clientY;

      const dx = lastMx - startMouseX;
      const dy = lastMy - startMouseY;
      if (!hasDragged && Math.abs(dx) + Math.abs(dy) > 4) hasDragged = true;
      if (!hasDragged || rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const fdx = lastMx - startMouseX;
        const fdy = lastMy - startMouseY;
        const updates: Record<string, IconPosition> = {};
        dragIds.forEach((id) => {
          updates[id] = {
            top: clamp(startPositions[id].top + fdy, 0, maxTop),
            left: clamp(startPositions[id].left + fdx, 0, maxLeft),
          };
        });
        moveMultipleIcons(updates);
      });
    };

    const onUp = (upE: PointerEvent) => {
      el.releasePointerCapture(upE.pointerId);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("mousemove", onMove);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      if (hasDragged) {
        const fdx = lastMx - startMouseX;
        const fdy = lastMy - startMouseY;
        const final: Record<string, IconPosition> = {};
        dragIds.forEach((id) => {
          final[id] = {
            top: clamp(startPositions[id].top + fdy, 0, maxTop),
            left: clamp(startPositions[id].left + fdx, 0, maxLeft),
          };
        });
        moveMultipleIcons(final);
        dropIcons(dragIds, maxTop, maxLeft);
      } else {
        const now = Date.now();
        if (now - lastClickTime.current < 400) {
          playWindowOpen();
          window.umami?.track("open_app", { name: icon.id });
          openWindow(icon);
          selectIcon(null);
        } else if (wasSelected && selectedIcons.length > 1) {
          selectIcon(icon.id);
        }
        lastClickTime.current = now;
      }
    };

    const onCancel = () => {
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("mousemove", onMove);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      if (hasDragged) dropIcons(dragIds, maxTop, maxLeft);
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
  };

  return (
    <div
      className="absolute flex flex-col items-center gap-1 select-none w-[72px]"
      style={{ top: position.top, left: position.left, cursor: "default" }}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        selectIcon(icon.id);
        onIconContextMenu(e, icon);
      }}
    >
      <div
        style={{
          outline: isSelected ? "1px dotted #fff" : "none",
          outlineOffset: "2px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            icon.photoIcon
              ? icon.photoIcon
              : `data:image/svg+xml;base64,${btoa((icon.iconFull && recycleBinFull) ? icon.iconFull : icon.icon)}`
          }
          width={48}
          height={48}
          alt={icon.label}
          draggable="false"
          style={{
            imageRendering: icon.photoIcon ? "auto" : "pixelated",
            objectFit: "cover",
            borderRadius: icon.photoIcon ? "4px" : "0",
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

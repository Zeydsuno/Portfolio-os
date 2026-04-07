"use client";

import { useDesktopStore } from "../store/desktop-store";
import type { DesktopIconData, IconPosition } from "@/types";

interface DesktopIconProps {
  icon: DesktopIconData;
  position: IconPosition;
}

export default function DesktopIcon({ icon, position }: DesktopIconProps) {
  const openWindow = useDesktopStore((s) => s.openWindow);

  return (
    <div
      className="absolute flex flex-col items-center gap-1 cursor-pointer select-none w-[80px]"
      style={{ top: position.top, left: position.left }}
      onDoubleClick={() => openWindow(icon)}
    >
      <div
        dangerouslySetInnerHTML={{ __html: icon.icon }}
        style={{ imageRendering: "pixelated" }}
      />
      <span
        className="text-white text-center break-words leading-tight"
        style={{
          fontSize: "8px",
          textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
        }}
      >
        {icon.label}
      </span>
    </div>
  );
}

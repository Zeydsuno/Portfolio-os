"use client";

import { useDesktopStore } from "../store/desktop-store";
import { DESKTOP_ICONS, ICON_POSITIONS } from "../data/desktop-items";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import Taskbar from "@/features/taskbar/components/Taskbar";
import ReadmeContent from "@/features/portfolio/components/ReadmeContent";
import ProjectsContent from "@/features/portfolio/components/ProjectsContent";
import MailContent from "@/features/portfolio/components/MailContent";
import SnakeGame from "@/features/games/snake/SnakeGame";
import Minesweeper from "@/features/games/minesweeper/Minesweeper";
import type { ReactNode } from "react";

/** Maps window IDs to their content components */
const WINDOW_CONTENT: Record<string, ReactNode> = {
  readme: <ReadmeContent />,
  projects: <ProjectsContent />,
  mail: <MailContent />,
  snake: <SnakeGame />,
  minesweeper: <Minesweeper />,
};

const TASKBAR_HEIGHT = 32;

export default function Desktop() {
  const windows = useDesktopStore((s) => s.windows);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "#008080" }}
    >
      {/* Window area — stops above the taskbar */}
      <div
        id="desktop-area"
        className="absolute top-0 left-0 right-0"
        style={{ bottom: TASKBAR_HEIGHT }}
      >
        {/* Desktop Icons */}
        {DESKTOP_ICONS.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            position={ICON_POSITIONS[icon.id]}
          />
        ))}

        {/* Open Windows — bounded to #desktop-area so they can't overlap taskbar */}
        {windows.map((w) => (
          <Window key={w.id} windowData={w}>
            {WINDOW_CONTENT[w.id]}
          </Window>
        ))}
      </div>

      {/* Taskbar — fixed at bottom, always on top */}
      <Taskbar />
    </div>
  );
}

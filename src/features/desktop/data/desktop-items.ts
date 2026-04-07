import type { DesktopIconData, IconPosition } from "@/types";

// 16x16 pixel art SVG icons as inline strings
const ICON_NOTEPAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="2" y="1" width="12" height="14" fill="#fff" stroke="#000" stroke-width="1"/>
  <rect x="2" y="1" width="12" height="3" fill="#000080"/>
  <line x1="4" y1="6" x2="12" y2="6" stroke="#000" stroke-width="1"/>
  <line x1="4" y1="8" x2="12" y2="8" stroke="#000" stroke-width="1"/>
  <line x1="4" y1="10" x2="10" y2="10" stroke="#000" stroke-width="1"/>
  <line x1="4" y1="12" x2="8" y2="12" stroke="#000" stroke-width="1"/>
</svg>`;

const ICON_COMPUTER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="1" y="1" width="14" height="10" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <rect x="2" y="2" width="12" height="8" fill="#000080"/>
  <rect x="3" y="3" width="10" height="6" fill="#008080"/>
  <rect x="5" y="12" width="6" height="1" fill="#c0c0c0" stroke="#000" stroke-width="0.5"/>
  <rect x="3" y="13" width="10" height="1" fill="#c0c0c0" stroke="#000" stroke-width="0.5"/>
</svg>`;

const ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="1" y="3" width="14" height="10" fill="#fff" stroke="#000" stroke-width="1"/>
  <polyline points="1,3 8,9 15,3" fill="none" stroke="#000" stroke-width="1"/>
  <line x1="1" y1="13" x2="6" y2="8" stroke="#000" stroke-width="0.5"/>
  <line x1="15" y1="13" x2="10" y2="8" stroke="#000" stroke-width="0.5"/>
</svg>`;

const ICON_SNAKE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="1" y="7" width="3" height="3" fill="#00aa00"/>
  <rect x="4" y="7" width="3" height="3" fill="#00cc00"/>
  <rect x="7" y="7" width="3" height="3" fill="#00aa00"/>
  <rect x="7" y="4" width="3" height="3" fill="#00cc00"/>
  <rect x="10" y="4" width="3" height="3" fill="#00aa00"/>
  <rect x="13" y="4" width="2" height="3" fill="#00cc00"/>
  <rect x="14" y="5" width="1" height="1" fill="#ff0000"/>
  <rect x="2" y="12" width="2" height="2" fill="#ff0000"/>
</svg>`;

const ICON_MINE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <circle cx="8" cy="8" r="4" fill="#333"/>
  <line x1="8" y1="2" x2="8" y2="14" stroke="#333" stroke-width="1.5"/>
  <line x1="2" y1="8" x2="14" y2="8" stroke="#333" stroke-width="1.5"/>
  <line x1="4" y1="4" x2="12" y2="12" stroke="#333" stroke-width="1"/>
  <line x1="12" y1="4" x2="4" y2="12" stroke="#333" stroke-width="1"/>
  <rect x="6" y="6" width="2" height="2" fill="#fff"/>
</svg>`;

const ICON_CV = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="2" y="1" width="12" height="14" fill="#fff" stroke="#000" stroke-width="1"/>
  <rect x="2" y="1" width="12" height="3" fill="#000080"/>
  <line x1="4" y1="6" x2="12" y2="6" stroke="#000" stroke-width="1"/>
  <line x1="4" y1="8" x2="12" y2="8" stroke="#000" stroke-width="1"/>
  <line x1="4" y1="10" x2="12" y2="10" stroke="#000" stroke-width="1"/>
  <line x1="4" y1="12" x2="8" y2="12" stroke="#000" stroke-width="1"/>
  <rect x="6" y="1" width="4" height="2" fill="#c0c0c0" stroke="#000" stroke-width="0.5"/>
</svg>`;

const ICON_MYCOMPUTER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="1" y="1" width="14" height="10" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <rect x="2" y="2" width="12" height="8" fill="#000080"/>
  <rect x="3" y="3" width="10" height="6" fill="#008080"/>
  <rect x="3" y="3" width="3" height="1" fill="#ffffff" opacity="0.5"/>
  <rect x="5" y="12" width="6" height="1" fill="#c0c0c0" stroke="#000" stroke-width="0.5"/>
  <rect x="3" y="13" width="10" height="1" fill="#c0c0c0" stroke="#000" stroke-width="0.5"/>
</svg>`;

const ICON_RECYCLE_EMPTY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="3" y="4" width="10" height="10" rx="1" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <rect x="5" y="2" width="6" height="2" rx="0.5" fill="#808080" stroke="#000" stroke-width="0.5"/>
  <line x1="1" y1="4" x2="15" y2="4" stroke="#000" stroke-width="1"/>
  <line x1="6" y1="6" x2="6" y2="12" stroke="#808080" stroke-width="1"/>
  <line x1="8" y1="6" x2="8" y2="12" stroke="#808080" stroke-width="1"/>
  <line x1="10" y1="6" x2="10" y2="12" stroke="#808080" stroke-width="1"/>
</svg>`;

const ICON_RECYCLE_FULL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="3" y="4" width="10" height="10" rx="1" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <rect x="5" y="2" width="6" height="2" rx="0.5" fill="#808080" stroke="#000" stroke-width="0.5"/>
  <line x1="1" y1="4" x2="15" y2="4" stroke="#000" stroke-width="1"/>
  <line x1="6" y1="6" x2="6" y2="12" stroke="#808080" stroke-width="1"/>
  <line x1="8" y1="6" x2="8" y2="12" stroke="#808080" stroke-width="1"/>
  <line x1="10" y1="6" x2="10" y2="12" stroke="#808080" stroke-width="1"/>
  <rect x="5" y="5" width="2" height="3" fill="#ffffff" stroke="#808080" stroke-width="0.5" transform="rotate(-15 6 6.5)"/>
  <rect x="9" y="5" width="2" height="3" fill="#ffff80" stroke="#808080" stroke-width="0.5" transform="rotate(10 10 6.5)"/>
</svg>`;

const ICON_PAINT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="48" height="48">
  <rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000" stroke-width="1"/>
  <rect x="1" y="1" width="14" height="3" fill="#000080"/>
  <rect x="2" y="5" width="4" height="9" fill="#ff0000"/>
  <rect x="6" y="5" width="4" height="9" fill="#00ff00"/>
  <rect x="10" y="5" width="4" height="9" fill="#0000ff"/>
  <line x1="5" y1="2" x2="5" y2="4" stroke="#fff" stroke-width="0.5"/>
  <line x1="9" y1="2" x2="9" y2="4" stroke="#fff" stroke-width="0.5"/>
</svg>`;

export const DESKTOP_ICONS: DesktopIconData[] = [
  {
    id: "readme",
    label: "Readme.txt",
    windowTitle: "Readme.txt - Notepad",
    icon: ICON_NOTEPAD,
    defaultWidth: 450,
    defaultHeight: 350,
  },
  {
    id: "projects",
    label: "Projects.exe",
    icon: ICON_COMPUTER,
    defaultWidth: 600,
    defaultHeight: 450,
  },
  {
    id: "mail",
    label: "Mail.bat",
    icon: ICON_MAIL,
    defaultWidth: 400,
    defaultHeight: 300,
  },
  {
    id: "snake",
    label: "Snake.exe",
    icon: ICON_SNAKE,
    defaultWidth: 400,
    defaultHeight: 440,
  },
  {
    id: "minesweeper",
    label: "Minesweeper.exe",
    icon: ICON_MINE,
    defaultWidth: 300,
    defaultHeight: 380,
  },
  {
    id: "cv",
    label: "CV.txt",
    windowTitle: "CV.txt - Notepad",
    icon: ICON_CV,
    defaultWidth: 500,
    defaultHeight: 450,
  },
  {
    id: "mycomputer",
    label: "My Computer",
    icon: ICON_MYCOMPUTER,
    defaultWidth: 420,
    defaultHeight: 340,
  },
  {
    id: "recycle",
    label: "Recycle Bin",
    icon: ICON_RECYCLE_EMPTY,
    iconFull: ICON_RECYCLE_FULL,
    defaultWidth: 380,
    defaultHeight: 300,
  },
  {
    id: "paint",
    label: "Paint.exe",
    windowTitle: "untitled - Paint",
    icon: ICON_PAINT,
    defaultWidth: 640,
    defaultHeight: 520,
  },
];

// Grid: 80px wide × 90px tall per cell — must stay aligned with dropIcons() in the store
export const ICON_POSITIONS: Record<string, IconPosition> = {
  readme:      { top:   0, left:  0 },
  projects:    { top:  90, left:  0 },
  mail:        { top: 180, left:  0 },
  snake:       { top: 270, left:  0 },
  minesweeper: { top: 360, left:  0 },
  cv:          { top: 450, left:  0 },
  mycomputer:  { top:   0, left: 80 },
  recycle:     { top:  90, left: 80 },
  paint:       { top: 180, left: 80 },
};

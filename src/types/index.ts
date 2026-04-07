/** Represents a desktop icon that can be double-clicked to open a window */
export interface DesktopIconData {
  id: string;
  label: string;
  icon: string; // SVG string for the pixel art icon
  defaultWidth: number;
  defaultHeight: number;
}

/** Position of a window on the desktop */
export interface WindowPosition {
  x: number;
  y: number;
}

/** Size of a window */
export interface WindowSize {
  width: number;
  height: number;
}

/** An open window instance on the desktop */
export interface WindowInstance {
  id: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
}

/** Grid position for a desktop icon */
export interface IconPosition {
  top: number;
  left: number;
}

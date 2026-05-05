declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string | number | boolean>) => void;
    };
  }
}

/** Represents a desktop icon that can be double-clicked to open a window */
export interface DesktopIconData {
  id: string;
  label: string;
  /** Title shown in the window title bar. Defaults to label if not set. */
  windowTitle?: string;
  icon: string; // SVG string for the pixel art icon (empty/default state)
  iconFull?: string; // SVG for "full" state (e.g. Recycle Bin)
  photoIcon?: string; // URL to a real image file used instead of the SVG icon
  defaultWidth: number;
  defaultHeight: number;
  /** Icon IDs shown inside this folder window */
  children?: string[];
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

/** Saved window geometry before maximize */
export interface PreMaximizeState {
  position: WindowPosition;
  size: WindowSize;
}

/** An open window instance on the desktop */
export interface WindowInstance {
  id: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  preMaximizeState: PreMaximizeState | null;
}

/** Grid position for a desktop icon */
export interface IconPosition {
  top: number;
  left: number;
}

/** Wallpaper type discriminator */
export type WallpaperType = "color" | "gradient" | "image";

/** A wallpaper preset or custom entry */
export interface WallpaperEntry {
  id: string;
  label: string;
  type: WallpaperType;
  /** CSS color string, CSS gradient string, or image URL */
  value: string;
  /** Thumbnail CSS (gradient or color) for the picker preview */
  thumb: string;
}

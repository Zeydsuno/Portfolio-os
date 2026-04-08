import { create } from "zustand";
import type {
  DesktopIconData,
  WindowInstance,
  WindowPosition,
  WindowSize,
  IconPosition,
  WallpaperEntry,
} from "@/types";
import { DESKTOP_ICONS, ICON_POSITIONS } from "../data/desktop-items";

interface DesktopState {
  windows: WindowInstance[];
  nextZIndex: number;
  focusedWindowId: string | null;
  iconPositions: Record<string, IconPosition>;
  selectedIcons: string[];

  openWindow: (icon: DesktopIconData) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string, desktopWidth: number, desktopHeight: number) => void;
  restoreWindow: (id: string) => void;
  toggleWindowFromTaskbar: (id: string, desktopWidth: number, desktopHeight: number) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize, position: WindowPosition) => void;
  selectIcon: (id: string | null) => void;
  selectIcons: (ids: string[]) => void;
  moveIcon: (id: string, position: IconPosition) => void;
  moveMultipleIcons: (updates: Record<string, IconPosition>) => void;
  dropIcons: (ids: string[], maxTop: number, maxLeft: number) => void;
  arrangeIcons: (desktopHeight: number) => void;
  muted: boolean;
  toggleMute: () => void;
  wallpaper: WallpaperEntry;
  setWallpaper: (wallpaper: WallpaperEntry) => void;
  recycleBinFull: boolean;
  emptyRecycleBin: () => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
}

export const useDesktopStore = create<DesktopState>((set, get) => ({
  windows: [],
  nextZIndex: 1,
  focusedWindowId: null,
  iconPositions: { ...ICON_POSITIONS },
  selectedIcons: [],
  muted: false,
  wallpaper: {
    id: "bliss",
    label: "Bliss",
    type: "gradient",
    value: "linear-gradient(180deg, #1e6bb8 0%, #4399d5 28%, #90c8e8 48%, #7bc840 52%, #4a8a1a 100%)",
    thumb: "linear-gradient(180deg, #1e6bb8 0%, #90c8e8 48%, #7bc840 52%, #4a8a1a 100%)",
  },
  recycleBinFull: false,
  fontScale: 1,

  openWindow: (icon) => {
    const { windows, nextZIndex, focusWindow } = get();
    const existing = windows.find((w) => w.id === icon.id);

    if (existing) {
      // If minimized, restore it; otherwise just focus
      if (existing.minimized) {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === icon.id ? { ...w, minimized: false, zIndex: state.nextZIndex } : w
          ),
          nextZIndex: state.nextZIndex + 1,
          focusedWindowId: icon.id,
        }));
      } else {
        focusWindow(icon.id);
      }
      return;
    }

    const offset = windows.filter((w) => !w.minimized).length * 30;

    const newWindow: WindowInstance = {
      id: icon.id,
      title: icon.windowTitle ?? icon.label,
      position: { x: 150 + offset, y: 80 + offset },
      size: { width: icon.defaultWidth, height: icon.defaultHeight },
      zIndex: nextZIndex,
      minimized: false,
      maximized: false,
      preMaximizeState: null,
    };

    set({
      windows: [...windows, newWindow],
      nextZIndex: nextZIndex + 1,
      focusedWindowId: icon.id,
    });
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
      recycleBinFull: true,
    }));
  },

  focusWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.nextZIndex } : w
      ),
      nextZIndex: state.nextZIndex + 1,
      focusedWindowId: id,
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    }));
  },

  maximizeWindow: (id, desktopWidth, desktopHeight) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          maximized: true,
          preMaximizeState: { position: w.position, size: w.size },
          position: { x: 0, y: 0 },
          size: { width: desktopWidth, height: desktopHeight },
          zIndex: state.nextZIndex,
        };
      }),
      nextZIndex: state.nextZIndex + 1,
      focusedWindowId: id,
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.minimized) {
          return { ...w, minimized: false, zIndex: state.nextZIndex };
        }
        if (w.maximized && w.preMaximizeState) {
          return {
            ...w,
            maximized: false,
            position: w.preMaximizeState.position,
            size: w.preMaximizeState.size,
            preMaximizeState: null,
            zIndex: state.nextZIndex,
          };
        }
        return w;
      }),
      nextZIndex: state.nextZIndex + 1,
      focusedWindowId: id,
    }));
  },

  toggleWindowFromTaskbar: (id, desktopWidth, desktopHeight) => {
    const { windows, focusedWindowId, minimizeWindow, restoreWindow, focusWindow, maximizeWindow } = get();
    const win = windows.find((w) => w.id === id);
    if (!win) return;

    if (win.minimized) {
      restoreWindow(id);
    } else if (focusedWindowId === id) {
      minimizeWindow(id);
    } else {
      if (win.maximized) {
        maximizeWindow(id, desktopWidth, desktopHeight);
      } else {
        focusWindow(id);
      }
    }
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    }));
  },

  updateWindowSize: (id, size, position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size, position } : w
      ),
    }));
  },

  selectIcon: (id) => {
    set({ selectedIcons: id ? [id] : [] });
  },

  selectIcons: (ids) => {
    set({ selectedIcons: ids });
  },

  moveIcon: (id, position) => {
    set((state) => ({
      iconPositions: { ...state.iconPositions, [id]: position },
    }));
  },

  moveMultipleIcons: (updates) => {
    set((state) => ({
      iconPositions: { ...state.iconPositions, ...updates },
    }));
  },

  dropIcons: (ids, maxTop, maxLeft) => {
    set((state) => {
      const GRID_W = 80;
      const GRID_H = 90;

      const clamp = (val: number, min: number, max: number) =>
        Math.min(Math.max(val, min), max);

      const snap = (pos: IconPosition): IconPosition => ({
        left: clamp(Math.round(pos.left / GRID_W) * GRID_W, 0, Math.floor(maxLeft / GRID_W) * GRID_W),
        top: clamp(Math.round(pos.top / GRID_H) * GRID_H, 0, Math.floor(maxTop / GRID_H) * GRID_H),
      });

      const key = (pos: IconPosition) => `${pos.left}:${pos.top}`;

      // Cells occupied by icons that are NOT being dropped
      const occupied = new Set<string>();
      Object.entries(state.iconPositions).forEach(([id, pos]) => {
        if (!ids.includes(id)) occupied.add(key(snap(pos)));
      });

      const updates: Record<string, IconPosition> = {};
      ids.forEach((id) => {
        const raw = state.iconPositions[id] ?? { top: 0, left: 0 };
        const snapped = snap(raw);

        // Spiral outward to find the nearest free cell
        let final = snapped;
        outer: for (let r = 0; r < 20; r++) {
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              if (r > 0 && Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
              const candidate: IconPosition = {
                left: Math.max(0, snapped.left + dx * GRID_W),
                top: Math.max(0, snapped.top + dy * GRID_H),
              };
              if (!occupied.has(key(candidate))) {
                final = candidate;
                break outer;
              }
            }
          }
        }

        updates[id] = final;
        occupied.add(key(final)); // reserve for the next icon in the batch
      });

      return { iconPositions: { ...state.iconPositions, ...updates } };
    });
  },

  toggleMute: () => set((state) => ({ muted: !state.muted })),
  setWallpaper: (wallpaper) => set({ wallpaper }),
  emptyRecycleBin: () => set({ recycleBinFull: false }),
  setFontScale: (scale) => set({ fontScale: scale }),

  arrangeIcons: (desktopHeight) => {
    const GRID_W = 80;
    const GRID_H = 90;
    const maxRows = Math.max(1, Math.floor(desktopHeight / GRID_H));
    const newPositions: Record<string, IconPosition> = {};
    DESKTOP_ICONS.forEach((icon, i) => {
      const col = Math.floor(i / maxRows);
      const row = i % maxRows;
      newPositions[icon.id] = { top: row * GRID_H, left: col * GRID_W };
    });
    set({ iconPositions: newPositions });
  },
}));

import { create } from "zustand";
import type {
  DesktopIconData,
  WindowInstance,
  WindowPosition,
  WindowSize,
} from "@/types";

/**
 * Z-INDEX STRATEGY:
 * Each window gets a zIndex from a monotonically increasing counter (nextZIndex).
 * When a window is clicked/focused, it receives the current nextZIndex value,
 * then the counter increments. This guarantees:
 * - No two windows share a z-index
 * - The most recently focused window is always visually on top
 * - The taskbar uses z-index 9999 to always remain above all windows
 */

interface DesktopState {
  windows: WindowInstance[];
  nextZIndex: number;
  openWindow: (icon: DesktopIconData) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (
    id: string,
    size: WindowSize,
    position: WindowPosition
  ) => void;
}

export const useDesktopStore = create<DesktopState>((set, get) => ({
  windows: [],
  nextZIndex: 1,

  openWindow: (icon) => {
    const { windows, nextZIndex, focusWindow } = get();
    const existing = windows.find((w) => w.id === icon.id);

    // If window already open, just bring it to front
    if (existing) {
      focusWindow(icon.id);
      return;
    }

    // Offset new windows slightly so they don't stack perfectly
    const offset = windows.length * 30;

    const newWindow: WindowInstance = {
      id: icon.id,
      title: icon.label,
      position: { x: 150 + offset, y: 80 + offset },
      size: { width: icon.defaultWidth, height: icon.defaultHeight },
      zIndex: nextZIndex,
    };

    set({
      windows: [...windows, newWindow],
      nextZIndex: nextZIndex + 1,
    });
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },

  focusWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.nextZIndex } : w
      ),
      nextZIndex: state.nextZIndex + 1,
    }));
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
}));

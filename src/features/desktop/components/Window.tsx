"use client";

import { Rnd } from "react-rnd";
import { useDesktopStore } from "../store/desktop-store";
import type { WindowInstance } from "@/types";

interface WindowProps {
  windowData: WindowInstance;
  children: React.ReactNode;
}

export default function Window({ windowData, children }: WindowProps) {
  const { closeWindow, focusWindow, updateWindowPosition, updateWindowSize } =
    useDesktopStore();

  return (
    <Rnd
      position={windowData.position}
      size={windowData.size}
      style={{ zIndex: windowData.zIndex }}
      dragHandleClassName="title-bar"
      bounds="parent"
      minWidth={200}
      minHeight={150}
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
        className="window"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">{windowData.title}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button
              aria-label="Close"
              onClick={() => closeWindow(windowData.id)}
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

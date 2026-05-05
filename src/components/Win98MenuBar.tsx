"use client";

import { useState } from "react";

export interface Win98MenuItem {
  label: string;
  action?: () => void;
}

interface Win98MenuBarProps {
  menus: Record<string, Win98MenuItem[]>;
  extra?: React.ReactNode;
}

const MENU_FONT: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "9px",
};

export default function Win98MenuBar({ menus, extra }: Win98MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        backgroundColor: "#c0c0c0",
        borderBottom: "1px solid #808080",
        padding: "1px 0",
      }}
      onMouseLeave={() => setOpenMenu(null)}
    >
      {Object.entries(menus).map(([menuName, items]) => (
        <div key={menuName} style={{ position: "relative" }}>
          <button
            style={{
              ...MENU_FONT,
              padding: "2px 6px",
              border: "none",
              background: openMenu === menuName ? "#000080" : "transparent",
              color: openMenu === menuName ? "#fff" : "#000",
              cursor: "default",
            }}
            onMouseEnter={() => { if (openMenu !== null) setOpenMenu(menuName); }}
            onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
          >
            {menuName}
          </button>

          {openMenu === menuName && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 9999,
                backgroundColor: "#c0c0c0",
                border: "2px solid",
                borderColor: "#fff #808080 #808080 #fff",
                minWidth: "150px",
                boxShadow: "2px 2px 0 #000",
              }}
            >
              {items.map((item, i) =>
                item.label === "---" ? (
                  <div
                    key={i}
                    style={{
                      margin: "2px 4px",
                      borderTop: "1px solid #808080",
                      borderBottom: "1px solid #fff",
                    }}
                  />
                ) : (
                  <button
                    key={item.label}
                    onClick={() => { item.action?.(); setOpenMenu(null); }}
                    style={{
                      ...MENU_FONT,
                      display: "block",
                      width: "100%",
                      padding: "3px 20px",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      color: "#000",
                      cursor: "default",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#000080";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#000";
                    }}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {extra && (
        <>
          <div style={{ flex: 1 }} />
          <div style={{ width: 1, background: "#808080", margin: "3px 4px" }} />
          {extra}
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Tool = "pencil" | "eraser" | "line" | "rect" | "ellipse" | "fill";

interface Point { x: number; y: number }

const PALETTE = [
  "#000000", "#808080", "#800000", "#808000",
  "#008000", "#008080", "#000080", "#800080",
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00",
  "#00ff00", "#00ffff", "#0000ff", "#ff00ff",
  "#ff8040", "#804000", "#004080", "#8000ff",
];

const TOOLS: Array<{ id: Tool; label: string; icon: string }> = [
  { id: "pencil",  label: "Pencil",   icon: "✏️" },
  { id: "eraser",  label: "Eraser",   icon: "◻" },
  { id: "fill",    label: "Fill",     icon: "🪣" },
  { id: "line",    label: "Line",     icon: "╱" },
  { id: "rect",    label: "Rectangle",icon: "▭" },
  { id: "ellipse", label: "Ellipse",  icon: "⬭" },
];

const SIZES = [1, 3, 6];

function floodFill(ctx: CanvasRenderingContext2D, sx: number, sy: number, fillHex: string) {
  const canvas = ctx.canvas;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const w = canvas.width;
  const h = canvas.height;

  const hexToRgb = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  const idx = (x: number, y: number) => (y * w + x) * 4;
  const ti = idx(sx, sy);
  const tr = d[ti], tg = d[ti + 1], tb = d[ti + 2];
  const [fr, fg, fb] = hexToRgb(fillHex);

  if (tr === fr && tg === fg && tb === fb) return;

  const same = (i: number) => d[i] === tr && d[i + 1] === tg && d[i + 2] === tb;

  const stack: number[][] = [[sx, sy]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const i = idx(x, y);
    if (!same(i)) continue;
    d[i] = fr; d[i + 1] = fg; d[i + 2] = fb; d[i + 3] = 255;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  ctx.putImageData(img, 0, 0);
}

export default function PaintContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool]   = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [size, setSize]   = useState(2);
  const [canvasSize, setCanvasSize] = useState({ width: 560, height: 400 });

  const drawing    = useRef(false);
  const lastPos    = useRef<Point | null>(null);
  const startPos   = useRef<Point | null>(null);
  const snapshot   = useRef<ImageData | null>(null);
  const savedImageData = useRef<ImageData | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const { width, height } = entries[0].contentRect;
        const newW = Math.max(560, Math.floor(width - 16));
        const newH = Math.max(400, Math.floor(height - 16));
        
        setCanvasSize((prev) => {
          if (prev.width !== newW || prev.height !== newH) {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d")!;
              savedImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            return { width: newW, height: newH };
          }
          return prev;
        });
      }, 150);
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    // Fill white background for new areas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore previous drawing if exists
    if (savedImageData.current) {
      ctx.putImageData(savedImageData.current, 0, 0);
      savedImageData.current = null;
    }
  }, [canvasSize]);

  const getPos = (e: React.MouseEvent): Point => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    drawing.current = true;
    lastPos.current  = pos;
    startPos.current = pos;
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === "fill") {
      floodFill(ctx, pos.x, pos.y, color);
      drawing.current = false;
      return;
    }
    if (tool === "pencil" || tool === "eraser") {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.fill();
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing.current || !lastPos.current || !startPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    if (tool === "pencil" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth   = size;
      ctx.lineCap     = "round";
      ctx.stroke();
      lastPos.current = pos;
    } else {
      ctx.putImageData(snapshot.current!, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = size;
      const { x: sx, y: sy } = startPos.current;
      if (tool === "line") {
        ctx.moveTo(sx, sy); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
      } else {
        const rx = Math.abs(pos.x - sx) / 2;
        const ry = Math.abs(pos.y - sy) / 2;
        ctx.ellipse(sx + (pos.x - sx) / 2, sy + (pos.y - sy) / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [tool, color, size]);

  const handleMouseUp = () => {
    drawing.current  = false;
    lastPos.current  = null;
    startPos.current = null;
    snapshot.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "painting.png";
    a.click();
  };

  const TOOL_BTN: React.CSSProperties = {
    width: 36,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    cursor: "pointer",
    border: "2px solid",
    background: "#c0c0c0",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", userSelect: "none" }}>
      {/* Menu bar */}
      <div style={{ display: "flex", gap: "8px", padding: "3px 6px", borderBottom: "1px solid #808080", fontFamily: "'Press Start 2P', cursive", fontSize: "8px" }}>
        <button onClick={clearCanvas} style={{ fontSize: "8px" }}>New</button>
        <button onClick={saveCanvas}  style={{ fontSize: "8px" }}>Save</button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Tool panel */}
        <div style={{ width: 44, borderRight: "1px solid #808080", padding: "4px 2px", display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
          {TOOLS.map((t) => (
            <div
              key={t.id}
              title={t.label}
              onClick={() => setTool(t.id)}
              style={{
                ...TOOL_BTN,
                borderColor: tool === t.id
                  ? "#808080 #fff #fff #808080"
                  : "#fff #808080 #808080 #fff",
              }}
            >
              {t.icon}
            </div>
          ))}

          <div style={{ borderTop: "1px solid #808080", width: "100%", margin: "4px 0" }} />

          {/* Brush sizes */}
          {SIZES.map((s) => (
            <div
              key={s}
              title={`Size ${s}`}
              onClick={() => setSize(s)}
              style={{
                ...TOOL_BTN,
                borderColor: size === s
                  ? "#808080 #fff #fff #808080"
                  : "#fff #808080 #808080 #fff",
              }}
            >
              <div style={{ width: s * 2, height: s * 2, borderRadius: "50%", backgroundColor: "#000" }} />
            </div>
          ))}
        </div>

        {/* Canvas area */}
        <div ref={containerRef} style={{ flex: 1, overflow: "auto", backgroundColor: "#808080", padding: "8px" }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ display: "block", cursor: tool === "fill" ? "cell" : tool === "eraser" ? "cell" : "crosshair", backgroundColor: "#fff", boxShadow: "2px 2px 0 #000" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Color palette */}
      <div style={{ borderTop: "1px solid #808080", padding: "4px 8px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#c0c0c0" }}>
        {/* Active colors */}
        <div style={{ position: "relative", width: 32, height: 28, marginRight: 4 }}>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 18, height: 18, backgroundColor: "#ffffff", border: "2px solid #808080" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: 18, height: 18, backgroundColor: color, border: "2px solid #000" }} />
        </div>
        <div style={{ width: 1, height: 24, backgroundColor: "#808080", margin: "0 2px" }} />
        {/* Swatches */}
        {PALETTE.map((c) => (
          <div
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 16,
              height: 16,
              backgroundColor: c,
              border: color === c ? "2px solid #fff" : "1px solid #000",
              boxShadow: color === c ? "0 0 0 1px #000" : "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

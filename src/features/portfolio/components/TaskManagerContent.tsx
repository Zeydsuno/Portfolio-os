"use client";

import { useState, useEffect, useRef } from "react";
import { useDesktopStore } from "@/features/desktop/store/desktop-store";

const FONT: React.CSSProperties = { fontFamily: "'Press Start 2P', cursive" };

type Tab = "applications" | "performance";

interface CpuSample {
  value: number;
}

const GRAPH_W = 220;
const GRAPH_H = 80;
const MAX_SAMPLES = 44;

function drawGraph(canvas: HTMLCanvasElement, samples: CpuSample[], color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, GRAPH_W, GRAPH_H);

  // Grid
  ctx.strokeStyle = "#004400";
  ctx.lineWidth = 0.5;
  for (let y = 0; y <= GRAPH_H; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GRAPH_W, y); ctx.stroke();
  }
  for (let x = 0; x <= GRAPH_W; x += 22) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GRAPH_H); ctx.stroke();
  }

  // Line
  if (samples.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  samples.forEach((s, i) => {
    const x = (i / (MAX_SAMPLES - 1)) * GRAPH_W;
    const y = GRAPH_H - (s.value / 100) * GRAPH_H;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

export default function TaskManagerContent() {
  const { windows, closeWindow } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("applications");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [cpuSamples, setCpuSamples] = useState<CpuSample[]>(() =>
    Array.from({ length: MAX_SAMPLES }, () => ({ value: Math.random() * 30 + 5 }))
  );
  const [ramSamples, setRamSamples] = useState<CpuSample[]>(() =>
    Array.from({ length: MAX_SAMPLES }, () => ({ value: Math.random() * 20 + 50 }))
  );

  const cpuRef = useRef<HTMLCanvasElement>(null);
  const ramRef = useRef<HTMLCanvasElement>(null);

  // Fake CPU ticker
  useEffect(() => {
    const id = setInterval(() => {
      setCpuSamples((prev) => {
        const last = prev[prev.length - 1].value;
        const next = Math.max(2, Math.min(98, last + (Math.random() - 0.48) * 18));
        const updated = [...prev.slice(1), { value: next }];
        return updated;
      });
      setRamSamples((prev) => {
        const last = prev[prev.length - 1].value;
        const next = Math.max(40, Math.min(90, last + (Math.random() - 0.5) * 4));
        const updated = [...prev.slice(1), { value: next }];
        return updated;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (cpuRef.current) drawGraph(cpuRef.current, cpuSamples, "#00ff00");
  }, [cpuSamples]);

  useEffect(() => {
    if (ramRef.current) drawGraph(ramRef.current, ramSamples, "#00ff00");
  }, [ramSamples]);

  const cpuCur = Math.round(cpuSamples[cpuSamples.length - 1].value);
  const ramCur = Math.round(ramSamples[ramSamples.length - 1].value);

  const handleEndTask = () => {
    if (selectedId && selectedId !== "taskmanager") {
      closeWindow(selectedId);
      setSelectedId(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#c0c0c0",
        ...FONT,
        fontSize: 8,
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #808080", paddingTop: 4, paddingLeft: 4, gap: 2 }}>
        {(["applications", "performance"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...FONT,
              fontSize: 8,
              padding: "4px 10px",
              background: tab === t ? "#c0c0c0" : "#a0a0a0",
              border: "2px solid",
              borderColor: tab === t ? "#fff #808080 #c0c0c0 #fff" : "#808080 #fff #fff #808080",
              borderBottom: tab === t ? "2px solid #c0c0c0" : "2px solid #808080",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 8 }}>
        {tab === "applications" && (
          <>
            {/* Column header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                background: "#000080",
                color: "#fff",
                padding: "3px 6px",
              }}
            >
              <span>Task</span>
              <span>Status</span>
            </div>

            {/* Window list */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "2px inset",
                borderColor: "#808080 #fff #fff #808080",
                background: "#fff",
              }}
            >
              {windows.filter((w) => w.id !== "taskmanager").length === 0 ? (
                <div style={{ padding: 8, color: "#808080", ...FONT, fontSize: 7 }}>No tasks running</div>
              ) : (
                windows
                  .filter((w) => w.id !== "taskmanager")
                  .map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedId(w.id)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 80px",
                        padding: "4px 6px",
                        cursor: "default",
                        background: selectedId === w.id ? "#000080" : "transparent",
                        color: selectedId === w.id ? "#fff" : "#000",
                        userSelect: "none",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {w.title}
                      </span>
                      <span style={{ color: selectedId === w.id ? "#80ff80" : "#008000" }}>
                        {w.minimized ? "Minimized" : "Running"}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* End Task button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
              <button
                onClick={handleEndTask}
                disabled={!selectedId}
                style={{
                  ...FONT,
                  fontSize: 8,
                  padding: "4px 12px",
                  border: "2px solid",
                  borderColor: "#fff #808080 #808080 #fff",
                  background: "#c0c0c0",
                  cursor: selectedId ? "pointer" : "default",
                  color: selectedId ? "#000" : "#808080",
                }}
              >
                End Task
              </button>
            </div>
          </>
        )}

        {tab === "performance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            {/* CPU */}
            <div>
              <div style={{ marginBottom: 4, color: "#000" }}>CPU Usage — {cpuCur}%</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div
                  style={{
                    background: "#000",
                    border: "2px inset",
                    borderColor: "#808080 #fff #fff #808080",
                    padding: 2,
                  }}
                >
                  <canvas ref={cpuRef} width={GRAPH_W} height={GRAPH_H} />
                </div>
                <div
                  style={{
                    border: "2px inset",
                    borderColor: "#808080 #fff #fff #808080",
                    background: "#000",
                    width: 40,
                    height: GRAPH_H + 4,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 2,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background: "#00ff00",
                      height: `${cpuCur}%`,
                      transition: "height 0.8s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RAM */}
            <div>
              <div style={{ marginBottom: 4, color: "#000" }}>MEM Usage — {ramCur}%</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div
                  style={{
                    background: "#000",
                    border: "2px inset",
                    borderColor: "#808080 #fff #fff #808080",
                    padding: 2,
                  }}
                >
                  <canvas ref={ramRef} width={GRAPH_W} height={GRAPH_H} />
                </div>
                <div
                  style={{
                    border: "2px inset",
                    borderColor: "#808080 #fff #fff #808080",
                    background: "#000",
                    width: 40,
                    height: GRAPH_H + 4,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 2,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background: "#00ff00",
                      height: `${ramCur}%`,
                      transition: "height 0.8s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                border: "2px inset",
                borderColor: "#808080 #fff #fff #808080",
                background: "#fff",
                padding: "6px 8px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px 16px",
                fontSize: 7,
              }}
            >
              <span style={{ color: "#808080" }}>Processes</span>
              <span>{windows.length + 12}</span>
              <span style={{ color: "#808080" }}>CPU Usage</span>
              <span>{cpuCur}%</span>
              <span style={{ color: "#808080" }}>Mem Usage</span>
              <span>{ramCur}%</span>
              <span style={{ color: "#808080" }}>Total RAM</span>
              <span>64 MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          borderTop: "1px solid #808080",
          padding: "3px 8px",
          fontSize: 7,
          color: "#000",
          display: "flex",
          gap: 16,
        }}
      >
        <span>Processes: {windows.length + 12}</span>
        <span>CPU: {cpuCur}%</span>
        <span>Mem: {ramCur}%</span>
      </div>
    </div>
  );
}

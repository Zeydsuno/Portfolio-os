"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDesktopStore } from "@/features/desktop/store/desktop-store";
import { DESKTOP_ICONS, GAME_ICONS } from "@/features/desktop/data/desktop-items";

const ALL_ICONS = [...DESKTOP_ICONS, ...GAME_ICONS];

function SmallIcon({ id }: { id: string }) {
  const svg = ALL_ICONS.find((i) => i.id === id)?.icon ?? "";
  if (!svg) return <span style={{ fontSize: 14 }}>🪟</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`data:image/svg+xml;base64,${btoa(svg)}`} width={16} height={16} alt="" style={{ imageRendering: "pixelated", flexShrink: 0 }} />
  );
}

const FONT: React.CSSProperties = { fontFamily: "var(--win98-font)" };

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

type Tab = "applications" | "processes" | "performance";

const GRAPH_W = 220;
const GRAPH_H = 80;
const MAX_SAMPLES = 44;

const SYSTEM_PROCESSES = [
  { name: "System Idle Process", pid: 0,   cpu: 0,  mem: 16  },
  { name: "System",              pid: 8,   cpu: 0,  mem: 212 },
  { name: "smss.exe",            pid: 148, cpu: 0,  mem: 352 },
  { name: "csrss.exe",           pid: 196, cpu: 0,  mem: 1820 },
  { name: "winlogon.exe",        pid: 216, cpu: 0,  mem: 3048 },
  { name: "services.exe",        pid: 228, cpu: 0,  mem: 2764 },
  { name: "lsass.exe",           pid: 240, cpu: 0,  mem: 1432 },
  { name: "svchost.exe",         pid: 412, cpu: 0,  mem: 2980 },
  { name: "svchost.exe",         pid: 460, cpu: 0,  mem: 1548 },
  { name: "explorer.exe",        pid: 996, cpu: 1,  mem: 14200 },
  { name: "taskmgr.exe",         pid: 1044, cpu: 1, mem: 3840 },
  { name: "msgsrv32.exe",        pid: 1108, cpu: 0, mem: 820 },
];


function drawGraph(canvas: HTMLCanvasElement, samples: number[], color: string) {
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

  if (samples.length < 2) return;

  // Fill
  ctx.beginPath();
  samples.forEach((v, i) => {
    const x = (i / (MAX_SAMPLES - 1)) * GRAPH_W;
    const y = GRAPH_H - (v / 100) * GRAPH_H;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(GRAPH_W, GRAPH_H);
  ctx.lineTo(0, GRAPH_H);
  ctx.closePath();
  ctx.fillStyle = color + "55";
  ctx.fill();

  // Line
  ctx.beginPath();
  samples.forEach((v, i) => {
    const x = (i / (MAX_SAMPLES - 1)) * GRAPH_W;
    const y = GRAPH_H - (v / 100) * GRAPH_H;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function useCpuEstimate() {
  const [cpu, setCpu] = useState(5);
  const lastFrameTime = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const samplesRef = useRef<number[]>([]);

  useEffect(() => {
    lastFrameTime.current = performance.now();
    const measure = (now: number) => {
      const delta = now - lastFrameTime.current;
      lastFrameTime.current = now;
      // 16.7ms = 60fps = 0% load, 100ms+ = heavy load
      const load = Math.min(100, Math.max(0, ((delta - 16.7) / 83.3) * 100));
      samplesRef.current.push(load);
      if (samplesRef.current.length > 5) samplesRef.current.shift();
      const avg = samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length;
      setCpu(Math.round(avg));
      rafRef.current = requestAnimationFrame(measure);
    };
    rafRef.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return cpu;
}

const HAS_MEMORY_API = typeof performance !== "undefined" && "memory" in performance;

function useRamInfo() {
  const [used, setUsed] = useState(() => {
    if (HAS_MEMORY_API) return 0;
    return Math.round((62 + Math.random() * 4) * 0.64);
  });
  const [total, setTotal] = useState(() => HAS_MEMORY_API ? 0 : 64);
  const [percent, setPercent] = useState(() => HAS_MEMORY_API ? 0 : Math.round(62 + Math.random() * 4));

  useEffect(() => {
    if (!HAS_MEMORY_API) return;
    const update = () => {
      const mem = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(mem.jsHeapSizeLimit / 1024 / 1024);
      const pct = Math.round((usedMB / totalMB) * 100);
      setUsed(usedMB);
      setTotal(totalMB);
      setPercent(pct);
    };
    update();
    const id = setInterval(update, 2000);
    return () => clearInterval(id);
  }, []);

  return { used, total, percent };
}

export default function TaskManagerContent() {
  const { windows, closeWindow, focusWindow, restoreWindow } = useDesktopStore();
  const [tab, setTab] = useState<Tab>("applications");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedProc, setSelectedProc] = useState<number | null>(null);

  const cpuLoad = useCpuEstimate();
  const ram = useRamInfo();

  const [cpuHistory, setCpuHistory] = useState<number[]>(() =>
    Array.from({ length: MAX_SAMPLES }, () => 5)
  );
  const [ramHistory, setRamHistory] = useState<number[]>(() =>
    Array.from({ length: MAX_SAMPLES }, () => 62)
  );

  const cpuRef = useRef<HTMLCanvasElement>(null);
  const ramRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCpuHistory((prev) => [...prev.slice(1), cpuLoad]);
      setRamHistory((prev) => [...prev.slice(1), ram.percent]);
    }, 1000);
    return () => clearInterval(id);
  }, [cpuLoad, ram.percent]);

  useEffect(() => {
    if (cpuRef.current) drawGraph(cpuRef.current, cpuHistory, "#00ff00");
  }, [cpuHistory]);

  useEffect(() => {
    if (ramRef.current) drawGraph(ramRef.current, ramHistory, "#00ff00");
  }, [ramHistory]);

  const handleEndTask = useCallback(() => {
    if (!selectedAppId || selectedAppId === "taskmanager") return;
    closeWindow(selectedAppId);
    setSelectedAppId(null);
  }, [selectedAppId, closeWindow]);

  const handleSwitchTo = useCallback((id: string) => {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    if (win.minimized) restoreWindow(id);
    else focusWindow(id);
  }, [windows, focusWindow, restoreWindow]);

  const visibleWindows = windows.filter((w) => w.id !== "taskmanager");
  const totalProcesses = visibleWindows.length + SYSTEM_PROCESSES.length;

  const dynamicProcesses = useMemo(() => visibleWindows.map((w, i) => ({
    name: w.title.toLowerCase().replace(/\s+/g, "") + ".exe",
    pid: 1200 + i * 4,
    cpu: w.id === selectedAppId ? 2 : 0,
    mem: 4096 + (stableHash(w.id) % 2048),
  })), [visibleWindows, selectedAppId]);

  const allProcesses = [...SYSTEM_PROCESSES, ...dynamicProcesses];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#c0c0c0", ...FONT, fontSize: 11 }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #808080", paddingTop: 4, paddingLeft: 4, gap: 2 }}>
        {(["applications", "processes", "performance"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...FONT, fontSize: 11,
              padding: "3px 10px",
              background: tab === t ? "#c0c0c0" : "#a0a0a0",
              border: "2px solid",
              borderColor: tab === t ? "#fff #808080 #c0c0c0 #fff" : "#808080 #fff #fff #808080",
              borderBottom: tab === t ? "2px solid #c0c0c0" : "2px solid #808080",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 8 }}>

        {/* ── Applications ── */}
        {tab === "applications" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", background: "#000080", color: "#fff", padding: "3px 6px", fontSize: 11 }}>
              <span>Task</span>
              <span>Status</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", border: "2px inset", borderColor: "#808080 #fff #fff #808080", background: "#fff" }}>
              {visibleWindows.length === 0 ? (
                <div style={{ padding: 8, color: "#808080" }}>No tasks running</div>
              ) : (
                visibleWindows.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedAppId(w.id)}
                    onDoubleClick={() => handleSwitchTo(w.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 90px",
                      padding: "4px 6px",
                      cursor: "default",
                      background: selectedAppId === w.id ? "#000080" : "transparent",
                      color: selectedAppId === w.id ? "#fff" : "#000",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                      <SmallIcon id={w.id} />
                      {w.title}
                    </span>
                    <span style={{ color: selectedAppId === w.id ? "#80ff80" : w.minimized ? "#808080" : "#008000" }}>
                      {w.minimized ? "Minimized" : "Running"}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
              <button
                onClick={() => selectedAppId && handleSwitchTo(selectedAppId)}
                disabled={!selectedAppId}
                style={{ ...FONT, fontSize: 11, padding: "3px 10px" }}
              >Switch To</button>
              <button
                onClick={handleEndTask}
                disabled={!selectedAppId || selectedAppId === "taskmanager"}
                style={{ ...FONT, fontSize: 11, padding: "3px 10px" }}
              >End Task</button>
            </div>
          </>
        )}

        {/* ── Processes ── */}
        {tab === "processes" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 55px 65px", background: "#000080", color: "#fff", padding: "3px 6px", fontSize: 11 }}>
              <span>Image Name</span>
              <span style={{ textAlign: "right" }}>PID</span>
              <span style={{ textAlign: "right" }}>CPU</span>
              <span style={{ textAlign: "right" }}>Mem</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", border: "2px inset", borderColor: "#808080 #fff #fff #808080", background: "#fff" }}>
              {allProcesses.map((p, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedProc(p.pid)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 50px 55px 65px",
                    padding: "2px 6px",
                    cursor: "default",
                    background: selectedProc === p.pid ? "#000080" : i % 2 === 0 ? "#fff" : "#f0f0f0",
                    color: selectedProc === p.pid ? "#fff" : "#000",
                    userSelect: "none",
                    fontSize: 11,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span style={{ textAlign: "right" }}>{p.pid}</span>
                  <span style={{ textAlign: "right" }}>{p.name === "System Idle Process" ? 100 - cpuLoad : p.cpu}%</span>
                  <span style={{ textAlign: "right" }}>{p.mem.toLocaleString()} K</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
              <button
                disabled={!selectedProc || selectedProc < 1000}
                onClick={() => {
                  const proc = dynamicProcesses.find((p) => p.pid === selectedProc);
                  if (proc) {
                    const win = visibleWindows.find((w) =>
                      w.title.toLowerCase().replace(/\s+/g, "") + ".exe" === proc.name
                    );
                    if (win) { closeWindow(win.id); setSelectedProc(null); }
                  }
                }}
                style={{ ...FONT, fontSize: 11, padding: "3px 10px" }}
              >End Process</button>
            </div>
          </>
        )}

        {/* ── Performance ── */}
        {tab === "performance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4, overflowY: "auto" }}>
            {[
              { label: "CPU Usage", value: cpuLoad, ref: cpuRef },
              { label: "MEM Usage", value: ram.percent, ref: ramRef },
            ].map(({ label, value, ref }) => (
              <div key={label}>
                <div style={{ marginBottom: 4 }}>{label} — <strong>{value}%</strong></div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ background: "#000", border: "2px inset", borderColor: "#808080 #fff #fff #808080", padding: 2 }}>
                    <canvas ref={ref} width={GRAPH_W} height={GRAPH_H} />
                  </div>
                  <div style={{ border: "2px inset", borderColor: "#808080 #fff #fff #808080", background: "#000", width: 40, height: GRAPH_H + 4, display: "flex", alignItems: "flex-end", padding: 2, boxSizing: "border-box" }}>
                    <div style={{ width: "100%", background: "#00ff00", height: `${value}%`, transition: "height 0.8s ease" }} />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ border: "2px inset", borderColor: "#808080 #fff #fff #808080", background: "#fff", padding: "6px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 11 }}>
              <span style={{ color: "#808080" }}>Handles</span><span>{1842 + windows.length * 12}</span>
              <span style={{ color: "#808080" }}>Threads</span><span>{312 + windows.length * 4}</span>
              <span style={{ color: "#808080" }}>Processes</span><span>{totalProcesses}</span>
              <span style={{ color: "#808080" }}>CPU Usage</span><span>{cpuLoad}%</span>
              <span style={{ color: "#808080" }}>Mem Usage</span><span>{ram.used} MB / {ram.total} MB</span>
              <span style={{ color: "#808080" }}>Commit</span><span>{Math.round(ram.used * 1.3)} MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{ borderTop: "1px solid #808080", padding: "3px 8px", fontSize: 11, display: "flex", gap: 16 }}>
        <span>Processes: {totalProcesses}</span>
        <span>CPU: {cpuLoad}%</span>
        <span>Mem: {ram.used > 0 ? `${ram.used} MB` : `${ram.percent}%`}</span>
      </div>
    </div>
  );
}

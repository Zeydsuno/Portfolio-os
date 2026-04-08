"use client";

import { useState, useCallback } from "react";

const FONT: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
};

interface CalcState {
  display: string;
  prevValue: number | null;
  operator: string | null;
  waitingForOperand: boolean;
  justComputed: boolean;
}

const INIT: CalcState = {
  display: "0",
  prevValue: null,
  operator: null,
  waitingForOperand: false,
  justComputed: false,
};

function compute(a: number, op: string, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default:  return b;
  }
}

function fmt(n: number): string {
  if (isNaN(n)) return "Error";
  const s = String(n);
  return s.length > 12 ? n.toPrecision(10) : s;
}

export default function CalculatorContent() {
  const [state, setState] = useState<CalcState>(INIT);

  const pressDigit = useCallback((d: string) => {
    setState((s) => {
      if (s.waitingForOperand || s.justComputed) {
        return { ...s, display: d === "." ? "0." : d, waitingForOperand: false, justComputed: false };
      }
      if (d === "." && s.display.includes(".")) return s;
      const next = s.display === "0" && d !== "." ? d : s.display + d;
      return { ...s, display: next.slice(0, 12) };
    });
  }, []);

  const pressOp = useCallback((op: string) => {
    setState((s) => {
      const cur = parseFloat(s.display);
      if (s.prevValue !== null && s.operator && !s.waitingForOperand) {
        const result = compute(s.prevValue, s.operator, cur);
        return { display: fmt(result), prevValue: result, operator: op, waitingForOperand: true, justComputed: false };
      }
      return { ...s, prevValue: cur, operator: op, waitingForOperand: true, justComputed: false };
    });
  }, []);

  const pressEquals = useCallback(() => {
    setState((s) => {
      const cur = parseFloat(s.display);
      if (s.prevValue !== null && s.operator) {
        const result = compute(s.prevValue, s.operator, cur);
        return { display: fmt(result), prevValue: null, operator: null, waitingForOperand: false, justComputed: true };
      }
      return s;
    });
  }, []);

  const pressClear = useCallback(() => setState(INIT), []);
  const pressCE = useCallback(() => setState((s) => ({ ...s, display: "0", waitingForOperand: false })), []);

  const pressBack = useCallback(() => {
    setState((s) => {
      if (s.waitingForOperand || s.justComputed) return s;
      const next = s.display.slice(0, -1);
      return { ...s, display: next.length === 0 || next === "-" ? "0" : next };
    });
  }, []);

  const pressSqrt = useCallback(() => {
    setState((s) => {
      const v = Math.sqrt(parseFloat(s.display));
      return { ...INIT, display: fmt(v), justComputed: true };
    });
  }, []);

  const pressPercent = useCallback(() => {
    setState((s) => {
      const v = parseFloat(s.display) / 100;
      return { ...INIT, display: fmt(v), justComputed: true };
    });
  }, []);

  const pressInverse = useCallback(() => {
    setState((s) => {
      const v = 1 / parseFloat(s.display);
      return { ...INIT, display: fmt(v), justComputed: true };
    });
  }, []);

  const pressPlusMinus = useCallback(() => {
    setState((s) => {
      const v = parseFloat(s.display) * -1;
      return { ...s, display: fmt(v) };
    });
  }, []);

  const btn = (
    label: string,
    action: () => void,
    opts?: { wide?: boolean; accent?: boolean; op?: boolean }
  ) => (
    <button
      key={label}
      onClick={action}
      style={{
        ...FONT,
        fontSize: 9,
        padding: "5px 2px",
        gridColumn: opts?.wide ? "span 2" : undefined,
        background: opts?.accent ? "#c0c0c0" : opts?.op ? "#d4d0c8" : "#c0c0c0",
        cursor: "pointer",
        minWidth: 0,
        border: "2px solid",
        borderColor: "#fff #808080 #808080 #fff",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        padding: 8,
        background: "#c0c0c0",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxSizing: "border-box",
      }}
    >
      {/* Display */}
      <div
        style={{
          background: "#fff",
          border: "2px inset",
          borderColor: "#808080 #fff #fff #808080",
          padding: "4px 8px",
          textAlign: "right",
          ...FONT,
          fontSize: 14,
          letterSpacing: 1,
          minHeight: 30,
          overflow: "hidden",
          color: state.display === "Error" ? "#cc0000" : "#000",
        }}
      >
        {state.display}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 4,
          flex: 1,
        }}
      >
        {btn("Back",  pressBack,      { accent: true })}
        {btn("CE",    pressCE,        { accent: true })}
        {btn("C",     pressClear,     { accent: true })}
        {btn("±",     pressPlusMinus, { accent: true })}
        {btn("√",     pressSqrt,      { op: true })}

        {btn("7", () => pressDigit("7"))}
        {btn("8", () => pressDigit("8"))}
        {btn("9", () => pressDigit("9"))}
        {btn("/", () => pressOp("/"),  { op: true })}
        {btn("%", pressPercent,        { op: true })}

        {btn("4", () => pressDigit("4"))}
        {btn("5", () => pressDigit("5"))}
        {btn("6", () => pressDigit("6"))}
        {btn("×", () => pressOp("*"),  { op: true })}
        {btn("1/x", pressInverse,      { op: true })}

        {btn("1", () => pressDigit("1"))}
        {btn("2", () => pressDigit("2"))}
        {btn("3", () => pressDigit("3"))}
        {btn("-", () => pressOp("-"),  { op: true })}
        {btn("=", pressEquals,         { op: true, accent: true })}

        {btn("0", () => pressDigit("0"), { wide: true })}
        {btn(".", () => pressDigit("."))}
        {btn("+", () => pressOp("+"),  { op: true })}
      </div>
    </div>
  );
}

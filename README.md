# Portfolio OS

An interactive portfolio built as a **Windows 98 desktop experience** — complete with draggable windows, pixel art icons, a Start menu, and playable games.

![Windows 98 Portfolio](https://img.shields.io/badge/Style-Windows%2098-teal?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## Features

- **Desktop Environment** — teal background with pixel art icons, double-click to open windows
- **Draggable & Resizable Windows** — powered by `react-rnd`, bounded to the desktop area
- **Z-Index Management** — click a window to bring it to front (Zustand monotonic counter)
- **Start Menu** — lists all apps with icons, click to open
- **Real-time Clock** — live clock in the taskbar
- **Snake.exe** — canvas-based Snake game with 8-bit style
- **Minesweeper.exe** — classic 9×9 Minesweeper with flood-fill reveal
- **Mobile Responsive** — vertical card layout for screens under 768px

## Tech Stack

| Library | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Utility styling |
| 98.css | Windows 98 UI components |
| react-rnd | Draggable/resizable windows |
| Zustand | Window state & z-index management |
| Press Start 2P | 8-bit pixel font |

## Project Structure

```
src/
├── features/
│   ├── desktop/       # Icons, windows, store
│   ├── taskbar/       # Taskbar + clock
│   ├── games/
│   │   ├── snake/
│   │   └── minesweeper/
│   ├── portfolio/     # Readme, Projects, Mail content
│   └── mobile/        # Mobile layout
└── types/             # Shared TypeScript interfaces
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:2025](http://localhost:2025) in your browser.

## Controls

| Action | Result |
|---|---|
| Double-click icon | Open window |
| Drag title bar | Move window |
| Drag window edge | Resize window |
| Click title bar X | Close window |
| Click Start | Open Start menu |
| Arrow keys | Control Snake |
| Right-click cell | Flag mine |

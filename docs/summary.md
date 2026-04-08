# Portfolio OS — Project Summary

## Stack
- Next.js 16, React 19, TypeScript
- 98.css (Win98 UI), react-rnd (drag/resize), Zustand (state)

## สิ่งที่ทำเสร็จแล้ว

### Win98 OS Experience
- Boot screen — splash "Windows 98 Second Edition" + scrolling loading bar
- Desktop teal background (#008080)
- Taskbar: Start button, window buttons, system tray (🔊 🖥️ + clock)
- Start menu — sidebar gradient navy, Programs ▶ submenu, Run..., Shut Down...
- ShutdownDialog — Restart / Shut down (reload page) / MS-DOS mode
- RunDialog — Win98-style "cannot find" error

### Window Management
- Draggable + resizable windows (react-rnd)
- Minimize — window หาย, taskbar button จาง
- Maximize — เต็ม desktop area, ปุ่มเปลี่ยนเป็น restore
- Restore — double-click title bar หรือปุ่ม restore
- Alt+F4 ปิด window ที่ focused
- Close button

### Desktop Icons
- Click → select (highlight สีน้ำเงิน)
- Drag → ลากตำแหน่งใหม่ได้
- Double-click → เปิด window
- Drag selection (marquee) — คลุมหลาย icon พร้อมกัน
- Multi-icon drag — ลากทุก icon ที่เลือกพร้อมกัน
- Grid snap (80×90px) — icon ไม่ทับกัน, ไม่หลุดออกนอก desktop

### Right-click Context Menu
- Arrange Icons ▶ / Refresh / New ▶ / Properties

### Notepad Wrapper (.txt files)
- Readme.txt และ CV.txt เปิดด้วย Notepad chrome
- Menu bar: File | Edit | Format | Help

### Portfolio Content
| App | เนื้อหา |
|-----|---------|
| Readme.txt | แนะนำตัว + skills + links |
| Projects.exe | ตาราง 5 โปรเจกต์ |
| Mail.bat | form ส่งอีเมลผ่าน Contact API (Resend) |
| Internet.exe | IE-style browser — GitHub / LinkedIn embed |
| Calculator | Win98 calculator — ใช้งานได้จริง |
| Solitaire.exe | Klondike solitaire — drag-and-drop |
| Task Manager | windows list + End Task + CPU/RAM graph |
| CV.txt | tabs: Experience / Education / Skills / Certificates |
| Snake.exe | Snake game (canvas) |
| Minesweeper.exe | Minesweeper 9×9 |

### Mobile
- MobileLayout แสดง sections แบบ card stack

---

## สิ่งที่ยังเหลือ

### 🔴 Must Fix
| # | ปัญหา | ไฟล์ |
|---|-------|------|
| 1 | CV PDF ไม่มีใน public/ → Save As... 404 | `public/Attidmese_Bunsua_CV.pdf` (ข้ามไว้ก่อน) |

### ✅ ทำเสร็จแล้ว (เพิ่มเติม)
| Feature | รายละเอียด |
|---------|-----------|
| Favicon | Win98 monitor SVG ที่ `src/app/icon.svg` |
| OG/Twitter | meta tags ใน `src/app/layout.tsx` + `opengraph-image.tsx` 1200×630 |
| Arrange Icons | context menu ทำงานได้จริง |
| Clock tooltip | full date เมื่อ hover |
| CV .docx | Save As... → `/file/Attidmese_Bunsua_CV.docx` |
| Sounds | startup fanfare, window open/close blip, mute toggle 🔊/🔇 |
| My Computer | drives + fake system info |
| Display Properties | wallpaper changer: gradient presets + custom image URL + preview + global font scale (Appearance tab) |
| Minimize animation | บีบลง 220ms เมื่อ minimize |
| Recycle Bin | icon empty/full, Empty Recycle Bin button |
| BSOD easter egg | Shutdown → MS-DOS mode → OK |
| MS Paint | pencil/eraser/line/rect/ellipse/fill, 20 สี, save PNG |
| Screensaver | ⊞ bouncing หลัง 2 นาที idle |
| Window focus ring | title bar จางเมื่อ inactive (`.title-bar.inactive`) |
| Mobile redesign | tab-based layout, desktop icon row, bottom taskbar, clock |
| Icon right-click menu | Open / Rename / Delete (error dialog) / Properties per icon |
| Error sound + dialog | `playError()` + `ErrorDialog` — Rename/Delete แสดง "Access denied" |
| Projects.exe redesign | Explorer split layout: list ซ้าย / detail panel ขวา + status badges |
| Font scaler (Notepad) | A- / A+ ใน NotepadWrapper menu bar, per-window zoom |
| Internet Explorer | IEContent.tsx — fake IE browser, typewriter address bar, embed GitHub/LinkedIn links |
| Konami code | ↑↑↓↓←→←→BA → trigger BSOD easter egg |
| Contact API | `/api/contact/route.ts` — ส่งอีเมลผ่าน Resend, rate limit 3 req/10min, validation ครบ |
| Mail.bat | อัพเดต — ส่งผ่าน Contact API จริงแทน mailto: |
| Calculator | `CalculatorContent.tsx` — Win98 calc ครบ: Back/CE/C, ±, √, %, 1/x |
| Task Manager | `TaskManagerContent.tsx` — Applications tab (End Task), Performance tab (CPU/RAM graph animate) |
| Solitaire | `SolitaireGame.tsx` — Klondike drag-and-drop, ghost card via createPortal (ไม่ถูก zoom), double-click auto-foundation |

### 🟢 Nice to Have
ไม่มีแล้ว — ทุก feature ทำเสร็จแล้ว

---

## Key Files

```
src/
├── app/
│   ├── layout.tsx          # metadata, global CSS
│   ├── page.tsx            # Desktop + MobileLayout split
│   └── globals.css         # boot animation keyframes
├── types/index.ts          # WindowInstance, DesktopIconData, etc.
├── features/
│   ├── desktop/
│   │   ├── store/desktop-store.ts      # Zustand store (all state + actions)
│   │   ├── data/desktop-items.ts       # icon definitions + ICON_POSITIONS
│   │   └── components/
│   │       ├── Desktop.tsx             # main canvas, marquee, context menu
│   │       ├── Window.tsx              # draggable window frame
│   │       ├── DesktopIcon.tsx         # icon drag/select
│   │       ├── BootScreen.tsx          # Win98 splash
│   │       ├── NotepadWrapper.tsx      # menu bar for .txt windows
│   │       ├── ShutdownDialog.tsx
│   │       └── RunDialog.tsx
│   ├── taskbar/components/
│   │   ├── Taskbar.tsx     # Start menu, window buttons, system tray
│   │   └── Clock.tsx
│   ├── portfolio/components/
│   │   ├── ReadmeContent.tsx
│   │   ├── ProjectsContent.tsx
│   │   ├── MailContent.tsx
│   │   └── CVContent.tsx
│   ├── games/
│   │   ├── snake/SnakeGame.tsx
│   │   └── minesweeper/Minesweeper.tsx
│   └── mobile/components/MobileLayout.tsx
```

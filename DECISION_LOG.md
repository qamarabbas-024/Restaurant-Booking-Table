# Decision Log

## Recorded Architectural & Product Decisions

| Decision ID | Date | Topic | Decision | Rationale | Alternatives Considered |
|---|---|---|---|---|---|
| **DEC-001** | 2026-08-21 | Table Availability Modeling | Evaluate table availability dynamically by date and time slot via `isConflict()` rather than mutating a single global `Table.status`. | Setting a global `status = "Reserved"` permanently locks a table out from being booked for other dates or times. | Kept static status for general operational health ("Available" / "Maintenance"). |
| **DEC-002** | 2026-08-21 | File Persistence Format | Retain human-readable text files (`tables.txt`, `bookings.txt`) using pipe delimiters. | Preserves original educational architecture and ensures compatibility without external SQLite/JSON dependencies. | SQLite, JSON, Binary serialization. |
| **DEC-003** | 2026-08-21 | C++ Standard & Dependencies | Target standard C++17 with standard library only. | Ensures 100% portable compilation across MSVC, MinGW, GCC, and Clang. | Third-party UI / CLI libraries. |
| **DEC-004** | 2026-08-21 | Visual Companion Architecture | Embedded lightweight C++ HTTP server (`winsock2.h` / POSIX) serving local HTML5/CSS3/Vanilla JS single-page companion app from `Code/web/`. | Zero external runtimes (no Node.js, Python, or npm dependencies). Single self-contained C++ executable. Both console and visual interface share the exact same C++ logic. | Separate Electron app, Node.js backend, Python Flask bridge (all rejected to keep project pure C++ and dependency-free). |
| **DEC-005** | 2026-08-21 | Step-by-Step Allocation Visualizer | Provide visual feedback of the allocation pipeline upon reservation creation. | Transforms the visual companion into an educational tool demonstrating C++ algorithm execution. | Simple CRUD table list (rejected as too generic). |
| **DEC-006** | 2026-08-22 | Spatial Floor Plan & Drawer | Implement an architectural multi-zone seating map with CAD table fixtures and a sliding contextual action drawer (SevenRooms pattern). | A restaurant operates spatially. Gives operators immediate visibility and 1-click actions. | Basic card grid layout (rejected as too generic). |
| **DEC-007** | 2026-08-22 | Dual-Tier Web Data Architecture | Support dual operating mode: standalone in-browser `localStorage` and automatic sync with C++ REST server (`/api/state`). | Allows the web frontend to run standalone anywhere while maintaining full C++ synchronization when served by `system.exe --serve`. | Strict server-only mode. |

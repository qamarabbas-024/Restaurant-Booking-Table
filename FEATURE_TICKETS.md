# Feature & Engineering Tickets

## Milestone 1 & 2: Core Foundation & Operations (Delivered)
- [x] **T-101**: Fix Per-Slot Conflict Logic & Table Availability Bug
- [x] **T-102**: Full OOP Encapsulation & Namespace Hygiene
- [x] **T-103**: Robust Input Stream & Buffer Management
- [x] **T-104**: Exception-Safe & Delimiter-Safe File Persistence
- [x] **T-201**: Multi-Criteria Booking Search (ID, Name, Date)
- [x] **T-202**: Formatted Tabular ASCII Display
- [x] **T-203**: Table Modification & Safe Deletion
- [x] **T-204**: Deletion & Cancellation Confirmation Safeguards

---

## Milestone 3: Visual Companion Embedded Server & API (V3) — Delivered
- [x] **T-301: Embedded C++ HTTP Server Engine**: Implemented `Server.h` and `Server.cpp` using standard Winsock2 / POSIX sockets serving static files and handling REST requests on `127.0.0.1:8080`.
- [x] **T-302: REST API & Activity Audit Logger**: Added `ActivityLog` tracking in `BookingManager` and JSON serialization for `/api/state`, `/api/availability`, `/api/bookings`, `/api/cancel`, `/api/tables/status`, and `/api/tables/delete`.

---

## Milestone 4: Visual Dashboard & Interactive Floor Plan (V4) — Delivered
- [x] **T-401: Spatial Restaurant Floor Plan & CAD Geometries**: Multi-zone interactive canvas displaying tables categorized by type with real-time 5-state indicators (`Available`, `Reserved`, `Seated`, `Cleaning`, `Maintenance`).
- [x] **T-402: Contextual Table Action Drawer**: Slide-out drawer with table specifications, active reservation summary, 1-click walk-in seating, operational status toggles, and table release actions.
- [x] **T-403: Step-by-Step Allocation Pipeline Visualizer**: 5-stage visual trace animating parameter validation, slot checks, conflict scans, best-fit matching, and disk persistence.
- [x] **T-404: Live Activity Stream & Reservations Ledger**: Real-time operational event timeline, debounced multi-criteria search, and 1-click cancellation.

---

## Milestone 5: Integration, CLI Launcher & Verification (V5) — Delivered
- [x] **T-501: Dual Launcher & Console Menu Integration**: Added visual companion launcher to `main.cpp` menu with `--serve` / `--visual` command-line flags.
- [x] **T-502: End-to-End Test Suite & Verification**: 6 comprehensive test suites in `test_suite.cpp` passing 100% with zero compiler warnings under `-Wall -Wextra -Wpedantic -std=c++17 -lws2_32`.

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

## Milestone 3: Visual Companion Embedded Server & API (V3)

### Ticket T-301: Embedded C++ HTTP Server Engine
- **Type**: Backend / Bridge
- **Description**: Implement `Server.h` and `Server.cpp` using standard Winsock2 / POSIX sockets to serve static files and handle REST requests on `127.0.0.1:8080`.
- **Files**: `Server.h`, `Server.cpp`
- **Acceptance Criteria**: Responds to HTTP `GET /api/state`, `GET /`, and static file requests without external dependencies.

### Ticket T-302: REST API & Activity Audit Logger
- **Type**: Core / Controller
- **Description**: Add `ActivityLog` tracking to `BookingManager` and serialize state to JSON for `/api/state`, `/api/availability`, `/api/bookings`, and `/api/cancel`.
- **Files**: `BookingManager.h`, `BookingManager.cpp`, `Server.cpp`
- **Acceptance Criteria**: Creating or canceling a booking updates the in-memory log and returns JSON with full allocation trace.

---

## Milestone 4: Visual Dashboard & Interactive Floor Plan (V4)

### Ticket T-401: Interactive 2D Restaurant Floor Layout
- **Type**: Frontend / UI
- **Description**: Build an interactive floor plan in `Code/web/` displaying tables categorized by type with real-time status badges (`Available`, `Occupied`, `Maintenance`).
- **Files**: `Code/web/index.html`, `Code/web/style.css`, `Code/web/app.js`
- **Acceptance Criteria**: Changing date/time selector dynamically updates table availability colors on the floor plan.

### Ticket T-402: Step-by-Step Allocation Pipeline Visualizer
- **Type**: Frontend / UX
- **Description**: Animate the 6-stage booking pipeline upon reservation creation with real-time status feedback.
- **Files**: `Code/web/app.js`, `Code/web/style.css`
- **Acceptance Criteria**: Shows step-by-step progress from input parsing to disk persistence.

### Ticket T-403: Live Activity Stream & Reservation Search Panel
- **Type**: Frontend / UI
- **Description**: Display a live operational event timeline and a filterable table of active bookings with 1-click cancellation.
- **Files**: `Code/web/index.html`, `Code/web/app.js`
- **Acceptance Criteria**: Searching by guest name filters reservations in real time; canceling removes the booking with confirmation.

---

## Milestone 5: Integration, CLI Launcher & Verification (V5)

### Ticket T-501: Dual Launcher & Console Menu Integration
- **Type**: CLI / UX
- **Description**: Add "Launch Visual Companion" option to `main.cpp` menu and support `--serve` / `--visual` command-line flags.
- **Files**: `Code/main.cpp`
- **Acceptance Criteria**: Users can run console or launch the visual server with automatic browser launch.

### Ticket T-502: End-to-End Test Suite & Verification
- **Type**: QA / Testing
- **Description**: Update `test_suite.cpp` to verify REST API serialization, activity logging, and slot query correctness.
- **Files**: `Code/test_suite.cpp`
- **Acceptance Criteria**: 100% automated test pass rate with zero regressions.

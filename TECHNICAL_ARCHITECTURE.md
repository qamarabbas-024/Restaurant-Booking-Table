# Technical Architecture & System Design — Core & Visual Companion

## 1. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                               INTERFACES                                |
|   +-----------------------------+     +-------------------------------+ |
|   |     C++ CONSOLE INTERFACE   |     |    VISUAL COMPANION (WEB)     | |
|   |   (main.cpp / Utils.cpp)    |     | (HTML5/CSS3/Vanilla JS in web)| |
|   +-----------------------------+     +-------------------------------+ |
+-------------------------------------------------------------------------+
                 |                                      | HTTP / REST (JSON)
                 v                                      v
+-------------------------------------------------------------------------+
|                         EMBEDDED BRIDGE LAYER                           |
|                       Server.h / Server.cpp                             |
|  - Lightweight multi-threaded local HTTP server (Winsock2 / POSIX)      |
|  - Static asset server (serves web/index.html, style.css, app.js)       |
|  - REST API endpoint router & JSON serializer                           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            SHARED CORE LOGIC                            |
|                   BookingManager.h / BookingManager.cpp                 |
|  - In-memory collections: vector<Table>, vector<Booking>                |
|  - Scheduling & Conflict Detection: isConflict(tableId, date, time)     |
|  - Smart Table Allocation: findBestTable(guests, date, time)            |
|  - Audit Activity Log: vector<ActivityLog>                              |
+-------------------------------------------------------------------------+
         |                                                 |
         v (Composes)                                      v (Composes)
+-------------------------------+             +-------------------------------+
|         ENTITY TIER           |             |         PERSISTENCE TIER      |
|  Table.h / Table.cpp          |             |  FileHandler.h / .cpp         |
|  Booking.h / Booking.cpp      |             |  - Text File Parser (safe)    |
|  - Domain entities & methods  |             |  - Delimited Record Formatter |
|  - State invariants           |             |  - tables.txt / bookings.txt  |
+-------------------------------+             +-------------------------------+
```

---

## 2. Shared C++ Core Design

The core scheduling engine and data models remain 100% written in C++. No business rules or allocation logic exist in the frontend layer.

### Activity Log Model (`ActivityLog`)
Tracks timestamped operational activity for both console and visual interfaces:
```cpp
struct ActivityLog {
    std::string timestamp;
    std::string type; // "BOOKING_CREATED", "BOOKING_CANCELLED", "TABLE_ADDED", "CONFLICT_CHECK"
    std::string message;
};
```

---

## 3. Embedded Local HTTP Server (`Server.h` / `Server.cpp`)

To avoid external runtimes (like Node.js, Python, or external frameworks), an embedded HTTP server is implemented directly in C++ using standard Windows Sockets (`winsock2.h`) and standard POSIX socket abstractions.

### 3.1 Server Responsibilities:
- Listens on `127.0.0.1:8080`.
- Multi-client handling via lightweight non-blocking sockets / threading.
- Serves static assets (`index.html`, `style.css`, `app.js`, `favicon.ico`) with appropriate MIME types.
- Dispatches `/api/*` endpoints to the shared `BookingManager` instance.

### 3.2 REST API Specification

| Endpoint | Method | Description | Request Body / Query | Response (JSON) |
|---|---|---|---|---|
| `/api/state` | `GET` | Complete snapshot of tables, bookings, metrics, and activity log | None | `{ "tables": [...], "bookings": [...], "metrics": {...}, "activity": [...] }` |
| `/api/availability` | `GET` | Computes availability for a specific slot | `?date=DD/MM/YYYY&time=8:00%20PM` | `{ "date": "...", "time": "...", "availableTableIds": [1, 2, 4], "occupiedTableIds": [3] }` |
| `/api/bookings` | `POST` | Creates a booking using C++ smart allocation engine | `{ "guestName": "...", "guests": 4, "date": "...", "time": "..." }` | `{ "success": true, "booking": {...}, "allocationTrace": [...], "receipt": "..." }` |
| `/api/bookings/:id` | `DELETE` | Cancels a booking | ID in URL or body | `{ "success": true, "message": "..." }` |
| `/api/tables` | `POST` | Adds a new table | `{ "id": 5, "capacity": 4, "type": "Patio" }` | `{ "success": true, "table": {...} }` |

---

## 4. Visual Companion Frontend Architecture

- **Location**: `Code/web/`
- **Stack**: Pure Vanilla HTML5, Modern CSS3 (Custom Properties, Flexbox, CSS Grid), and Vanilla JavaScript (ES6 Modules/Fetch API).
- **Zero Build Step**: Native browser execution without bundlers, Webpack, or Babel.
- **Key Modules**:
  - `floorplan.js` / Floor Plan Component: Renders 2D interactive table layout with dynamic SVG seating arrangements.
  - `visualizer.js` / Allocation Pipeline Visualizer: Step-by-step visual animation of the 6-stage allocation algorithm.
  - `timeline.js` / Activity Stream: Real-time operational log.
  - `app.js` / Orchestrator: State management and polling/refresh synchronization with C++ backend.

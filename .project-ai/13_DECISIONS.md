# Decision Log: The Royal Spice

## Decision 1: Single Source of Truth C++ Backend with Embedded REST Server
- **Date**: 2026-08-21 / 2026-08-22
- **Context**: The user requested a visual companion web interface in addition to the C++ console interface, without rewriting business logic in JavaScript or introducing heavy external runtimes (Node.js/Python).
- **Options Considered**:
  1. Full Node.js / React separate rewrite.
  2. Electron wrapper around C++ binary.
  3. Embedded pure C++17 Winsock/POSIX HTTP server (`Server.cpp`) serving vanilla JS/CSS companion UI.
- **Decision**: Option 3 (Embedded C++ HTTP REST Server).
- **Why Chosen**: Preserves the exact same `BookingManager` in-memory state and `tables.txt`/`bookings.txt` text files as the single source of truth; zero installation required by the user.
- **Trade-offs**: Requires custom minimal HTTP/REST parser, handled with socket timeouts and path sanitization.
- **Consequences**: Fast startup, zero npm dependencies, instant sync between Console and Web UI.

---

## Decision 2: Dynamic Slot-Based Conflict Detection
- **Date**: 2026-08-21
- **Context**: Static boolean table `isAvailable` flags locked tables permanently once booked, preventing the same table from being booked on different dates or time slots.
- **Decision**: Dynamic conflict checking on `(tableId, date, time)` tuple.
- **Why Chosen**: Allows real-world multi-date restaurant scheduling without corrupting table records.

---

## Decision 3: Dual-Mode Web Companion (Guest Portal vs Host Stand)
- **Date**: 2026-08-22
- **Context**: The user wanted both customer fine-dining booking and staff operations in the web UI.
- **Decision**: Integrated top-bar segmented switcher for **Guest Reservation Portal** (4-step booking flow, CAD blueprint seating, 6-stage algorithmic trace, VIP ticket pass) and **Host Stand & Floor Control** (express walk-in fast seater, live turnover clocks, reservations ledger, fleet status toggles, revenue yield forecasting).
- **Why Chosen**: Provides a complete end-to-end luxury experience for both diners and restaurant staff.

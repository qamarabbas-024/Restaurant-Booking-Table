# Feature & Engineering Tickets

## Milestone 1: Foundation & Correctness (V1)

### Ticket T-101: Fix Per-Slot Conflict Logic & Table Availability Bug
- **Type**: Bug Fix / Logic Core
- **Description**: Separate general table operational status from dynamic date/time slot reservation status. In `findBestTable()` and `showAvailableTables()`, evaluate availability dynamically against `isConflict(tableId, date, time)`.
- **Files**: `BookingManager.h`, `BookingManager.cpp`, `Table.h`, `Table.cpp`
- **Acceptance Criteria**: Reserving Table 1 on Date A at Time Slot X allows Table 1 to be reserved on Date B at Time Slot X, or on Date A at Time Slot Y.

### Ticket T-102: Full OOP Encapsulation & Namespace Hygiene
- **Type**: Refactoring / OOP Quality
- **Description**: Convert all `Table` and `Booking` member fields to `private`. Provide validated getters, setters, and const-correct methods. Remove `using namespace std;` from all header files (`.h`).
- **Files**: `Table.h`, `Table.cpp`, `Booking.h`, `Booking.cpp`, `BookingManager.h`, `FileHandler.h`, `Utils.h`
- **Acceptance Criteria**: Header files contain zero namespace pollution. All access to entity attributes is encapsulated.

### Ticket T-103: Robust Input Stream & Buffer Management
- **Type**: Bug Fix / Usability
- **Description**: Re-engineer `safeInt()`, `pauseScreen()`, and create `safePositiveInt()`, `safeStringInput()`, `safeDateInput()`.
- **Files**: `Utils.h`, `Utils.cpp`, `main.cpp`
- **Acceptance Criteria**: No skipped prompts, no infinite loops on character input, no hanging on `pauseScreen()`.

### Ticket T-104: Exception-Safe & Delimiter-Safe File Persistence
- **Type**: Bug Fix / Persistence
- **Description**: Wrap string-to-integer conversions in `try-catch` blocks in `FileHandler::loadBookings()` and `FileHandler::loadTables()`. Handle multi-word strings and missing files gracefully.
- **Files**: `FileHandler.h`, `FileHandler.cpp`
- **Acceptance Criteria**: Malformed data lines are handled without crashing the application. Multi-word table types and guest names persist correctly.

---

## Milestone 2: Usability, Search & Table Operations (V2)

### Ticket T-201: Multi-Criteria Booking Search
- **Type**: Feature / Usability
- **Description**: Expand `searchBooking()` to present a sub-choice: search by Booking ID, search by Guest Name (case-insensitive substring match), or search by Date.
- **Files**: `BookingManager.h`, `BookingManager.cpp`
- **Acceptance Criteria**: Searching for "Qamar" returns all bookings matching that guest name.

### Ticket T-202: Formatted Tabular ASCII Display
- **Type**: UX / UI
- **Description**: Format all table and booking listings using `std::setw`, borders, and aligned column headers.
- **Files**: `Table.cpp`, `Booking.cpp`, `BookingManager.cpp`, `Utils.cpp`
- **Acceptance Criteria**: All records display in neat, aligned grids.

### Ticket T-203: Table Modification & Safe Deletion
- **Type**: Feature
- **Description**: Add `updateTable()` and `deleteTable()` options in Table Management menu with active reservation validation.
- **Files**: `BookingManager.h`, `BookingManager.cpp`, `main.cpp`
- **Acceptance Criteria**: Tables cannot be deleted if active bookings exist for them.

### Ticket T-204: Deletion & Cancellation Confirmation Safeguards
- **Type**: Usability / Safety
- **Description**: Prompt confirmation before deleting bookings or removing tables.
- **Files**: `BookingManager.cpp`
- **Acceptance Criteria**: User must enter `y` or `Y` to confirm cancellation.

---

## Milestone 3: Dashboard, Testing & Polish (V3)

### Ticket T-301: Enriched System Dashboard
- **Type**: Feature / Analytics
- **Description**: Display total seating capacity, active bookings, and breakdown by table type in a formatted dashboard card.
- **Files**: `BookingManager.cpp`
- **Acceptance Criteria**: Dashboard accurately calculates aggregate capacity and statistics.

### Ticket T-302: Comprehensive Documentation & README Update
- **Type**: Documentation
- **Description**: Update `README.md` with complete OOP explanation, architecture diagrams, build/run guides, and terminal walkthroughs.
- **Files**: `README.md`
- **Acceptance Criteria**: README serves as a premier reference for 2nd-semester OOP C++ academic evaluation.

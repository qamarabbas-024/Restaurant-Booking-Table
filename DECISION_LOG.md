# Decision Log

## Recorded Architectural & Product Decisions

| Decision ID | Date | Topic | Decision | Rationale | Alternatives Considered |
|---|---|---|---|---|---|
| **DEC-001** | 2026-08-21 | Table Availability Modeling | Evaluate table availability dynamically by date and time slot via `isConflict()` rather than mutating a single global `Table.status`. | Setting a global `status = "Reserved"` permanently locks a table out from being booked for other dates or times. | Kept static status for general operational health ("Available" / "Out of Service") while date/time availability is checked on demand. |
| **DEC-002** | 2026-08-21 | File Persistence Format | Retain human-readable text files (`tables.txt`, `bookings.txt`) using pipe delimiters for bookings and flexible delimiters for tables. | Preserves original educational architecture and ensures compatibility with existing files without adding external SQLite/JSON dependencies. | SQLite, JSON, Binary serialization (rejected to maintain academic BSCS simplicity). |
| **DEC-003** | 2026-08-21 | C++ Standard & Dependencies | Target standard C++17 with standard library only (`<iostream>`, `<vector>`, `<string>`, `<fstream>`, `<iomanip>`, `<limits>`, `<sstream>`). | Ensures 100% portable compilation across MSVC, MinGW, GCC, and Clang with zero third-party installation overhead. | Third-party UI / CLI libraries (rejected to avoid complexity and build hassles). |
| **DEC-004** | 2026-08-21 | Header Namespace Hygiene | Remove `using namespace std;` from all `.h` header files. | Industry and academic best practice to avoid global symbol collisions when headers are included in multiple translation units. | Leaving `using namespace std;` in headers (rejected as bad OOP practice). |
| **DEC-005** | 2026-08-21 | Search Expansion | Expand booking search to support Guest Name substring and Date in addition to Booking ID. | Substantially improves practical usability for hosts without increasing architectural complexity. | Search by ID only (too restrictive when guests arrive without their ID). |

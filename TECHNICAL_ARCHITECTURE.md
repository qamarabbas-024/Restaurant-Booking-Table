# Technical Architecture & System Design

## 1. Architectural Overview

The **Restaurant Booking Table System** is structured as a modular 3-tier console architecture adhering to clean Object-Oriented C++ principles.

```
+-------------------------------------------------------------------------+
|                              PRESENTATION TIER                          |
|                       main.cpp  |  Utils.h / Utils.cpp                  |
|  - Console Menus & User Interaction                                     |
|  - Stream Sanitization & Tabular ASCII Rendering                        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            BUSINESS LOGIC TIER                          |
|                   BookingManager.h / BookingManager.cpp                 |
|  - In-memory collection management (vector<Table>, vector<Booking>)     |
|  - Smart Table Allocation (Best-fit capacity matching)                  |
|  - Dynamic Slot-Based Conflict Detection (isConflict by date & time)    |
|  - Query Routing & Business Invariant Enforcement                       |
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

## 2. Core Domain Modeling & State Distinction

### Operational Status vs. Dynamic Reservation Availability
A key design principle in this system is the clear separation of concerns between two distinct concepts:
1. **Operational Status** (stored in `Table::status`):
   - Represents the physical operational state of the table (e.g., `"Available"`, `"Maintenance"`, or `"Out of Service"`).
   - If a table is under maintenance, it cannot be booked for any date or time.
2. **Reservation Availability** (derived dynamically):
   - Represents whether an operational table is free at a specific `(tableId, date, time)`.
   - Derived on demand by querying `BookingManager::isConflict(tableId, date, time)` against active bookings.
   - **Crucial Rule**: Booking a table for a specific time slot does *not* mutate the table's persistent operational status to `"Reserved"`.

---

## 3. Class Design & OOP Responsibilities

### 3.1 `Table` Class (`Table.h` / `Table.cpp`)
- **Encapsulated State**:
  - `m_id: int` — Unique identifier (> 0).
  - `m_capacity: int` — Seating capacity (> 0).
  - `m_type: std::string` — Description (e.g. "Couple", "Family", "VIP").
  - `m_status: std::string` — Operational status ("Available" / "Maintenance").
- **Domain Methods**:
  - `bool isOperational() const`: Returns `true` if table status is `"Available"`.
  - `bool canSeat(int guests) const`: Validates `isOperational() && m_capacity >= guests`.
  - `void setOperationalStatus(const std::string &status)`: Validates and sets operational status.
  - `void updateDetails(int capacity, const std::string &type)`: Domain method to modify table specs.
  - `void displayRow() const`: Formats table row for console grids.

### 3.2 `Booking` Class (`Booking.h` / `Booking.cpp`)
- **Encapsulated State**:
  - `m_bookingId: int` — Unique sequential identifier (> 0).
  - `m_tableId: int` — Referenced table ID.
  - `m_guestName: std::string` — Non-empty guest name.
  - `m_guests: int` — Party size (> 0).
  - `m_date: std::string` — Formatted date.
  - `m_time: std::string` — Formatted time slot.
- **Domain Methods**:
  - `bool conflictsWith(int tableId, const std::string &date, const std::string &time) const`: Checks if booking collides with the requested slot.
  - `bool matchesGuestName(const std::string &query) const`: Case-insensitive substring matching.
  - `bool matchesDate(const std::string &date) const`: Checks date equality.
  - `void displayRow() const`: Formats booking row for console grids.
  - `void printReceipt() const`: Outputs a structured confirmation receipt.

### 3.3 `BookingManager` Class (`BookingManager.h` / `BookingManager.cpp`)
- **Controller Responsibilities**:
  - Holds `std::vector<Table>` and `std::vector<Booking>`.
  - Coordinates scheduling, conflict detection, and best-fit allocation.
  - Enforces deletion safety (verifying table has no active reservations before deletion).

### 3.4 `FileHandler` Class (`FileHandler.h` / `FileHandler.cpp`)
- **Persistence Responsibilities**:
  - Pure static utility class for file I/O.
  - Exception-safe parsing of records with `try-catch` around numeric token conversions.
  - Handles multi-word strings and space/pipe delimiters gracefully.

### 3.5 `Utils` Module (`Utils.h` / `Utils.cpp`)
- **Console & Stream Responsibilities**:
  - Safe integer, string, and date input without stream desynchronization.
  - Reusable screen clearing, single-enter pause, and aligned ASCII table styling.

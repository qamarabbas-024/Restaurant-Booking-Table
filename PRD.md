# Product Requirements Document (PRD)

## 1. Executive Summary
- **Project Name**: Restaurant Booking Table System
- **Origin**: 2nd-Semester BSCS Object-Oriented Programming (OOP) C++ Project
- **Project Type**: Console-based Desktop Application (C++)
- **Primary Goal**: Elevate correctness, OOP architecture, validation, data integrity, usability, and maintainability while preserving the project's core identity, simplicity, file-based persistence, and educational purpose.

---

## 2. Target Users & Personas
1. **Restaurant Host / Receptionist**:
   - Manages day-to-day table assignments, books tables for walk-ins and phone calls, looks up bookings by guest name/ID, and cancels bookings upon request.
2. **Restaurant Manager**:
   - Reviews dashboard metrics (total seating capacity, table utilization, active bookings), adds or updates restaurant tables, and configures seating layouts.
3. **Academic Evaluator / OOP Student**:
   - Evaluates the codebase for clean OOP principles (Encapsulation, Abstraction, Composition, Separation of Concerns, Const-Correctness, and Exception Safety) without overengineering.

---

## 3. Core Value Proposition & Differentiators
- **Educational OOP Excellence**: Demonstrates pure, idiomatic C++ OOP without relying on external libraries or bloated frameworks.
- **Smart Allocation**: Automatically assigns the most optimal table (smallest sufficient capacity) to prevent wasting large tables on small parties.
- **Conflict-Free Reservation System**: Guarantees zero overlapping bookings for the same table at the same date and time slot.
- **Resilient File Persistence**: Lightweight, human-readable file persistence that handles edge cases, empty lines, and spaces in strings safely.

---

## 4. Feature Requirements & Capabilities

### 4.1 Table Management
- **FR-T1 View Tables**: Display all restaurant tables in a clean, formatted ASCII grid (ID, Capacity, Type, Status).
- **FR-T2 Add Table**: Create a new table with unique positive ID, valid capacity (>0), and descriptive type (e.g. "Couple", "Family", "VIP", "Outdoor Patio").
- **FR-T3 Check Slot Availability**: Check which tables are free for a specific date and time slot, rather than relying on a static global status.
- **FR-T4 Update Table (Enhanced)**: Modify table capacity or type.
- **FR-T5 Remove Table (Enhanced)**: Delete a table only if it has no active or upcoming reservations.

### 4.2 Booking Management
- **FR-B1 Create Booking**:
  - Accept guest name (supporting spaces), guest count (>0), date (`DD/MM/YYYY` or `YYYY-MM-DD`), and time slot (from preset list or validated custom time).
  - Perform smart table allocation (`capacity >= guests`, no time conflict, minimum capacity fit).
  - Generate unique sequential Booking ID.
  - Print formatted booking receipt.
- **FR-B2 View All Bookings**: Display all active reservations in a structured tabular view.
- **FR-B3 Search Bookings**:
  - Search by Booking ID (exact match).
  - Search by Guest Name (case-insensitive substring match).
  - Search by Date (exact date match).
- **FR-B4 Cancel Booking**:
  - Remove booking with user confirmation prompt (`[y/N]`).
  - Safely update table slot availability.

### 4.3 Dashboard & Analytics
- **FR-D1 System Dashboard**:
  - Total tables and total restaurant seating capacity.
  - Total active bookings.
  - Summary breakdown of tables by type and utilization.

### 4.4 Persistence & System Utilities
- **FR-P1 File Persistence**:
  - Auto-save on create, update, delete.
  - Graceful initial load (default initial tables if file is missing or empty).
  - Exception-safe parsing of records.
- **FR-U1 Input & UX Utilities**:
  - Robust integer and string reading that eliminates `cin` buffer bugs.
  - Cross-platform screen clear and reliable pause mechanism.

---

## 5. Non-Functional Requirements
- **Performance**: Instantaneous response (< 5ms) for all console operations with hundreds of records.
- **Portability**: Compiles cleanly with standard C++11/14/17/20 compilers on Windows (MinGW/MSVC) and Linux/macOS (GCC/Clang) without third-party dependencies.
- **Reliability & Safety**: No unexpected crashes on invalid user input or malformed data files.
- **Code Quality**: Zero compiler warnings under `-Wall -Wextra -Wpedantic`.

---

## 6. Constraints & Boundaries
- **No Web / GUI Frameworks**: Must remain a clean, well-formatted terminal/console application.
- **No External DBMS**: Must retain text-file-based storage (`tables.txt`, `bookings.txt`).
- **No Overengineering**: Avoid complex design patterns (e.g., enterprise micro-frameworks) that obscure the 2nd-semester BSCS learning objectives.

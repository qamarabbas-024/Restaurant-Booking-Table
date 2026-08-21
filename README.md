# 🍽️ Restaurant Table Booking & Management System

A high-quality, modular, console-based **Restaurant Table Booking System** built in standard C++17. Designed as an exemplary 2nd-semester BSCS Object-Oriented Programming (OOP) project demonstrating pure OOP design principles, smart table allocation, conflict-free reservation scheduling, exception-safe file persistence, and robust console stream handling.

---

## 📌 Features

### 🏢 Table Management
- **View All Tables**: Formatted ASCII table displaying Table ID, Seating Capacity, Table Type, and Operational Status.
- **Check Slot Availability**: On-demand query to check table availability for a specific Date and Time Slot.
- **Add New Table**: Interactive wizard with duplicate ID prevention, positive capacity enforcement, and multi-word description support.
- **Update Table**: Modify seating capacity, table type, and operational status (`Available` / `Maintenance`).
- **Safe Table Deletion**: Deletes tables while guaranteeing that tables with active reservations cannot be deleted.

### 📅 Reservation & Booking Management
- **Smart Best-Fit Table Allocation**: Automatically assigns the table with the smallest adequate capacity (`capacity >= party size`) that has no scheduling conflicts for the requested date and time slot.
- **Conflict-Free Scheduling**: Precise slot-based conflict detection preventing double-booking of any table for the same date and time.
- **Multi-Criteria Search**:
  - Search by unique **Booking ID** (with formatted receipt view).
  - Search by **Guest Name** (case-insensitive substring match).
  - Search by **Reservation Date** (lists all scheduled bookings for that day).
- **Safe Cancellation**: Delete reservations with interactive confirmation (`[y/N]`).
- **Formatted Booking Receipt**: Generates a clean, professional ASCII receipt upon confirmation.

### 📊 Dashboard & System Analytics
- Displays Total Installed Tables, Operational vs. Maintenance status, Total Restaurant Seating Capacity, Active Reservation Count, and Table Breakdown by Category.

### 💾 Robust Persistence & UX
- **Pipe-Delimited File Storage**: Automatically serializes tables and bookings to `tables.txt` and `bookings.txt`.
- **Exception Safety**: Guarded against corrupted or malformed data files with `try-catch` blocks.
- **Stream-Safe Input**: Robust integer, string, and date input utilities preventing `std::cin` buffer lockups.

---

## 📚 Core OOP Concepts Demonstrated

| Concept | Implementation in Code |
|---|---|
| **Encapsulation & Data Hiding** | All attributes in `Table` and `Booking` are `private`, accessible only via invariant-preserving constructors, getters, and validated mutators. |
| **Abstraction** | High-level menu controllers interact with `BookingManager` without needing to know internal data structures or file I/O details. |
| **Composition** | `BookingManager` owns and manages collections of `Table` and `Booking` objects (`std::vector<Table>`, `std::vector<Booking>`). |
| **Const-Correctness** | Non-mutating methods and getters are marked `const`, and non-primitive arguments are passed as `const Type &`. |
| **Separation of Concerns** | Distinct modular tiers: Entity Tier (`Table`, `Booking`), Logic Tier (`BookingManager`), Persistence Tier (`FileHandler`), and Presentation Tier (`main`, `Utils`). |
| **Namespace Cleanliness** | Header files (`.h`) contain zero global namespace pollution (`using namespace std;` strictly avoided in headers). |

---

## 📂 Project Structure

```text
Restaurant-Booking-Table/
├── Code/
│   ├── Table.h            # Table entity declarations & encapsulation
│   ├── Table.cpp          # Table method implementations & formatting
│   ├── Booking.h          # Booking entity declarations & domain queries
│   ├── Booking.cpp        # Booking method implementations & receipts
│   ├── BookingManager.h   # Controller & scheduling engine declarations
│   ├── BookingManager.cpp # Allocation, search, conflict detection logic
│   ├── FileHandler.h      # Persistence interface declarations
│   ├── FileHandler.cpp    # Exception-safe file parser & serializer
│   ├── Utils.h            # Console, input validation & formatting helpers
│   ├── Utils.cpp          # Stream sanitization & UI helper routines
│   ├── main.cpp           # Entry point and interactive console menus
│   ├── test_suite.cpp     # Automated unit & integration test runner
│   ├── tables.txt         # Table persistent records
│   ├── bookings.txt       # Booking persistent records
│   └── system.exe         # Compiled executable
├── PRD.md                 # Product Requirements Document
├── PRODUCT_PLAN.md        # Product Scope & Release Roadmap
├── TECHNICAL_ARCHITECTURE.md # System Design & Class Architecture
├── SECURITY_SPECIFICATION.md # Threat Modeling & Input Sanitization
├── FRONTEND_SPECIFICATION.md # Console UI & Formatting Specifications
├── FEATURE_TICKETS.md     # Engineering Tickets & Acceptance Criteria
├── TEST_PLAN.md           # Test Matrix & Verification Cases
├── PERFORMANCE_PLAN.md    # Theoretical Complexity & Resource Plan
├── DATA_MODEL.md          # Data Schemas & Storage Invariants
├── DECISION_LOG.md        # Architectural Decision Records
├── PROJECT_STATE.md       # Operational Checkpoint & Status
└── README.md              # Project Documentation & Setup Guide
```

---

## ⚙️ Compilation & Running

### Prerequisites
- Standard C++17 compatible compiler (e.g., `g++` / MinGW / Clang / MSVC).

### Compile Application
```bash
cd Code
g++ -Wall -Wextra -Wpedantic -std=c++17 main.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp -o system.exe
```

### Run Application
```bash
./system.exe
```

### Run Automated Test Suite
```bash
g++ -Wall -Wextra -Wpedantic -std=c++17 test_suite.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp -o test_suite.exe
./test_suite.exe
```

---

## 📸 Sample Console Interface

### Main Dashboard
```text
================================================================================
                     RESTAURANT DASHBOARD & OVERVIEW
================================================================================
  Total Tables Installed : 4
  Operational Tables     : 4
  Under Maintenance      : 0
  Total Seating Capacity : 20 Guests
  Total Active Bookings  : 2

  Table Breakdown by Type:
    - Banquet Table      : 1 table(s)
    - Couple Table       : 1 table(s)
    - Family Booth       : 1 table(s)
    - VIP Suite          : 1 table(s)
================================================================================
```

### Formatted Tables View
```text
+----------+------------+----------------------+--------------------+
| Table ID | Capacity   | Type                 | Operational Status |
+----------+------------+----------------------+--------------------+
| 1        | 2 Guests   | Couple Table         | Available          |
| 2        | 4 Guests   | Family Booth         | Available          |
| 3        | 6 Guests   | VIP Suite            | Available          |
| 4        | 8 Guests   | Banquet Table        | Available          |
+----------+------------+----------------------+--------------------+
```

### Formatted Bookings View
```text
+--------+----------+----------------------+--------+------------+----------+
| ID     | Table ID | Guest Name           | Guests | Date       | Time     |
+--------+----------+----------------------+--------+------------+----------+
| 1      | 2        | Qamar Abbas          | 4      | 24/05/2026 | 8:00 PM  |
| 2      | 3        | Sarah Jenkins        | 5      | 24/05/2026 | 6:00 PM  |
+--------+----------+----------------------+--------+------------+----------+
```

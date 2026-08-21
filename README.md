# 🍽️ Restaurant Table Booking & Seating System

A modular, dual-interface **Restaurant Table Booking System** built in standard C++17. Designed as an exemplary 2nd-semester BSCS Object-Oriented Programming (OOP) project demonstrating the principle of **"One Source of Truth, Multiple Interfaces"**:
1. **Interactive Console Terminal Interface**: Fast, keyboard-driven, stream-safe terminal interface.
2. **Visual Companion Web Interface**: Interactive 2D floor layout, step-by-step allocation pipeline visualizer, slot availability matrix, and live operational activity monitor served directly by an embedded C++ HTTP server.

Both interfaces share 100% of the C++ business logic, scheduling engine, and file persistence layer (`tables.txt`, `bookings.txt`).

---

## 📌 Features

### 🏢 Table Management
- **Interactive 2D Floor Layout**: Visual representation of physical restaurant tables styled by category (Couple Table, Family Booth, VIP Suite, Banquet Table).
- **Dynamic Slot Availability**: On-demand query to check table availability for any specific Date and Time Slot.
- **Add & Update Tables**: Interactive wizard with duplicate ID prevention, positive capacity enforcement, and multi-word description support.
- **Safe Table Deletion**: Deletes tables while guaranteeing that tables with active reservations cannot be deleted.

### 📅 Reservation & Booking Management
- **Smart Best-Fit Table Allocation**: Automatically assigns the table with the smallest adequate capacity (`capacity >= party size`) that has no scheduling conflicts for the requested date and time slot.
- **Allocation Pipeline Visualizer**: Animates the internal 6-stage allocation algorithm step-by-step:
  `[Input Validation] -> [Slot Check] -> [Conflict Scan] -> [Best-Fit Match] -> [File Persist] -> [Receipt Issued]`.
- **Conflict-Free Scheduling**: Precise slot-based conflict detection preventing double-booking of any table for the same date and time.
- **Multi-Criteria Search**:
  - Search by unique **Booking ID** (with formatted receipt view).
  - Search by **Guest Name** (case-insensitive substring match).
  - Search by **Reservation Date** (lists all scheduled bookings for that day).
- **Safe Cancellation**: Delete reservations with interactive confirmation (`[y/N]`).
- **Formatted Booking Receipt**: Generates a clean, professional ASCII and visual modal receipt upon confirmation.

### 📊 Dashboard & System Analytics
- **Live Metrics Ribbon**: Real-time gauge of Total Installed Tables, Total Restaurant Seating Capacity, Active Bookings, and Current Slot Occupancy Rate.
- **Live Operational Activity Stream**: Real-time event timeline logging every creation, cancellation, table modification, and conflict check.

### 💾 Robust Persistence & Network Architecture
- **Zero External Runtime Dependencies**: Embedded lightweight C++ HTTP server (`winsock2.h` on Windows / POSIX sockets) compiled directly into the binary. No Node.js, Python, or npm required.
- **Pipe-Delimited File Storage**: Automatically serializes tables and bookings to `tables.txt` and `bookings.txt`.
- **Exception Safety**: Guarded against corrupted or malformed data files with `try-catch` blocks.
- **Localhost Restricted**: Binds strictly to `127.0.0.1:8080` with path-traversal protection.

---

## 📚 Core OOP Concepts Demonstrated

| Concept | Implementation in Code |
|---|---|
| **Encapsulation & Data Hiding** | All attributes in `Table` and `Booking` are `private`, accessible only via invariant-preserving constructors, getters, and validated mutators. |
| **Abstraction** | Both Console Menus and REST API handlers interact with `BookingManager` without needing to know internal container details or file serialization mechanisms. |
| **Composition** | `BookingManager` owns and manages collections of `Table`, `Booking`, and `ActivityLog` objects. |
| **Const-Correctness** | Non-mutating methods and getters are marked `const`, and non-primitive arguments are passed as `const Type &`. |
| **Separation of Concerns** | Distinct modular tiers: Entity Tier (`Table`, `Booking`), Logic Tier (`BookingManager`), Bridge Tier (`Server`), Persistence Tier (`FileHandler`), and Presentation Tier (`main`, `Utils`, `web/`). |
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
│   ├── BookingManager.h   # Controller, scheduling engine & API methods
│   ├── BookingManager.cpp # Allocation, search, conflict detection logic
│   ├── FileHandler.h      # Persistence interface declarations
│   ├── FileHandler.cpp    # Exception-safe file parser & serializer
│   ├── Server.h           # Embedded HTTP companion server header
│   ├── Server.cpp         # Embedded C++ HTTP/REST server & router
│   ├── Utils.h            # Console, input validation & formatting helpers
│   ├── Utils.cpp          # Stream sanitization & UI helper routines
│   ├── main.cpp           # Entry point and interactive console menus
│   ├── test_suite.cpp     # Automated unit & integration test runner
│   ├── tables.txt         # Table persistent records
│   ├── bookings.txt       # Booking persistent records
│   ├── system.exe         # Compiled release executable
│   └── web/               # Visual Companion Web Application
│       ├── index.html     # Visual companion layout & floor plan canvas
│       ├── style.css      # Luxury bistro styling, responsive grid & animations
│       └── app.js         # Floor plan renderer & REST API integration
├── PRD.md                 # Product Requirements Document
├── PRODUCT_PLAN.md        # Product Scope & Release Roadmap
├── TECHNICAL_ARCHITECTURE.md # System Design & Class Architecture
├── SECURITY_SPECIFICATION.md # Threat Modeling & Input Sanitization
├── FRONTEND_SPECIFICATION.md # Console UI & Visual Companion Specifications
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
g++ -Wall -Wextra -Wpedantic -std=c++17 main.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o system.exe
```

### Run Options

#### Option A: Interactive Console Mode
```bash
./system.exe
```
From the main menu, select `1-3` for console operations or `4` to launch the Visual Companion.

#### Option B: Launch Visual Companion Directly
```bash
./system.exe --serve
```
*Automatically launches your default browser to `http://localhost:8080`.*

### Run Automated Test Suite
```bash
g++ -Wall -Wextra -Wpedantic -std=c++17 test_suite.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o test_suite.exe
./test_suite.exe
```

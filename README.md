# 🍽️ The Royal Spice — Restaurant Table Booking & Management System

[![C++ Core & Test Suite CI](https://github.com/qamarabbas-024/Restaurant-Booking-Table/actions/workflows/ci.yml/badge.svg)](https://github.com/qamarabbas-024/Restaurant-Booking-Table/actions/workflows/ci.yml)
![Language](https://img.shields.io/badge/Language-C%2B%2B17-blue.svg)
![Standards](https://img.shields.io/badge/Standard-ISO%20C%2B%2B17-emerald.svg)
![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-amber.svg)

A modular, dual-interface **Restaurant Table Booking & Floor Management System** built in standard C++17 with a luxury visual operations platform. Designed as an exemplary 2nd-semester BSCS Object-Oriented Programming (OOP) project demonstrating the principle of **"One Source of Truth, Multiple Interfaces"**:
1. **Interactive Console Terminal Interface**: Fast, keyboard-driven, stream-safe terminal interface.
2. **Visual Web Operations Platform**: SevenRooms/Resy-inspired spatial floor plan, 5-state CAD table fixtures, contextual action drawer, 5-stage allocation pipeline visualizer, CSV export, daily host run-sheet, and live activity stream.

Both interfaces share 100% of the C++ business logic, scheduling engine, and file persistence layer (`tables.txt`, `bookings.txt`).

---

## ⚡ Quick 1-Click Launch (Windows)

Simply double-click **`launch.bat`** (or run `.\start.ps1` in PowerShell):
- Automatically builds `system.exe` if not present.
- Starts the embedded background server daemon on port `8080`.
- Launches your default web browser to **`http://localhost:8080`**.

---

## 📌 Features

### 🏢 Table & Spatial Floor Management
- **Interactive Spatial Floor Layout**: Multi-zone architectural blueprint (Main Dining Room, VIP Imperial Suite, Couples Alcove, Grand Banquet Room).
- **Realistic CAD Table Geometries**: Round bistro 2-tops, leather 4-top booths, hexagonal 6-top VIP suites, and banquet long tables with symmetrical chair fixtures.
- **5-State Operational System**: `Available` (Green), `Reserved` (Blue), `Seated` (Purple), `Needs Cleaning` (Amber), and `Maintenance` (Slate).
- **Contextual Table Details Drawer**: Slide-out action drawer to seat walk-in guests, flip maintenance status, release occupied tables, and view active party information.
- **Interactive Layout Customizer**: "Edit Layout" mode to configure table zones and capacities.

### 📅 Reservation & Booking Management
- **Smart Best-Fit Table Allocation**: Automatically assigns the table with the smallest adequate capacity (`capacity >= party size`) that has no scheduling conflicts for the requested date and time slot.
- **Allocation Pipeline Visualizer**: Animates the internal 5-stage allocation algorithm step-by-step:
  `[Input Validation] -> [Slot Check] -> [Conflict Scan] -> [Best-Fit Match] -> [File Persist]`.
- **Conflict-Free Scheduling**: Precise slot-based conflict detection preventing double-booking of any table for the same date and time.
- **Multi-Criteria Search & Filter**: Search by unique **Booking ID**, **Guest Name** substring, or **Reservation Date**.
- **Shift Manifest CSV Export & Daily Host Run-Sheet**: 1-click CSV download and print-ready daily manifest run-sheet for head chef/host stand.
- **Official VIP Dining Pass**: Formatted printable booking receipt with QR seal.

### 📊 Dashboard & System Analytics
- **Live Metrics Ribbon**: Real-time gauge of Total Installed Tables, Seated Covers, Active Reservations, and Shift Revenue Yield Forecast.
- **Live Operational Activity Stream**: Real-time event timeline logging every creation, cancellation, table modification, and conflict check.

### 💾 Robust Persistence & Network Architecture
- **Zero External Runtime Dependencies**: Embedded lightweight C++ HTTP server (`winsock2.h` on Windows / POSIX sockets) compiled directly into the binary. No Node.js, Python, or npm required.
- **Pipe-Delimited File Storage**: Automatically serializes tables and bookings to `tables.txt` and `bookings.txt`.
- **Exception Safety**: Guarded against corrupted or malformed data files with `try-catch` blocks.

---

## 📚 Core OOP Concepts Demonstrated

| Concept | Implementation in Code |
|---|---|
| **Encapsulation & Data Hiding** | All attributes in `Table` and `Booking` are `private`, accessible only via invariant-preserving constructors, getters, and validated mutators. |
| **Abstraction** | Both Console Menus and REST API handlers interact with `BookingManager` without needing to know internal container details or file serialization mechanisms. |
| **Composition** | `BookingManager` owns and manages collections of `Table`, `Booking`, and `ActivityLog` objects. |
| **Const-Correctness** | Non-mutating methods and getters are marked `const`, and non-primitive arguments are passed as `const Type &`. |
| **Separation of Concerns** | Distinct modular tiers: Entity Tier (`Table`, `Booking`), Logic Tier (`BookingManager`), Bridge Tier (`Server`), Persistence Tier (`FileHandler`), and Presentation Tier (`main`, `Utils`, `Code/web/`). |
| **Namespace Cleanliness** | Header files (`.h`) contain zero global namespace pollution (`using namespace std;` strictly avoided in headers). |

> 📖 **Detailed Defense Guide**: See **[`VIVA_DEFENSE_GUIDE.md`](VIVA_DEFENSE_GUIDE.md)** for full academic OOP breakdown, Big-O algorithmic proofs, and likely examiner questions.

---

## 📂 Project Structure

```text
Restaurant-Booking-Table/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI multi-platform workflow
├── Code/
│   ├── Table.h                # Table entity declarations & encapsulation
│   ├── Table.cpp              # Table method implementations & formatting
│   ├── Booking.h              # Booking entity declarations & domain queries
│   ├── Booking.cpp            # Booking method implementations & receipts
│   ├── BookingManager.h       # Controller, scheduling engine & API methods
│   ├── BookingManager.cpp     # Allocation, search, conflict detection logic
│   ├── FileHandler.h          # Persistence interface declarations
│   ├── FileHandler.cpp        # Exception-safe file parser & serializer
│   ├── Server.h               # Embedded HTTP companion server header
│   ├── Server.cpp             # Embedded C++ HTTP/REST server & router
│   ├── Utils.h                # Console, input validation & formatting helpers
│   ├── Utils.cpp              # Stream sanitization & UI helper routines
│   ├── main.cpp               # Entry point and interactive console menus
│   ├── test_suite.cpp         # Automated unit & integration test runner
│   ├── tables.txt             # Table persistent records
│   ├── bookings.txt           # Booking persistent records
│   ├── system.exe             # Compiled release executable
│   └── web/                   # Visual Companion Web Application
│       ├── index.html         # Visual platform layout & spatial floor plan
│       ├── style.css          # Design system tokens, light/dark mode & CAD styles
│       └── app.js             # State manager, spatial canvas & dual sync engine
├── launch.bat                 # 1-Click Windows batch launcher
├── start.ps1                  # 1-Click PowerShell launcher
├── VIVA_DEFENSE_GUIDE.md      # Academic Viva defense & OOP analysis guide
├── PRD.md                     # Product Requirements Document
├── PRODUCT_PLAN.md            # Product Scope & Release Roadmap
├── TECHNICAL_ARCHITECTURE.md  # System Design & Class Architecture
├── SECURITY_SPECIFICATION.md  # Threat Modeling & Input Sanitization
├── FRONTEND_SPECIFICATION.md  # Console UI & Visual Platform Specifications
├── FEATURE_TICKETS.md         # Engineering Tickets & Acceptance Criteria
├── TEST_PLAN.md               # Test Matrix & Verification Cases
├── PERFORMANCE_PLAN.md        # Theoretical Complexity & Resource Plan
├── DATA_MODEL.md              # Data Schemas & Storage Invariants
├── DECISION_LOG.md            # Architectural Decision Records
├── PROJECT_STATE.md           # Operational Checkpoint & Status
└── README.md                  # Project Documentation & Setup Guide
```

---

## ⚙️ Compilation & Running

### Option 1: Quick Launcher (Recommended)
Double-click `launch.bat` or run:
```powershell
.\start.ps1
```

### Option 2: Manual Terminal Compilation
```bash
cd Code
g++ -Wall -Wextra -Wpedantic -std=c++17 main.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o system.exe
```

- **Run Console Interface**:
  ```bash
  .\system.exe
  ```
- **Run Visual Companion Server**:
  ```bash
  .\system.exe --serve
  ```
  Open `http://localhost:8080` in your browser.

### Option 3: Automated Test Runner
```bash
cd Code
g++ -Wall -Wextra -Wpedantic -std=c++17 test_suite.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o test_suite.exe
.\test_suite.exe
```

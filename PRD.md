# Product Requirements Document (PRD) — Core & Visual Companion

## 1. Executive Summary
- **Project Name**: Restaurant Booking Table System (Console Core & Visual Companion)
- **Origin**: 2nd-Semester BSCS Object-Oriented Programming (OOP) C++ Project
- **Architecture Principle**: **"One Source of Truth, Multiple Interfaces"**
  - **Interface A**: Fast, accessible, stream-safe C++ Console Terminal Application.
  - **Interface B**: Rich, real-time Visual Companion Web Interface running locally via an embedded C++ HTTP server.
- **Core Value**: Enables restaurant managers and students to observe and interact with the same underlying C++ scheduling engine, smart allocation algorithms, conflict detection, and file persistence through both terminal and interactive visual floor layouts.

---

## 2. Target Personas & Use Cases

1. **Host / Receptionist (Visual Floor Mode)**:
   - Views an interactive 2D table layout of the restaurant.
   - Filters tables by Date and Time Slot to instantly spot occupied vs. available tables.
   - Books reservations with step-by-step visual feedback of the allocation algorithm.
2. **Terminal Operator / Power User (Console Mode)**:
   - Performs rapid keyboard-driven booking, search, table editing, and cancellation.
3. **Academic Evaluator / OOP Student**:
   - Observes clean C++ OOP architecture: Entity Models (`Table`, `Booking`), Controller (`BookingManager`), Embedded Server (`Server`), and File Persistence (`FileHandler`).

---

## 3. Core Functional Requirements

### 3.1 Shared C++ Core (Source of Truth)
- **FR-C1**: Both Console and Visual Companion operate on the exact same in-memory `BookingManager` instance and persistent text files (`tables.txt`, `bookings.txt`).
- **FR-C2**: All business rules (best-fit allocation, invariant checks, capacity matching, conflict detection) reside exclusively in C++ and are never re-implemented in the frontend.

### 3.2 Visual Companion Capabilities
- **FR-V1 Interactive Restaurant Floor Layout**:
  - Visual representation of physical restaurant tables styled by category (Couple, Family Booth, VIP Suite, Banquet, Outdoor Patio).
  - Live status indicators: `Available` (Green), `Occupied for selected slot` (Amber/Red), and `Maintenance` (Gray).
  - Clickable table inspection modal showing seating capacity and assigned reservations.
- **FR-V2 Step-by-Step Allocation Flow Visualizer**:
  - Animates the booking pipeline:
    `[Input Received] -> [Input Validation] -> [Slot Conflict Check] -> [Best-Fit Capacity Search] -> [Table Assigned] -> [File Persisted] -> [Receipt Generated]`.
- **FR-V3 Dynamic Slot Availability Matrix**:
  - Interactive Date picker and Time Slot selector (12 PM, 2 PM, 4 PM, 6 PM, 8 PM, 10 PM, Custom).
  - Instantly recalculates floor layout availability without page reloads.
- **FR-V4 Live Activity & Audit Timeline**:
  - Timestamped operational log recording every creation, conflict check, table assignment, and cancellation.
- **FR-V5 Visual Search & Reservation Management**:
  - Tabular reservation view with instant filtering by Guest Name, Booking ID, or Date, plus 1-click cancellation with confirmation dialogue.
- **FR-V6 System Dashboard & Occupancy Metrics**:
  - Real-time gauge of total seating capacity, active bookings, slot occupancy rate, and table category distribution.

---

## 4. Non-Functional & Operational Requirements
- **Zero External Dependencies**: Embedded directly inside the C++ application using standard sockets (`winsock2.h` / POSIX). No Node.js, Python, or cloud services required.
- **Localhost Bound**: The server binds strictly to `127.0.0.1:8080` to prevent unintended network exposure.
- **Offline First**: The web companion operates 100% offline using standard HTML5, CSS3, and Vanilla JavaScript.
- **Instant Synchronization**: State changes made in the visual interface instantly update the C++ memory state and data files on disk.

# Visual Companion & Console UI Specification

## 1. Visual Identity & Design System

The **The Royal Spice Visual Companion** is a benchmark-level restaurant operations platform inspired by leading hospitality systems (**SevenRooms, Resy OS, Toast Tables, OpenTable Premier**).

### 1.1 Dual Theme Tokens (Light & Dark Mode)
- **Light Surface**: `#ffffff` on an ultra-clean slate canvas `#f8fafc` with subtle borders `#e2e8f0` and soft layered shadows.
- **Dark Surface**: `#0f172a` on obsidian `#090e17` with subtle borders `#1e293b`.
- **Primary Brand / Warm Gold**: `#d97706` / `#b45309` (Warm Cognac / Gold hospitality accent).
- **Typography**: Royal `Cinzel` serif headers paired with modern `Plus Jakarta Sans` body and `JetBrains Mono` for operational numbers/codes.

### 1.2 5-State Semantic System
- 🟢 **Available** (`#16a34a` / `#dcfce7`): Table is free and ready to seat/book.
- 🔵 **Reserved** (`#2563eb` / `#dbeafe`): Upcoming reservation assigned with guest badge and time.
- 🟣 **Seated / Dining** (`#7c3aed` / `#ede9fe`): Active party dining with elapsed countdown.
- 🟡 **Needs Cleaning** (`#d97706` / `#fef3c7`): Bussing / sanitizing before next turn.
- ⚫ **Maintenance / Blocked** (`#64748b` / `#f1f5f9`): Offline for service.

---

## 2. Interactive Spatial Floor Plan & CAD Geometries

Tables are rendered as architectural dining fixtures across multiple zones (**Main Dining Room**, **VIP Imperial Suite**, **Couples Alcove**, **Grand Banquet Room**):
- **Couple Table (2 Guests)**: Circular table with 2 opposing rounded bucket seats and center candle setting.
- **Family Booth (4 Guests)**: Rectangular table with comfortable booth-style seating.
- **VIP Suite (6 Guests)**: Hexagonal gold-inlaid table with 6 cushioned armchairs.
- **Banquet Table (8 Guests)**: Long executive dining table with 8 symmetrical seats.

Each table fixture displays:
- Table Badge (`#T-01`, `#T-02`, etc.)
- Capacity badge (`2 Guests Max`, `4 Guests Max`)
- Current status pill (`AVAILABLE`, `RESERVED`, `BLOCKED`)
- Dynamic guest name and countdown timers when occupied.

---

## 3. Contextual Table Details Drawer (SevenRooms Pattern)

Clicking any table pod opens a slide-out right drawer:
- **Table Specifications**: Capacity, Dining Category, Selected Slot, Estimated Turnover.
- **Active Reservation Summary**: Guest Name, Booking Reference ID, Party Size, and Occasion.
- **1-Click Actions**:
  - `Seat Guest Here` (opens express walk-in dialog with pre-filled table).
  - `Toggle Maintenance` (instantly flips operational status).
  - `Release / Mark Cleaned` (clears seated table and resets status).

---

## 4. Allocation Pipeline Visualizer (Step-by-Step Flow)

When a reservation is created, the system animates a real-time 5-stage pipeline trace:
1. `Input Boundary Validation`: Validating guest parameters.
2. `Slot Boundary Verification`: Checking date & time boundaries.
3. `Conflict Detection Scan`: Checking for existing slot collisions.
4. `Smart Best-Fit Matching`: Selecting smallest suitable capacity.
5. `Data Persistence Engine`: Committing to `tables.txt` & `bookings.txt`.

---

## 5. Official Dining Reservation Pass (Printable)

A gold-crested reservation pass with reference number, assigned table, customer name, party size, reservation date, time slot, and QR verification seal with dedicated `@media print` styling for physical paper or PDF export.

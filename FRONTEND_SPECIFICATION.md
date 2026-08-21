# Visual Companion & Console UI Specification

## 1. Visual Identity & Theme (Visual Companion)

The **Visual Companion** adopts an elegant, contemporary restaurant management aesthetic designed for clarity, warmth, and operational focus.

### 1.1 Color Palette
- **Background Deep Canvas**: `#0b0f19` (Obsidian Navy)
- **Surface Cards & Modals**: `#111827` (Charcoal Slate) with subtle border `#1f2937`
- **Accent Primary / Gold**: `#f59e0b` / `#d97706` (Warm Amber Hospitality Accent)
- **Status Available / Free**: `#10b981` (Emerald Green)
- **Status Occupied / Reserved**: `#f43f5e` (Rose Coral)
- **Status Maintenance / Offline**: `#64748b` (Slate Gray)
- **Text Primary**: `#f8fafc` (Clean Off-White)
- **Text Secondary**: `#94a3b8` (Muted Slate)

---

## 2. Interactive Floor Layout Components

Tables are represented as realistic architectural dining fixtures:
- **Couple Table (2 Guests)**: Circular table with 2 opposing rounded chairs.
- **Family Booth (4 Guests)**: Rectangular table with comfortable booth-style seating.
- **VIP Suite (6 Guests)**: Hexagonal / curved table with 6 cushioned armchairs.
- **Banquet Table (8 Guests)**: Long executive dining table with 8 symmetrical seats.

Each table displays:
- Table Badge (`T-01`, `T-02`, etc.)
- Capacity badge (`2 seats`, `4 seats`)
- Current status pill (`FREE` or `RESERVED`)
- Hover effect with elevation and detailed tooltip.

---

## 3. Allocation Pipeline Visualizer (Step-by-Step Flow)

When a reservation is created, the system displays an animated multi-stage pipeline:

```text
+-------------------+     +-------------------+     +-------------------+
|  1. INPUT PARSE   | --> | 2. DATE/TIME CHECK| --> | 3. CONFLICT SCAN  |
|  Guest: Qamar (4) |     | 24/05/2026 8:00PM |     | Scan active slots |
+-------------------+     +-------------------+     +-------------------+
                                                              |
                                                              v
+-------------------+     +-------------------+     +-------------------+
| 6. RECEIPT ISSUED | <-- | 5. DISK PERSIST   | <-- | 4. BEST-FIT MATCH |
| Confirmation #101 |     | Save tables.txt   |     | Table 2 (4 seats) |
+-------------------+     +-------------------+     +-------------------+
```

Each stage lights up with a smooth transition, checkmark icon, and real-time execution feedback.

---

## 4. Layout Architecture (Single Page Dashboard)

```text
+-------------------------------------------------------------------------------+
| TOP BAR: System Title | Server Status (Live) | Selected Slot | Launch Console |
+-------------------------------------------------------------------------------+
| METRICS BAR: [Total Tables] [Total Capacity] [Active Bookings] [Slot Occupancy]
+-------------------------------------------------------------------------------+
| LEFT PANE (60%): Interactive Floor Layout    | RIGHT PANE (40%):               |
| - Floor View Filters (Date & Time Picker)   | - Instant Booking Wizard        |
| - Visual Dining Room Grid                   | - Allocation Pipeline Tracker   |
| - Table Details Modal                       | - Live Operational Timeline     |
+-------------------------------------------------------------------------------+
| BOTTOM PANEL: Active Reservations Table with Instant Search & 1-Click Cancel  |
+-------------------------------------------------------------------------------+
```

---

## 5. Micro-Animations & Transitions
- Table selection pulse animation (`keyframes: tablePulse`).
- Smooth badge color morphing when date/time slot changes.
- Pipeline node progress bar animation.
- Toast notifications for successes, errors, and cancellations.

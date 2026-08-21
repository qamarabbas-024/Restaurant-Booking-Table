# UI / Console Experience Specification

## 1. Design Philosophy
The user interface is a purposeful, polished, and structured terminal console application. It uses clear visual hierarchy, aligned ASCII borders, formatted columnar grids (`std::setw`), consistent headers, and actionable feedback messages (`[SUCCESS]`, `[ERROR]`, `[INFO]`).

---

## 2. Visual Layout & Typography

### 2.1 Banners & Framing
Every screen begins with a clean header:
```text
================================================================================
                     RESTAURANT TABLE BOOKING SYSTEM
================================================================================
```

Submenus and sections use clear sectional headers:
```text
----------------------------- TABLE MANAGEMENT ---------------------------------
```

### 2.2 Table Grid Formatting
Tables and bookings are printed with formatted headers and column widths:

**Tables View**:
```text
+----------+------------+----------------------+--------------------+
| Table ID | Capacity   | Type                 | Status             |
+----------+------------+----------------------+--------------------+
| 1        | 2 Guests   | Couple Table         | Available          |
| 2        | 4 Guests   | Family Booth         | Available          |
| 3        | 6 Guests   | VIP Suite            | Available          |
| 4        | 8 Guests   | Banquet Table        | Available          |
+----------+------------+----------------------+--------------------+
```

**Bookings View**:
```text
+--------+----------+----------------------+--------+------------+----------+
| ID     | Table ID | Guest Name           | Guests | Date       | Time     |
+--------+----------+----------------------+--------+------------+----------+
| 101    | 2        | Qamar Abbas          | 4      | 24/05/2026 | 8:00 PM  |
| 102    | 3        | Sarah Jenkins        | 5      | 24/05/2026 | 6:00 PM  |
+--------+----------+----------------------+--------+------------+----------+
```

### 2.3 Booking Receipt Format
Upon successful reservation creation or search hit:
```text
================================================================================
                             BOOKING CONFIRMATION
================================================================================
  Booking ID   : 101
  Guest Name   : Qamar Abbas
  Table Number : Table 2 (Family Booth, 4 Guests)
  Party Size   : 4 Guests
  Date         : 24/05/2026
  Time Slot    : 8:00 PM
  Status       : CONFIRMED
================================================================================
```

---

## 3. Menu Navigation & Flow

### 3.1 Main Menu
```text
========================== RESTAURANT SYSTEM ==========================
  1. System Dashboard
  2. Table Management
  3. Booking Management
  4. Save & Exit
=======================================================================
Enter Choice (1-4): 
```

### 3.2 Table Management Submenu
```text
-------------------------- TABLE MANAGEMENT ---------------------------
  1. View All Tables
  2. Check Availability by Date & Time Slot
  3. Add New Table
  4. Update Table (Capacity / Type)
  5. Delete Table
  0. Back to Main Menu
-----------------------------------------------------------------------
Enter Choice (0-5): 
```

### 3.3 Booking Management Submenu
```text
------------------------- BOOKING MANAGEMENT --------------------------
  1. Create New Booking (Smart Table Assignment)
  2. View All Bookings
  3. Search Bookings (by ID, Guest Name, or Date)
  4. Cancel Booking
  0. Back to Main Menu
-----------------------------------------------------------------------
Enter Choice (0-4): 
```

---

## 4. Feedback & Status Messages
- **Success**: `[SUCCESS] Table 5 added successfully!`
- **Error**: `[ERROR] Invalid input! Number of guests must be greater than 0.`
- **Warning / Notice**: `[NOTICE] No available tables found matching 6 guests for 24/05/2026 at 8:00 PM.`
- **Pause Prompt**: `Press Enter to continue...` (guaranteed single-enter resume).

# Product Plan & Scope

## 1. Product Positioning & Strategy
The Restaurant Booking Table system is a lightweight, educational, console-based desktop application designed for restaurant managers and receptionists. The goal is to provide a reliable, intuitive table reservation workflow that demonstrates sound C++ Object-Oriented Programming without unnecessary external bloat.

---

## 2. Feature Classification & Scope Breakdown

### A. Required Fixes (Non-Negotiable Baseline Quality)
1. **Per-Slot Table Availability**: Fix the logic bug where reserving a table permanently sets its status to `"Reserved"` across all other dates and times.
2. **`cin` Stream & Buffer Management**: Eliminate buffer desynchronization in `safeInt()`, `safeLine()`, and `pauseScreen()`.
3. **Multi-Word String Handling**: Allow multi-word guest names and multi-word table types without truncating or corrupting files.
4. **Exception-Safe File Parsing**: Safeguard `FileHandler` against malformed records or empty lines with `try-catch` around numeric parsing.
5. **Basic Input Validation**: Prevent negative or zero guest counts, negative table IDs, and empty strings.

### B. Important Improvements (Elevating OOP & Core Usability)
1. **OOP Encapsulation**: Make all data members in `Table` and `Booking` `private`, exposing clean getters, validated setters, and const-correct member methods.
2. **Namespace Hygiene**: Remove `using namespace std;` from all header files (`.h`), properly qualifying standard types (`std::string`, `std::vector`, `std::ostream`).
3. **Flexible Search**: Expand `searchBooking()` to support search by Booking ID, Guest Name (case-insensitive substring match), and Date.
4. **Enhanced Console UX**: Implement clean, aligned ASCII tabular formatting using `std::setw` and `std::left` for tables and booking lists.
5. **Deletion Safeguards**: Add confirmation dialogs (`[y/N]`) before canceling bookings or removing tables.

### C. Good New Features (High Value, Zero Bloat)
1. **Dynamic Slot Availability Query**: Dedicated option in Table Management to check table availability for a specific date and time slot.
2. **Table Modification & Safe Deletion**: Ability to edit existing table capacity/type and remove tables that have no active bookings.
3. **Rich Dashboard Metrics**: Display total seating capacity, active reservation count, and table count by category.

### D. Optional Polish (Visual & Code Elegance)
1. **Consistent Console Banners & Framing**: Uniform headers, section dividers, and feedback alerts (`[SUCCESS]`, `[ERROR]`, `[INFO]`).
2. **Educational Code Comments**: Comprehensive inline annotations explaining OOP design patterns, const-correctness, composition, and stream safety.

### E. Future Ideas (Explicitly Deferred)
- Point-of-Sale (POS) & Food Menu Ordering
- Real-time Visual Floor Map (GUI-dependent)
- Customer Loyalty / Phone Number Database
- SQL / Cloud Database Migration

---

## 3. Release & Milestone Gates

```
+-------------------------------------------------------------------------+
| Milestone 1 (V1) - Foundation, Correctness & Resilient Persistence      |
| -> Fix slot conflict bug, buffer bugs, exception-safe file handler,    |
|    proper encapsulation & namespace hygiene.                            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Milestone 2 (V2) - Enhanced Usability, Search & Table Operations        |
| -> Multi-criteria search, table edit/delete, slot query, cancellation   |
|    confirmation, tabular ASCII formatting.                              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Milestone 3 (V3) - Polish, Testing & Comprehensive Documentation        |
| -> Rich dashboard metrics, verification test suite, updated README,     |
|    educational OOP documentation.                                       |
+-------------------------------------------------------------------------+
```

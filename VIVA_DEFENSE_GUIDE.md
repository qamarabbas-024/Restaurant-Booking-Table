# 🎓 Academic Viva & OOP Defense Guide
## The Royal Spice — Restaurant Table Booking & Management System

This document is an academic cheat sheet and defense companion for 2nd-Semester BSCS Object-Oriented Programming (OOP) evaluations, presentations, and code walkthroughs.

---

## 1. 🏛️ Core OOP Principles & Implementation Map

| OOP Principle | Concept Definition | Concrete Implementation in Codebase |
| :--- | :--- | :--- |
| **Encapsulation** | Bundling data with the methods that operate on that data and restricting direct access to object internals. | `Table.h` / `Booking.h`: All state variables (`id`, `capacity`, `guestName`, `time`, etc.) are declared `private`. Access is granted strictly through validated getters and invariant-preserving mutators (`setCapacity()`, `setStatus()`). |
| **Data Abstraction** | Hiding internal implementation complexities and exposing only high-level, intuitive interfaces. | `BookingManager` exposes simple semantic methods (`bookTable()`, `cancelBooking()`, `searchByGuest()`). Callers (Console UI, REST API, Test Runner) interact with the booking engine without needing to know internal container details or serialization logic. |
| **Composition** | Modeling "has-a" relationships where a container object owns and manages the lifecycle of other objects. | `BookingManager` **has-a** `std::vector<Table>`, **has-a** `std::vector<Booking>`, and **has-a** `std::deque<ActivityLog>`. Destroying `BookingManager` cleanly destroys its constituent components. |
| **Const-Correctness** | Enforcing read-only guarantees at compile time for methods and parameters that do not mutate state. | All query getters (`getId() const`, `isConflict() const`, `searchByDate() const`) and non-mutating parameter references (`const std::string& date`, `const Table& table`) prevent accidental mutations. |
| **Separation of Concerns** | Decoupling domain logic, data persistence, network bridging, and presentation. | **Entity Tier**: `Table.h`, `Booking.h`<br>**Logic Tier**: `BookingManager.h`<br>**Persistence Tier**: `FileHandler.h`<br>**Bridge Tier**: `Server.h`<br>**Presentation Tier**: `main.cpp`, `Utils.h`, `Code/web/` |
| **Single Source of Truth** | Sharing a single authoritative scheduling engine across diverse user interfaces. | Both the C++ Console Terminal (`main.cpp`) and the Web Companion (`Code/web/`) interact with the same underlying `BookingManager` and file storage (`tables.txt`, `bookings.txt`). |

---

## 2. 🧮 Algorithmic Complexity & Mathematical Proofs

### A. Smart Best-Fit Table Allocation (`findBestTable`)
- **Objective**: Assign the table with the smallest adequate capacity that fits the party size while avoiding double-booking.
- **Algorithm**:
  1. Filter tables where `table.getCapacity() >= guestCount` and `table.getStatus() == "Available"`.
  2. For each candidate, check `isConflict(candidate.getId(), date, time)`.
  3. Among conflict-free candidates, select the table that minimizes `(table.getCapacity() - guestCount)`.
- **Time Complexity**:
  $$\mathcal{O}(N \cdot M)$$
  where $N$ is the number of installed tables and $M$ is the number of scheduled reservations.
  *(For standard restaurant fleets of $N \le 100$ and $M \le 1000$, this executes in $< 0.1\text{ ms}$).*
- **Space Complexity**: $\mathcal{O}(1)$ auxiliary memory (in-place iterator comparison).

### B. Slot Conflict Detection (`isConflict`)
- **Algorithm**:
  A conflict exists if and only if there exists any active reservation $B$ such that:
  $$\text{match}(B) \iff \Big(B.\text{tableId} = T_{\text{req}}\Big) \land \Big(B.\text{date} = D_{\text{req}}\Big) \land \Big(B.\text{time} = S_{\text{req}}\Big)$$
- **Time Complexity**: $\mathcal{O}(M)$ linear scan over reservations.

---

## 3. 🛡️ Robustness, Error Handling & Invariant Enforcement

| Vulnerability / Edge Case | Defense Mechanism in Code |
| :--- | :--- |
| **Corrupted Numeric File Input** | `FileHandler::loadBookings()` and `loadTables()` wrap token conversions in `std::stoi()` inside `try-catch (const std::exception&)` blocks, logging warnings and skipping corrupted rows without crashing. |
| **Zero or Negative Capacities** | `Table::setCapacity()` and interactive input validators reject any capacity $\le 0$. |
| **Duplicate Table IDs** | `BookingManager::addTable()` checks `getTableById()` before insertion and rejects duplicates. |
| **Deleting Tables with Active Bookings** | `BookingManager::deleteTable()` checks if any reservation exists on the table and blocks deletion. |
| **Terminal Stream Corruption (e.g. typing "abc" for integer)** | `Utils::getIntInput()` checks `std::cin.fail()`, calls `std::cin.clear()`, and discards remaining characters with `std::cin.ignore(10000, '\n')`. |

---

## 4. 🎤 Likely Examiner Questions & Model Answers

### Q1: *"Why did you create a dual-interface architecture instead of just a console app?"*
> **Answer**: *"We wanted to demonstrate the core OOP principle of **Separation of Concerns**. By isolating our business logic and scheduling algorithms inside `BookingManager`, we proved that the same C++ engine can seamlessly drive a fast keyboard console interface and a visual web operations dashboard via an embedded HTTP socket server without changing a single line of business logic."*

### Q2: *"How do you handle persistence without external database libraries?"*
> **Answer**: *"We implemented `FileHandler`, an exception-safe pipe-delimited (`|`) file parser and serializer that persists tables to `tables.txt` and bookings to `bookings.txt`. It features delimiter sanitization, multi-word string support, and automatic corrupted record recovery."*

### Q3: *"How does your Smart Best-Fit algorithm prevent table wastage?"*
> **Answer**: *"Rather than picking the first available table, our algorithm calculates the seat delta `(capacity - guests)` and selects the global minimum among all conflict-free tables for that specific date and time slot. This ensures a 2-person couple is assigned a 2-seater rather than locking up an 8-person banquet table."*

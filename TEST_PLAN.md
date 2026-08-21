# Test Plan & Verification Strategy

## 1. Objectives
Ensure correctness, stability, memory safety, and cross-platform reliability across all interactive flows, edge cases, and file I/O operations.

---

## 2. Test Matrix

| Test ID | Test Category | Description | Expected Outcome |
|---|---|---|---|
| **TC-01** | Compilation | Strict warning build (`-Wall -Wextra -Wpedantic -std=c++17`) | 0 errors, 0 warnings |
| **TC-02** | Persistence | Fresh start with non-existent `tables.txt` / `bookings.txt` | Seeds default tables, creates files gracefully on save |
| **TC-03** | Persistence | Corrupt data file test (inserting invalid characters in numeric fields) | Skips/handles corrupted line without crashing |
| **TC-04** | Table Mgmt | Add table with duplicate ID | Error displayed, table rejected |
| **TC-05** | Table Mgmt | Add table with 0 or negative capacity | Error displayed, rejected |
| **TC-06** | Table Mgmt | Add table with multi-word type ("Outdoor Patio") | Successfully stored and retrieved with spaces intact |
| **TC-07** | Table Mgmt | Delete table with active bookings | Warning displayed, deletion blocked |
| **TC-08** | Booking | Smart Allocation: Book for 2 guests when tables of 2, 4, 6 exist | Table of capacity 2 selected (best-fit) |
| **TC-09** | Booking | Conflict Check: Book Table 1 on Date A, Time X | Booking succeeds |
| **TC-10** | Booking | Conflict Check: Book Table 1 on Date B, Time X | Booking succeeds (independent dates) |
| **TC-11** | Booking | Conflict Check: Attempt duplicate booking on Table 1, Date A, Time X | System assigns next best available table or reports full |
| **TC-12** | Booking | Book with 0 or negative guests | Error displayed, input re-prompted |
| **TC-13** | Booking | Blank guest name entry | Error displayed, input re-prompted |
| **TC-14** | Search | Search by exact Booking ID | Correct receipt displayed |
| **TC-15** | Search | Search by Guest Name substring ("Qam" matches "Qamar") | Matching bookings listed in table |
| **TC-16** | Search | Search non-existent guest name / ID | "No bookings found" message displayed |
| **TC-17** | Cancellation | Cancel booking and select 'n' on confirmation | Booking preserved |
| **TC-18** | Cancellation | Cancel booking and select 'y' on confirmation | Booking removed, slot freed |
| **TC-19** | Stream / UI | Enter alphabet characters on integer menus | Stream cleared, re-prompted without infinite loop |
| **TC-20** | Stream / UI | Press enter on `pauseScreen()` | Instantly returns on single Enter press |

---

## 3. Execution Method
1. **Automated Compiler Verification**: Build with strict flags.
2. **Interactive Manual Matrix Validation**: Execute each test case sequentially in console environment.
3. **Data Integrity Audit**: Inspect resulting `tables.txt` and `bookings.txt` to verify flawless format and delimiters.

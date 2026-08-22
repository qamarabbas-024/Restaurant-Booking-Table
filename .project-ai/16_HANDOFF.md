# AI / Developer Handoff: The Royal Spice

## 1. Project Overview
- **Project**: The Royal Spice — Restaurant Table Booking & Management System
- **Purpose**: Academic BSCS 2nd Semester OOP C++ Project augmented with a Production-Grade Visual Web Companion.
- **Core Vision**: Unified business logic in C++17 with two first-class interfaces (C++ Console Terminal UI + Local Web Visual Companion on `http://localhost:8080`).

---

## 2. Technical Stack & Architecture
- **Language**: C++17 (`Table`, `Booking`, `BookingManager`, `FileHandler`, `Utils`, `Server`, `test_suite`).
- **Server**: Embedded lightweight HTTP REST server on port 8080 (`winsock2.h` on Windows / POSIX sockets). Zero external runtime dependencies.
- **Frontend**: Vanilla HTML5 + Vanilla CSS3 + Modern ES6 JavaScript.
- **Persistence**: Plain text files (`tables.txt`, `bookings.txt`) with pipe delimiters (`|`).
- **Compiler**: MinGW `g++ -std=c++17 -lws2_32`.

---

## 3. Important Invariants & Rules
- **Do NOT push to GitHub** without explicit user instruction (*"don't push anything until i say"*).
- **Zero External Dependencies**: Do not introduce Node.js, Python, or npm package managers.
- **Single Source of Truth**: All booking and table mutations must pass through `BookingManager` and persist to disk.

---

## 4. How to Run & Test
- **Compile & Run Test Suite**:
  ```bash
  g++ -Wall -Wextra -Wpedantic -std=c++17 test_suite.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o test_suite.exe; .\test_suite.exe
  ```
- **Compile & Launch Visual Server**:
  ```bash
  g++ -Wall -Wextra -Wpedantic -std=c++17 main.cpp Table.cpp Booking.cpp BookingManager.cpp FileHandler.cpp Utils.cpp Server.cpp -lws2_32 -o system.exe; .\system.exe --serve
  ```
- **Web URL**: `http://localhost:8080`

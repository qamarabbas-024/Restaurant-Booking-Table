# Security & Risk Specification

## 1. Context & Threat Model

Although the Restaurant Booking Table system is a standalone, single-user C++ console application running locally, reliable input validation and data sanitization are essential to prevent runtime crashes, stream corruption, resource exhaustion, and data file tampering.

---

## 2. Identified Risks & Mitigations

### 2.1 Input Stream Injection & Buffer Overflow
- **Threat**: Entering very large strings, characters when integers are expected, or control characters could stall the `std::cin` stream or cause memory exhaustion.
- **Mitigation**:
  - `safeInt()` and `safePositiveInt()` clear the stream failure bit via `std::cin.clear()` and exhaust bad characters with `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n')`.
  - `safeStringInput()` uses `std::getline` with explicit length bounds and string trimming.

### 2.2 Numeric Conversion Exceptions (`std::invalid_argument` / `std::out_of_range`)
- **Threat**: Reading a corrupted `bookings.txt` with non-numeric text in place of `bookingId` or `tableId` could cause uncaught exceptions from `std::stoi()`, immediately terminating the application.
- **Mitigation**:
  - Wrap all conversions in safe parsing helper functions with `try-catch (const std::exception &e)` blocks.
  - Gracefully skip or flag corrupt records without terminating the program.

### 2.3 Data Delimiter Collision
- **Threat**: If a user enters the pipe character (`|`) inside a guest name or table type, reading the pipe-delimited file later could misalign fields.
- **Mitigation**:
  - Sanitize input strings to strip or replace pipe characters (`|`) before writing to file.

### 2.4 Race Conditions & File Locking
- **Threat**: Multiple terminal instances writing to `tables.txt` simultaneously.
- **Mitigation**:
  - Document that the current architecture is single-process.
  - Flush and close file handles immediately after saving operations.

### 2.5 Destructive Operation Safety
- **Threat**: Accidental deletion of tables or cancellation of customer reservations due to accidental keypresses.
- **Mitigation**:
  - Implement explicit confirmation checks (`Are you sure you want to cancel booking #X? (y/n): `) before committing deletions.
  - Block table deletion if any active bookings reference that table.

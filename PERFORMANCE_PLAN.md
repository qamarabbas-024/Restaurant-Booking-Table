# Performance & Resource Plan

## 1. Context & Scope
The Restaurant Booking Table application is an in-memory, console-based C++ program managing table seating and reservations. The target dataset is typical for a small-to-medium restaurant (10 to 50 tables, up to several hundred active or historical bookings).

---

## 2. Theoretical Complexity & Resource Analysis

| Operation | Implementation Approach | Time Complexity | Space Complexity | Status |
|---|---|---|---|---|
| Load Data | Linear File Parsing | $O(N_t + N_b)$ | $O(N_t + N_b)$ | Estimated |
| Save Data | Linear Sequential Write | $O(N_t + N_b)$ | $O(1)$ extra | Estimated |
| `isConflict` | Linear scan of bookings | $O(N_b)$ | $O(1)$ | Estimated |
| `findBestTable` | Linear scan with conflict check | $O(N_t \times N_b)$ | $O(1)$ | Estimated |
| Search by ID | Linear scan | $O(N_b)$ | $O(1)$ | Estimated |
| Search by Name | Linear scan with substring match | $O(N_b \times L_{name})$ | $O(1)$ | Estimated |
| Cancel Booking | Linear scan + vector erase | $O(N_b)$ | $O(1)$ | Estimated |

> **Note on Performance Classification**:
> - **Estimated**: Theoretical $O(N)$ bounds based on standard `std::vector` linear traversal.
> - **Unknown**: Exact execution times on target hardware, as synthetic micro-benchmarks have not been performed. For realistic restaurant dataset sizes, $O(N)$ vector traversal is well within interactive human response limits without requiring complex indexing structures.

---

## 3. Resource Efficiency Guidelines
1. **Pass-by-Const-Reference**: Avoid unnecessary deep copies of `std::string`, `Table`, and `Booking` objects by passing non-primitive arguments as `const Type &`.
2. **RAII & Memory Safety**: Rely strictly on standard container lifecycles (`std::vector`, `std::string`) to guarantee zero manual memory management or resource leaks.
3. **Stream Management**: Ensure file streams (`std::ifstream`, `std::ofstream`) are scoped locally so file descriptors close immediately upon function exit.

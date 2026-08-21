# Data Model & Storage Specification

## 1. Conceptual Model

```
+--------------------------+               1..* +--------------------------+
|          Table           | ------------------ |         Booking          |
+--------------------------+                    +--------------------------+
| - m_id: int (PK)         |                    | - m_bookingId: int (PK)  |
| - m_capacity: int        |                    | - m_tableId: int (FK)    |
| - m_type: string         |                    | - m_guestName: string    |
| - m_status: string       |                    | - m_guests: int          |
+--------------------------+                    | - m_date: string         |
                                                | - m_time: string         |
                                                +--------------------------+
```

---

## 2. Table Status Semantics

- **`m_status` in `Table`**: Represents the **physical/operational state** of the table.
  - `"Available"`: In active service and open for reservations.
  - `"Maintenance"`: Under repair or temporarily out of service (unbookable across all slots).
- **Reservation Availability**:
  - Computed on-the-fly for any `(tableId, date, time)` tuple by checking:
    `table.isOperational() && !isConflict(table.getId(), date, time)`.

---

## 3. Storage Formats

### 3.1 `tables.txt`
- Record Structure: `<id> <capacity> <type> <status>` (or delimited by `|`)
- Example:
  ```text
  1 2 Couple Available
  2 4 Family Available
  3 6 VIP Available
  4 8 Banquet Maintenance
  ```

### 3.2 `bookings.txt`
- Record Structure: `<bookingId>|<tableId>|<guestName>|<guests>|<date>|<time>`
- Example:
  ```text
  1|2|Qamar Abbas|4|24/05/2026|8:00PM
  2|3|Sarah Jenkins|6|24/05/2026|6:00PM
  ```

---

## 4. Invariants & Business Rules
1. **Uniqueness**: `id` in `tables` and `bookingId` in `bookings` must be strictly unique and positive (> 0).
2. **Referential Integrity**: Every `booking.tableId` must map to an existing table in `tables`.
3. **No Overlapping Bookings**: No two bookings can have identical `(tableId, date, time)`.
4. **Capacity Fit**: `guests <= table.capacity`.
5. **Positive Quantities**: `capacity >= 1`, `guests >= 1`.

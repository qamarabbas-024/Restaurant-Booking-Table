#include <iostream>
#include <cassert>
#include <fstream>
#include <sstream>
#include "Table.h"
#include "Booking.h"
#include "BookingManager.h"
#include "FileHandler.h"
#include "Utils.h"

void testTableEntity()
{
    std::cout << "[TEST] Table Entity & Invariants...\n";
    Table t1(1, 4, "Family Booth", "Available");
    assert(t1.getId() == 1);
    assert(t1.getCapacity() == 4);
    assert(t1.getType() == "Family Booth");
    assert(t1.getStatus() == "Available");
    assert(t1.isOperational() == true);
    assert(t1.canSeat(4) == true);
    assert(t1.canSeat(2) == true);
    assert(t1.canSeat(5) == false);

    t1.setOperationalStatus("Maintenance");
    assert(t1.isOperational() == false);
    assert(t1.canSeat(2) == false); // Out of service cannot seat

    t1.setOperationalStatus("Available");
    t1.setCapacity(6);
    assert(t1.getCapacity() == 6);
    assert(t1.canSeat(6) == true);
    std::cout << "  -> Table Entity tests PASSED.\n";
}

void testBookingEntity()
{
    std::cout << "[TEST] Booking Entity & Query Matching...\n";
    Booking b1(101, 2, "Qamar Abbas", 4, "24/05/2026", "8:00 PM");
    assert(b1.getBookingId() == 101);
    assert(b1.getTableId() == 2);
    assert(b1.getGuestName() == "Qamar Abbas");
    assert(b1.getGuests() == 4);
    assert(b1.getDate() == "24/05/2026");
    assert(b1.getTime() == "8:00 PM");

    assert(b1.conflictsWith(2, "24/05/2026", "8:00 PM") == true);
    assert(b1.conflictsWith(2, "24/05/2026", "6:00 PM") == false);
    assert(b1.conflictsWith(2, "25/05/2026", "8:00 PM") == false);
    assert(b1.conflictsWith(3, "24/05/2026", "8:00 PM") == false);

    assert(b1.matchesGuestName("qamar") == true);
    assert(b1.matchesGuestName("abbas") == true);
    assert(b1.matchesGuestName("Sarah") == false);
    assert(b1.matchesDate("24/05/2026") == true);
    assert(b1.matchesDate("25/05/2026") == false);
    std::cout << "  -> Booking Entity tests PASSED.\n";
}

void testConflictAndSmartAllocation()
{
    std::cout << "[TEST] Conflict Detection & Smart Best-Fit Allocation...\n";
    
    // Clear test files
    {
        std::ofstream tfile("tables.txt");
        tfile << "1|2|Couple Table|Available\n";
        tfile << "2|4|Family Table|Available\n";
        tfile << "3|6|VIP Table|Available\n";
        
        std::ofstream bfile("bookings.txt");
        bfile << "1|1|Alice|2|24/05/2026|8:00 PM\n";
    }

    BookingManager bm;
    bm.loadData();

    // Table 1 is booked on 24/05/2026 at 8:00 PM
    assert(bm.isConflict(1, "24/05/2026", "8:00 PM") == true);
    // Table 1 must be FREE on 24/05/2026 at 6:00 PM
    assert(bm.isConflict(1, "24/05/2026", "6:00 PM") == false);
    // Table 1 must be FREE on 25/05/2026 at 8:00 PM
    assert(bm.isConflict(1, "25/05/2026", "8:00 PM") == false);

    // Smart Allocation: 2 guests on 24/05/2026 at 8:00 PM
    // Table 1 is busy -> should allocate next best fit Table 2 (capacity 4)
    const Table *best = bm.findBestTable(2, "24/05/2026", "8:00 PM");
    assert(best != nullptr);
    assert(best->getId() == 2);

    // Smart Allocation: 2 guests on 25/05/2026 at 8:00 PM
    // Table 1 is free -> should allocate Table 1 (capacity 2, best fit!)
    const Table *bestNextDay = bm.findBestTable(2, "25/05/2026", "8:00 PM");
    assert(bestNextDay != nullptr);
    assert(bestNextDay->getId() == 1);

    // Smart Allocation: 5 guests
    // Should pick Table 3 (capacity 6)
    const Table *bestParty = bm.findBestTable(5, "24/05/2026", "8:00 PM");
    assert(bestParty != nullptr);
    assert(bestParty->getId() == 3);

    // Smart Allocation: 10 guests -> exceeds max capacity
    const Table *none = bm.findBestTable(10, "24/05/2026", "8:00 PM");
    assert(none == nullptr);

    std::cout << "  -> Conflict & Smart Allocation tests PASSED.\n";
}

void testFileHandlerRobustness()
{
    std::cout << "[TEST] FileHandler Corrupted Data & Exception Safety...\n";
    {
        std::ofstream bfile("bookings.txt");
        bfile << "1|2|Valid Guest|4|24/05/2026|8:00 PM\n";
        bfile << "corrupt|bad_id|Garbage line\n";
        bfile << "\n";
        bfile << "2|3|Second Valid|6|25/05/2026|6:00 PM\n";
    }

    std::vector<Booking> bookings;
    int nextId = 1;
    FileHandler::loadBookings(bookings, nextId);

    assert(bookings.size() == 2);
    assert(bookings[0].getBookingId() == 1);
    assert(bookings[1].getBookingId() == 2);
    assert(nextId == 3);
    std::cout << "  -> FileHandler Robustness tests PASSED.\n";
}

int main()
{
    std::cout << "==================================================\n";
    std::cout << " RUNNING AUTOMATED UNIT & INTEGRATION TESTS\n";
    std::cout << "==================================================\n";

    testTableEntity();
    testBookingEntity();
    testConflictAndSmartAllocation();
    testFileHandlerRobustness();

    std::cout << "\n>>> ALL AUTOMATED TESTS PASSED SUCCESSFULLY! <<<\n";
    return 0;
}

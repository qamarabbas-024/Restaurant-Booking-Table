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
    std::cout << "[TEST 1/6] Table Entity & Invariants...\n";
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
    assert(t1.canSeat(2) == false);

    t1.setOperationalStatus("Available");
    t1.setCapacity(6);
    assert(t1.getCapacity() == 6);
    assert(t1.canSeat(6) == true);
    std::cout << "  -> Table Entity tests PASSED.\n";
}

void testBookingEntity()
{
    std::cout << "[TEST 2/6] Booking Entity & Query Matching...\n";
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
    std::cout << "[TEST 3/6] Conflict Detection & Smart Best-Fit Allocation...\n";
    
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

    // Smart Allocation: 2 guests on 24/05/2026 at 8:00 PM -> Table 2 (capacity 4)
    const Table *best = bm.findBestTable(2, "24/05/2026", "8:00 PM");
    assert(best != nullptr);
    assert(best->getId() == 2);

    // Smart Allocation: 2 guests on 25/05/2026 at 8:00 PM -> Table 1 (capacity 2)
    const Table *bestNextDay = bm.findBestTable(2, "25/05/2026", "8:00 PM");
    assert(bestNextDay != nullptr);
    assert(bestNextDay->getId() == 1);

    // Programmatic booking creation with trace
    std::vector<std::string> trace;
    Booking created;
    std::string errorMsg;
    bool ok = bm.createBookingProgrammatic("Bob Dylan", 4, "24/05/2026", "8:00 PM", trace, created, errorMsg);
    assert(ok == true);
    assert(created.getTableId() == 2);
    assert(trace.size() >= 4);

    // Slot availability check
    std::vector<int> avail, occ;
    bm.getSlotAvailability("24/05/2026", "8:00 PM", avail, occ);
    assert(occ.size() == 2); // Table 1 and Table 2 occupied
    assert(avail.size() == 1); // Table 3 available

    // JSON serialization
    std::string json = bm.getStateJson();
    assert(json.find("\"totalTables\": 3") != std::string::npos);
    assert(json.find("\"activeBookings\": 2") != std::string::npos);
    assert(json.find("\"Bob Dylan\"") != std::string::npos);

    // Programmatic cancellation
    ok = bm.cancelBookingProgrammatic(created.getBookingId(), errorMsg);
    assert(ok == true);
    assert(bm.getBookings().size() == 1);

    std::cout << "  -> Conflict, Smart Allocation & Programmatic API tests PASSED.\n";
}

void testSpecificTableBooking()
{
    std::cout << "[TEST 4/6] Specific Table Request & Guard Rails...\n";

    {
        std::ofstream tfile("tables.txt");
        tfile << "1|2|Couple Table|Available\n";
        tfile << "2|4|Family Table|Maintenance\n";
        tfile << "3|6|VIP Table|Available\n";
        
        std::ofstream bfile("bookings.txt");
        bfile << "1|1|Alice|2|24/05/2026|8:00 PM\n";
    }

    BookingManager bm;
    bm.loadData();

    std::vector<std::string> trace;
    Booking created;
    std::string errorMsg;

    // 1. Request non-existent table 99
    bool ok = bm.createBookingProgrammatic("User A", 2, "24/05/2026", "8:00 PM", trace, created, errorMsg, 99);
    assert(ok == false);

    // 2. Request Table 2 (Maintenance)
    ok = bm.createBookingProgrammatic("User B", 2, "24/05/2026", "8:00 PM", trace, created, errorMsg, 2);
    assert(ok == false);

    // 3. Request Table 1 (Already booked for this slot)
    ok = bm.createBookingProgrammatic("User C", 2, "24/05/2026", "8:00 PM", trace, created, errorMsg, 1);
    assert(ok == false);

    // 4. Request Table 3 with party of 8 (Table 3 capacity is 6)
    ok = bm.createBookingProgrammatic("User D", 8, "24/05/2026", "8:00 PM", trace, created, errorMsg, 3);
    assert(ok == false);

    // 5. Request Table 3 with party of 4 (Valid!)
    ok = bm.createBookingProgrammatic("User E", 4, "24/05/2026", "8:00 PM", trace, created, errorMsg, 3);
    assert(ok == true);
    assert(created.getTableId() == 3);

    std::cout << "  -> Specific Table Request tests PASSED.\n";
}

void testActivityLogBuffer()
{
    std::cout << "[TEST 5/6] Activity Log Buffer & Event Stream...\n";

    BookingManager bm;
    bm.loadData();

    // Verify initial logs
    const auto &logs = bm.getActivityLogs();
    assert(!logs.empty());

    // Add a table programmatically
    std::string err;
    bool ok = bm.addTableProgrammatic(10, 4, "Terrace Table", err);
    assert(ok == true);

    const auto &updatedLogs = bm.getActivityLogs();
    assert(updatedLogs.back().type == "TABLE_ADDED");

    std::cout << "  -> Activity Log Buffer tests PASSED.\n";
}

void testFileHandlerRobustness()
{
    std::cout << "[TEST 6/6] FileHandler Corrupted Data & Exception Safety...\n";
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
    testSpecificTableBooking();
    testActivityLogBuffer();
    testFileHandlerRobustness();

    std::cout << "\n>>> ALL AUTOMATED TESTS PASSED SUCCESSFULLY! <<<\n";
    return 0;
}

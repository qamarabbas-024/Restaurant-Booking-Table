#include <iostream>
#include "BookingManager.h"
#include "Utils.h"

// ==========================================
// TABLE MANAGEMENT SUBMENU
// ==========================================
void tableMenu(BookingManager &manager)
{
    while (true)
    {
        clearScreen();
        std::cout << "\n================================================================================\n";
        std::cout << "                            TABLE MANAGEMENT\n";
        std::cout << "================================================================================\n";
        std::cout << "  1. View All Tables\n";
        std::cout << "  2. Check Availability by Date & Time Slot\n";
        std::cout << "  3. Add New Table\n";
        std::cout << "  4. Update Table (Capacity, Type, Status)\n";
        std::cout << "  5. Delete Table\n";
        std::cout << "  0. Return to Main Menu\n";
        std::cout << "================================================================================\n";

        int choice = safeIntRange(0, 5, "Enter Choice (0-5): ");

        clearScreen();

        switch (choice)
        {
        case 1:
            manager.showTables();
            break;
        case 2:
            manager.checkSlotAvailability();
            break;
        case 3:
            manager.addTable();
            break;
        case 4:
            manager.updateTable();
            break;
        case 5:
            manager.deleteTable();
            break;
        case 0:
            return;
        }

        pauseScreen();
    }
}

// ==========================================
// BOOKING MANAGEMENT SUBMENU
// ==========================================
void bookingMenu(BookingManager &manager)
{
    while (true)
    {
        clearScreen();
        std::cout << "\n================================================================================\n";
        std::cout << "                           BOOKING MANAGEMENT\n";
        std::cout << "================================================================================\n";
        std::cout << "  1. Create New Reservation (Smart Table Assignment)\n";
        std::cout << "  2. View All Active Reservations\n";
        std::cout << "  3. Search Reservations (by ID, Guest Name, or Date)\n";
        std::cout << "  4. Cancel Reservation\n";
        std::cout << "  0. Return to Main Menu\n";
        std::cout << "================================================================================\n";

        int choice = safeIntRange(0, 4, "Enter Choice (0-4): ");

        clearScreen();

        switch (choice)
        {
        case 1:
            manager.createBooking();
            break;
        case 2:
            manager.showBookings();
            break;
        case 3:
            manager.searchBooking();
            break;
        case 4:
            manager.cancelBooking();
            break;
        case 0:
            return;
        }

        pauseScreen();
    }
}

// ==========================================
// MAIN ENTRY POINT
// ==========================================
int main()
{
    BookingManager manager;
    manager.loadData();

    while (true)
    {
        clearScreen();
        std::cout << "\n================================================================================\n";
        std::cout << "                 RESTAURANT TABLE BOOKING & SEATING SYSTEM\n";
        std::cout << "================================================================================\n";
        std::cout << "  1. System Dashboard & Overview\n";
        std::cout << "  2. Table Management\n";
        std::cout << "  3. Booking & Reservation Management\n";
        std::cout << "  4. Save Data & Exit\n";
        std::cout << "================================================================================\n";

        int choice = safeIntRange(1, 4, "Enter Choice (1-4): ");

        clearScreen();

        switch (choice)
        {
        case 1:
            manager.dashboard();
            pauseScreen();
            break;
        case 2:
            tableMenu(manager);
            break;
        case 3:
            bookingMenu(manager);
            break;
        case 4:
            manager.saveData();
            std::cout << "\n[SUCCESS] All table and reservation data saved successfully.\n";
            std::cout << "Thank you for using the Restaurant Table Booking System!\n\n";
            return 0;
        }
    }

    return 0;
}
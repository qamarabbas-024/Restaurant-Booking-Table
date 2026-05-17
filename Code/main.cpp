#include <iostream>

#include "BookingManager.h"
#include "Utils.h"

using namespace std;

// ==========================================
// TABLE MANAGEMENT MENU
// ==========================================

void tableMenu(BookingManager &manager)
{

    int choice;

    while (true)
    {

        clearScreen();

        cout << "\n====== TABLE MANAGEMENT ======\n";

        cout << "1. Show Tables\n";
        cout << "2. Add Table\n";
        cout << "3. Available Tables\n";
        cout << "0. Back\n";

        cout << "Enter Choice: ";

        choice = safeInt();

        clearScreen();

        switch (choice)
        {

        case 1:
            manager.showTables();
            break;

        case 2:
            manager.addTable();
            break;

        case 3:
            manager.showAvailableTables();
            break;

        case 0:
            return;

        default:
            cout << "Invalid Choice!";
        }

        pauseScreen();
    }
}

// ==========================================
// BOOKING MANAGEMENT MENU
// ==========================================

void bookingMenu(BookingManager &manager)
{

    int choice;

    while (true)
    {

        clearScreen();

        cout << "\n====== BOOKING MANAGEMENT ======\n";

        cout << "1. Create Booking\n";
        cout << "2. Show Bookings\n";
        cout << "3. Search Booking\n";
        cout << "4. Cancel Booking\n";
        cout << "0. Back\n";

        cout << "Enter Choice: ";

        choice = safeInt();

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

        default:
            cout << "Invalid Choice!";
        }

        pauseScreen();
    }
}

// ==========================================
// MAIN
// ==========================================

int main()
{

    BookingManager manager;

    manager.loadData();

    int choice;

    while (true)
    {

        clearScreen();

        cout << "\n========== RESTAURANT SYSTEM ==========\n";

        cout << "1. Dashboard\n";
        cout << "2. Table Management\n";
        cout << "3. Booking Management\n";
        cout << "4. Save And Exit\n";

        cout << "Enter Choice: ";

        choice = safeInt();

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

            cout << "Data Saved Successfully!\n";

            return 0;

        default:

            cout << "Invalid Choice!";

            pauseScreen();
        }
    }

    return 0;
}
#include "BookingManager.h"
#include "FileHandler.h"
#include "Utils.h"
#include <iostream>
#include <iomanip>
#include <algorithm>
#include <map>

BookingManager::BookingManager()
    : m_nextBookingId(1)
{
}

Table *BookingManager::findTableByIdInternal(int id)
{
    for (auto &t : m_tables)
    {
        if (t.getId() == id)
        {
            return &t;
        }
    }
    return nullptr;
}

const Table *BookingManager::findTableById(int id) const
{
    for (const auto &t : m_tables)
    {
        if (t.getId() == id)
        {
            return &t;
        }
    }
    return nullptr;
}

void BookingManager::loadData()
{
    FileHandler::loadTables(m_tables);
    FileHandler::loadBookings(m_bookings, m_nextBookingId);

    // Default seed tables if fresh system
    if (m_tables.empty())
    {
        m_tables.push_back(Table(1, 2, "Couple", "Available"));
        m_tables.push_back(Table(2, 4, "Family", "Available"));
        m_tables.push_back(Table(3, 6, "VIP", "Available"));
        m_tables.push_back(Table(4, 8, "Banquet", "Available"));
        saveData();
    }
}

void BookingManager::saveData() const
{
    FileHandler::saveTables(m_tables);
    FileHandler::saveBookings(m_bookings);
}

void BookingManager::dashboard() const
{
    printHeader("RESTAURANT DASHBOARD & OVERVIEW");

    int totalCapacity = 0;
    int operationalTables = 0;
    int maintenanceTables = 0;
    std::map<std::string, int> typeCounts;

    for (const auto &t : m_tables)
    {
        totalCapacity += t.getCapacity();
        if (t.isOperational())
        {
            operationalTables++;
        }
        else
        {
            maintenanceTables++;
        }
        typeCounts[t.getType()]++;
    }

    std::cout << "  Total Tables Installed : " << m_tables.size() << "\n";
    std::cout << "  Operational Tables     : " << operationalTables << "\n";
    std::cout << "  Under Maintenance      : " << maintenanceTables << "\n";
    std::cout << "  Total Seating Capacity : " << totalCapacity << " Guests\n";
    std::cout << "  Total Active Bookings  : " << m_bookings.size() << "\n";

    std::cout << "\n  Table Breakdown by Type:\n";
    for (const auto &pair : typeCounts)
    {
        std::cout << "    - " << std::left << std::setw(18) << pair.first << " : " << pair.second << " table(s)\n";
    }
    std::cout << "================================================================================\n";
}

void BookingManager::showTables() const
{
    printHeader("RESTAURANT TABLES");

    if (m_tables.empty())
    {
        printInfo("No tables configured in the restaurant.");
        return;
    }

    std::cout << "+----------+------------+----------------------+--------------------+\n";
    std::cout << "| Table ID | Capacity   | Type                 | Operational Status |\n";
    std::cout << "+----------+------------+----------------------+--------------------+\n";

    for (const auto &t : m_tables)
    {
        t.displayRow();
    }

    std::cout << "+----------+------------+----------------------+--------------------+\n";
}

void BookingManager::showAvailableTables(const std::string &date, const std::string &time) const
{
    if (!date.empty() && !time.empty())
    {
        printHeader("AVAILABLE TABLES FOR " + date + " AT " + time);
    }
    else
    {
        printHeader("OPERATIONAL RESTAURANT TABLES");
    }

    int count = 0;
    std::cout << "+----------+------------+----------------------+--------------------+\n";
    std::cout << "| Table ID | Capacity   | Type                 | Status             |\n";
    std::cout << "+----------+------------+----------------------+--------------------+\n";

    for (const auto &t : m_tables)
    {
        if (!t.isOperational())
        {
            continue;
        }

        if (!date.empty() && !time.empty())
        {
            if (isConflict(t.getId(), date, time))
            {
                continue;
            }
        }

        t.displayRow();
        count++;
    }

    std::cout << "+----------+------------+----------------------+--------------------+\n";

    if (count == 0)
    {
        if (!date.empty() && !time.empty())
        {
            printInfo("No tables available for the selected slot (" + date + " at " + time + ").");
        }
        else
        {
            printInfo("No operational tables currently available.");
        }
    }
}

void BookingManager::checkSlotAvailability() const
{
    printSubHeader("CHECK SLOT AVAILABILITY");
    std::string date = safeDateInput("Enter Date (DD/MM/YYYY): ");
    std::string time = chooseTimeSlot();

    showAvailableTables(date, time);
}

void BookingManager::addTable()
{
    printSubHeader("ADD NEW TABLE");

    int id = safePositiveInt("Enter Table ID: ");

    if (findTableById(id) != nullptr)
    {
        printError("Table with ID #" + std::to_string(id) + " already exists!");
        return;
    }

    int capacity = safePositiveInt("Enter Seating Capacity (1-50): ");
    std::string type = safeStringInput("Enter Table Type (e.g. Couple, Family, VIP, Patio): ", false);

    m_tables.push_back(Table(id, capacity, type, "Available"));
    printSuccess("Table #" + std::to_string(id) + " added successfully!");
    saveData();
}

void BookingManager::updateTable()
{
    printSubHeader("UPDATE TABLE");

    int id = safePositiveInt("Enter Table ID to Update: ");
    Table *table = findTableByIdInternal(id);

    if (table == nullptr)
    {
        printError("Table #" + std::to_string(id) + " not found!");
        return;
    }

    std::cout << "Current Details: Table #" << table->getId()
              << " | Capacity: " << table->getCapacity()
              << " | Type: " << table->getType()
              << " | Status: " << table->getStatus() << "\n\n";

    int newCapacity = safePositiveInt("Enter New Seating Capacity: ");
    std::string newType = safeStringInput("Enter New Table Type: ", false);

    std::cout << "\nOperational Status Options:\n  1. Available\n  2. Maintenance\n";
    int statusChoice = safeIntRange(1, 2, "Select Status (1-2): ");
    std::string newStatus = (statusChoice == 1) ? "Available" : "Maintenance";

    table->setCapacity(newCapacity);
    table->setType(newType);
    table->setOperationalStatus(newStatus);

    printSuccess("Table #" + std::to_string(id) + " updated successfully!");
    saveData();
}

void BookingManager::deleteTable()
{
    printSubHeader("DELETE TABLE");

    int id = safePositiveInt("Enter Table ID to Delete: ");
    Table *table = findTableByIdInternal(id);

    if (table == nullptr)
    {
        printError("Table #" + std::to_string(id) + " not found!");
        return;
    }

    // Check if table is referenced in any bookings
    for (const auto &b : m_bookings)
    {
        if (b.getTableId() == id)
        {
            printError("Cannot delete Table #" + std::to_string(id) + " because active booking #" +
                       std::to_string(b.getBookingId()) + " is assigned to it! Cancel the booking first.");
            return;
        }
    }

    std::string confirm = safeStringInput("Are you sure you want to delete Table #" + std::to_string(id) + "? (y/N): ", true);
    if (confirm == "y" || confirm == "Y")
    {
        m_tables.erase(
            std::remove_if(m_tables.begin(), m_tables.end(),
                           [id](const Table &t) { return t.getId() == id; }),
            m_tables.end());

        printSuccess("Table #" + std::to_string(id) + " deleted successfully!");
        saveData();
    }
    else
    {
        printInfo("Table deletion cancelled.");
    }
}

bool BookingManager::isConflict(int tableId, const std::string &date, const std::string &time) const
{
    for (const auto &b : m_bookings)
    {
        if (b.conflictsWith(tableId, date, time))
        {
            return true;
        }
    }
    return false;
}

const Table *BookingManager::findBestTable(int guests, const std::string &date, const std::string &time) const
{
    const Table *bestTable = nullptr;

    for (const auto &t : m_tables)
    {
        // Table must be operational, have sufficient capacity, and have no conflict on (date, time)
        if (t.canSeat(guests) && !isConflict(t.getId(), date, time))
        {
            if (bestTable == nullptr || t.getCapacity() < bestTable->getCapacity())
            {
                bestTable = &t;
            }
        }
    }

    return bestTable;
}

void BookingManager::createBooking()
{
    printHeader("CREATE NEW TABLE RESERVATION");

    std::string guestName = safeStringInput("Enter Guest Name: ", false);
    int guests = safePositiveInt("Enter Number of Guests: ");
    std::string date = safeDateInput("Enter Reservation Date (DD/MM/YYYY): ");
    std::string time = chooseTimeSlot();

    const Table *bestTable = findBestTable(guests, date, time);

    if (bestTable == nullptr)
    {
        printError("No available table could be found matching " + std::to_string(guests) +
                   " guest(s) on " + date + " at " + time + ".");
        return;
    }

    Booking newBooking(m_nextBookingId++, bestTable->getId(), guestName, guests, date, time);
    m_bookings.push_back(newBooking);

    printSuccess("Reservation successfully booked!");
    newBooking.printReceipt();
    saveData();
}

void BookingManager::showBookings() const
{
    printHeader("ALL ACTIVE RESERVATIONS");

    if (m_bookings.empty())
    {
        printInfo("No active bookings recorded in the system.");
        return;
    }

    std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";
    std::cout << "| ID     | Table ID | Guest Name           | Guests | Date       | Time     |\n";
    std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";

    for (const auto &b : m_bookings)
    {
        b.displayRow();
    }

    std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";
    std::cout << "Total Active Reservations: " << m_bookings.size() << "\n";
}

void BookingManager::searchBooking() const
{
    printHeader("SEARCH RESERVATIONS");

    std::cout << "  1. Search by Booking ID\n";
    std::cout << "  2. Search by Guest Name\n";
    std::cout << "  3. Search by Reservation Date\n";
    std::cout << "  0. Return to Menu\n";
    std::cout << "================================================================================\n";

    int choice = safeIntRange(0, 3, "Select Search Option (0-3): ");

    if (choice == 0)
    {
        return;
    }

    if (choice == 1)
    {
        int id = safePositiveInt("Enter Booking ID: ");
        bool found = false;

        for (const auto &b : m_bookings)
        {
            if (b.getBookingId() == id)
            {
                b.printReceipt();
                found = true;
                break;
            }
        }

        if (!found)
        {
            printError("No reservation found with Booking ID #" + std::to_string(id) + ".");
        }
    }
    else if (choice == 2)
    {
        std::string nameQuery = safeStringInput("Enter Guest Name (full or partial): ", false);
        int matchCount = 0;

        std::cout << "\n+--------+----------+----------------------+--------+------------+----------+\n";
        std::cout << "| ID     | Table ID | Guest Name           | Guests | Date       | Time     |\n";
        std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";

        for (const auto &b : m_bookings)
        {
            if (b.matchesGuestName(nameQuery))
            {
                b.displayRow();
                matchCount++;
            }
        }

        std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";

        if (matchCount == 0)
        {
            printInfo("No bookings found matching guest name: \"" + nameQuery + "\".");
        }
        else
        {
            printSuccess("Found " + std::to_string(matchCount) + " matching reservation(s).");
        }
    }
    else if (choice == 3)
    {
        std::string dateQuery = safeDateInput("Enter Date (DD/MM/YYYY): ");
        int matchCount = 0;

        std::cout << "\n+--------+----------+----------------------+--------+------------+----------+\n";
        std::cout << "| ID     | Table ID | Guest Name           | Guests | Date       | Time     |\n";
        std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";

        for (const auto &b : m_bookings)
        {
            if (b.matchesDate(dateQuery))
            {
                b.displayRow();
                matchCount++;
            }
        }

        std::cout << "+--------+----------+----------------------+--------+------------+----------+\n";

        if (matchCount == 0)
        {
            printInfo("No bookings found scheduled for " + dateQuery + ".");
        }
        else
        {
            printSuccess("Found " + std::to_string(matchCount) + " reservation(s) on " + dateQuery + ".");
        }
    }
}

void BookingManager::cancelBooking()
{
    printHeader("CANCEL RESERVATION");

    int id = safePositiveInt("Enter Booking ID to Cancel: ");

    auto it = std::find_if(m_bookings.begin(), m_bookings.end(),
                           [id](const Booking &b) { return b.getBookingId() == id; });

    if (it == m_bookings.end())
    {
        printError("Reservation #" + std::to_string(id) + " not found!");
        return;
    }

    std::cout << "\nFound Reservation:\n";
    std::cout << "  Booking ID : #" << it->getBookingId() << "\n";
    std::cout << "  Guest Name : " << it->getGuestName() << "\n";
    std::cout << "  Table ID   : Table " << it->getTableId() << "\n";
    std::cout << "  Date & Time: " << it->getDate() << " at " << it->getTime() << "\n\n";

    std::string confirm = safeStringInput("Are you sure you want to cancel this reservation? (y/N): ", true);

    if (confirm == "y" || confirm == "Y")
    {
        m_bookings.erase(it);
        printSuccess("Reservation #" + std::to_string(id) + " has been cancelled.");
        saveData();
    }
    else
    {
        printInfo("Cancellation aborted. Reservation remains active.");
    }
}
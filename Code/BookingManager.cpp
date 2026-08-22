#include "BookingManager.h"
#include "FileHandler.h"
#include "Utils.h"
#include <iostream>
#include <iomanip>
#include <algorithm>
#include <map>
#include <sstream>
#include <ctime>

static std::string getCurrentTimeString()
{
    std::time_t now = std::time(nullptr);
    std::tm *lt = std::localtime(&now);
    char buf[32];
    if (lt)
    {
        std::strftime(buf, sizeof(buf), "%H:%M:%S", lt);
        return std::string(buf);
    }
    return "00:00:00";
}

BookingManager::BookingManager()
    : m_nextBookingId(1)
{
    logActivity("SYSTEM_INIT", "Restaurant core engine initialized.");
}

void BookingManager::logActivity(const std::string &type, const std::string &message)
{
    ActivityLog log;
    log.timestamp = getCurrentTimeString();
    log.type = type;
    log.message = message;
    m_activityLogs.push_back(log);

    // Keep log buffer bounded
    if (m_activityLogs.size() > 50)
    {
        m_activityLogs.erase(m_activityLogs.begin());
    }
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
        m_tables.push_back(Table(1, 2, "Couple Table", "Available"));
        m_tables.push_back(Table(2, 4, "Family Booth", "Available"));
        m_tables.push_back(Table(3, 6, "VIP Suite", "Available"));
        m_tables.push_back(Table(4, 8, "Banquet Table", "Available"));
        saveData();
    }

    logActivity("DATA_LOADED", "Loaded " + std::to_string(m_tables.size()) + " tables and " +
                                  std::to_string(m_bookings.size()) + " reservations.");
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
    std::string type = safeStringInput("Enter Table Type (e.g. Couple Table, Family Booth, VIP Suite): ", false);

    m_tables.push_back(Table(id, capacity, type, "Available"));
    logActivity("TABLE_ADDED", "Table #" + std::to_string(id) + " (" + type + ", " + std::to_string(capacity) + " guests) added.");
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

    logActivity("TABLE_UPDATED", "Table #" + std::to_string(id) + " updated to " + std::to_string(newCapacity) + " guests (" + newStatus + ").");
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

        logActivity("TABLE_DELETED", "Table #" + std::to_string(id) + " deleted.");
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

    std::vector<std::string> trace;
    Booking newBooking;
    std::string errorMsg;

    if (!createBookingProgrammatic(guestName, guests, date, time, trace, newBooking, errorMsg))
    {
        printError(errorMsg);
        return;
    }

    printSuccess("Reservation successfully booked!");
    newBooking.printReceipt();
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
        std::string errorMsg;
        cancelBookingProgrammatic(id, errorMsg);
        printSuccess("Reservation #" + std::to_string(id) + " has been cancelled.");
    }
    else
    {
        printInfo("Cancellation aborted. Reservation remains active.");
    }
}

// ==========================================
// PROGRAMMATIC & API METHODS
// ==========================================

const std::vector<Table> &BookingManager::getTables() const
{
    return m_tables;
}

const std::vector<Booking> &BookingManager::getBookings() const
{
    return m_bookings;
}

const std::vector<ActivityLog> &BookingManager::getActivityLogs() const
{
    return m_activityLogs;
}

bool BookingManager::createBookingProgrammatic(const std::string &guestName, int guests,
                                              const std::string &date, const std::string &time,
                                              std::vector<std::string> &trace,
                                              Booking &createdBooking,
                                              std::string &errorMsg,
                                              int requestedTableId)
{
    trace.push_back("Input validated: Guest '" + guestName + "', " + std::to_string(guests) + " guests.");
    trace.push_back("Checking slot: " + date + " at " + time);

    if (guestName.empty())
    {
        errorMsg = "Guest name cannot be empty.";
        trace.push_back("Validation error: Blank guest name.");
        return false;
    }

    if (guests <= 0)
    {
        errorMsg = "Guest count must be greater than 0.";
        trace.push_back("Validation error: Invalid party size.");
        return false;
    }

    const Table *assignedTable = nullptr;

    if (requestedTableId > 0)
    {
        trace.push_back("Evaluating requested specific Table #" + std::to_string(requestedTableId) + ".");
        const Table *target = findTableById(requestedTableId);
        if (target == nullptr)
        {
            errorMsg = "Requested Table #" + std::to_string(requestedTableId) + " does not exist.";
            trace.push_back("Table lookup failed: Table not found.");
            return false;
        }

        if (!target->isOperational())
        {
            errorMsg = "Table #" + std::to_string(requestedTableId) + " is under maintenance.";
            trace.push_back("Status check failed: Table out of service.");
            return false;
        }

        if (target->getCapacity() < guests)
        {
            errorMsg = "Table #" + std::to_string(requestedTableId) + " capacity (" +
                       std::to_string(target->getCapacity()) + ") is smaller than party size (" +
                       std::to_string(guests) + ").";
            trace.push_back("Capacity check failed: Table too small.");
            return false;
        }

        if (isConflict(requestedTableId, date, time))
        {
            errorMsg = "Table #" + std::to_string(requestedTableId) + " is already reserved on " + date + " at " + time + ".";
            trace.push_back("Conflict check failed: Slot already booked.");
            return false;
        }

        assignedTable = target;
        trace.push_back("Specific Table #" + std::to_string(assignedTable->getId()) + " verified and assigned.");
    }
    else
    {
        trace.push_back("Scanning " + std::to_string(m_tables.size()) + " tables for capacity >= " + std::to_string(guests) + " and slot availability.");

        assignedTable = findBestTable(guests, date, time);

        if (assignedTable == nullptr)
        {
            errorMsg = "No available table found matching " + std::to_string(guests) +
                       " guest(s) on " + date + " at " + time + ".";
            trace.push_back("Allocation failed: All candidate tables occupied or insufficient capacity.");
            logActivity("CONFLICT_DETECTED", "No table available for " + std::to_string(guests) + " guests on " + date + " at " + time);
            return false;
        }

        trace.push_back("Matched optimal Table #" + std::to_string(assignedTable->getId()) + " (" + assignedTable->getType() + ", " + std::to_string(assignedTable->getCapacity()) + " capacity).");
    }

    createdBooking = Booking(m_nextBookingId++, assignedTable->getId(), guestName, guests, date, time);
    m_bookings.push_back(createdBooking);

    trace.push_back("Created Reservation #" + std::to_string(createdBooking.getBookingId()) + ".");
    trace.push_back("Data persisted to disk (bookings.txt).");

    logActivity("BOOKING_CREATED", "Booking #" + std::to_string(createdBooking.getBookingId()) + " created for " + guestName + " (Table #" + std::to_string(assignedTable->getId()) + ", " + date + " " + time + ").");

    saveData();
    return true;
}

bool BookingManager::cancelBookingProgrammatic(int bookingId, std::string &errorMsg)
{
    auto it = std::find_if(m_bookings.begin(), m_bookings.end(),
                           [bookingId](const Booking &b) { return b.getBookingId() == bookingId; });

    if (it == m_bookings.end())
    {
        errorMsg = "Reservation #" + std::to_string(bookingId) + " not found.";
        return false;
    }

    std::string guest = it->getGuestName();
    int tableId = it->getTableId();
    m_bookings.erase(it);

    logActivity("BOOKING_CANCELLED", "Booking #" + std::to_string(bookingId) + " (" + guest + ", Table #" + std::to_string(tableId) + ") cancelled.");
    saveData();
    return true;
}

bool BookingManager::addTableProgrammatic(int id, int capacity, const std::string &type, std::string &errorMsg)
{
    if (findTableById(id) != nullptr)
    {
        errorMsg = "Table #" + std::to_string(id) + " already exists.";
        return false;
    }

    if (capacity <= 0)
    {
        errorMsg = "Capacity must be greater than 0.";
        return false;
    }

    m_tables.push_back(Table(id, capacity, type, "Available"));
    logActivity("TABLE_ADDED", "Table #" + std::to_string(id) + " (" + type + ", " + std::to_string(capacity) + " seats) added.");
    saveData();
    return true;
}

bool BookingManager::updateTableStatusProgrammatic(int id, const std::string &status, std::string &errorMsg)
{
    Table *table = findTableByIdInternal(id);
    if (table == nullptr)
    {
        errorMsg = "Table #" + std::to_string(id) + " not found.";
        return false;
    }

    if (status != "Available" && status != "Maintenance")
    {
        errorMsg = "Status must be 'Available' or 'Maintenance'.";
        return false;
    }

    table->setOperationalStatus(status);
    logActivity("TABLE_STATUS_CHANGED", "Table #" + std::to_string(id) + " status changed to " + status + ".");
    saveData();
    return true;
}

bool BookingManager::deleteTableProgrammatic(int id, std::string &errorMsg)
{
    Table *table = findTableByIdInternal(id);
    if (table == nullptr)
    {
        errorMsg = "Table #" + std::to_string(id) + " not found.";
        return false;
    }

    for (const auto &b : m_bookings)
    {
        if (b.getTableId() == id)
        {
            errorMsg = "Cannot delete Table #" + std::to_string(id) + " because active booking #" +
                       std::to_string(b.getBookingId()) + " is assigned to it.";
            return false;
        }
    }

    m_tables.erase(
        std::remove_if(m_tables.begin(), m_tables.end(),
                       [id](const Table &t) { return t.getId() == id; }),
        m_tables.end());

    logActivity("TABLE_DELETED", "Table #" + std::to_string(id) + " deleted.");
    saveData();
    return true;
}

void BookingManager::getSlotAvailability(const std::string &date, const std::string &time,
                                         std::vector<int> &availableTableIds,
                                         std::vector<int> &occupiedTableIds) const
{
    availableTableIds.clear();
    occupiedTableIds.clear();

    for (const auto &t : m_tables)
    {
        if (!t.isOperational())
        {
            continue;
        }

        if (isConflict(t.getId(), date, time))
        {
            occupiedTableIds.push_back(t.getId());
        }
        else
        {
            availableTableIds.push_back(t.getId());
        }
    }
}

// Simple JSON helper
static std::string escapeJson(const std::string &s)
{
    std::ostringstream o;
    for (char c : s)
    {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else o << c;
    }
    return o.str();
}

std::string BookingManager::getStateJson() const
{
    std::ostringstream ss;
    ss << "{\n";

    // Metrics
    int totalCapacity = 0;
    int operational = 0;
    int maintenance = 0;
    for (const auto &t : m_tables)
    {
        totalCapacity += t.getCapacity();
        if (t.isOperational()) operational++;
        else maintenance++;
    }

    ss << "  \"metrics\": {\n";
    ss << "    \"totalTables\": " << m_tables.size() << ",\n";
    ss << "    \"operationalTables\": " << operational << ",\n";
    ss << "    \"maintenanceTables\": " << maintenance << ",\n";
    ss << "    \"totalCapacity\": " << totalCapacity << ",\n";
    ss << "    \"activeBookings\": " << m_bookings.size() << "\n";
    ss << "  },\n";

    // Tables
    ss << "  \"tables\": [\n";
    for (size_t i = 0; i < m_tables.size(); ++i)
    {
        const auto &t = m_tables[i];
        ss << "    {\n";
        ss << "      \"id\": " << t.getId() << ",\n";
        ss << "      \"capacity\": " << t.getCapacity() << ",\n";
        ss << "      \"type\": \"" << escapeJson(t.getType()) << "\",\n";
        ss << "      \"status\": \"" << escapeJson(t.getStatus()) << "\"\n";
        ss << "    }" << (i + 1 < m_tables.size() ? "," : "") << "\n";
    }
    ss << "  ],\n";

    // Bookings
    ss << "  \"bookings\": [\n";
    for (size_t i = 0; i < m_bookings.size(); ++i)
    {
        const auto &b = m_bookings[i];
        ss << "    {\n";
        ss << "      \"bookingId\": " << b.getBookingId() << ",\n";
        ss << "      \"tableId\": " << b.getTableId() << ",\n";
        ss << "      \"guestName\": \"" << escapeJson(b.getGuestName()) << "\",\n";
        ss << "      \"guests\": " << b.getGuests() << ",\n";
        ss << "      \"date\": \"" << escapeJson(b.getDate()) << "\",\n";
        ss << "      \"time\": \"" << escapeJson(b.getTime()) << "\"\n";
        ss << "    }" << (i + 1 < m_bookings.size() ? "," : "") << "\n";
    }
    ss << "  ],\n";

    // Activity Logs
    ss << "  \"activity\": [\n";
    for (size_t i = 0; i < m_activityLogs.size(); ++i)
    {
        const auto &l = m_activityLogs[i];
        ss << "    {\n";
        ss << "      \"timestamp\": \"" << escapeJson(l.timestamp) << "\",\n";
        ss << "      \"type\": \"" << escapeJson(l.type) << "\",\n";
        ss << "      \"message\": \"" << escapeJson(l.message) << "\"\n";
        ss << "    }" << (i + 1 < m_activityLogs.size() ? "," : "") << "\n";
    }
    ss << "  ]\n";

    ss << "}\n";
    return ss.str();
}
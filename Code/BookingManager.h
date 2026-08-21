#pragma once

#include <vector>
#include <string>
#include "Table.h"
#include "Booking.h"

struct ActivityLog
{
    std::string timestamp;
    std::string type;
    std::string message;
};

class BookingManager
{
private:
    std::vector<Table> m_tables;
    std::vector<Booking> m_bookings;
    std::vector<ActivityLog> m_activityLogs;
    int m_nextBookingId;

    // Helper lookup methods
    Table *findTableByIdInternal(int id);
    void logActivity(const std::string &type, const std::string &message);

public:
    BookingManager();

    // Data persistence
    void loadData();
    void saveData() const;

    // Table Management (Console)
    void showTables() const;
    void showAvailableTables(const std::string &date = "", const std::string &time = "") const;
    void checkSlotAvailability() const;
    void addTable();
    void updateTable();
    void deleteTable();
    const Table *findTableById(int id) const;

    // Scheduling & Booking Logic (Console)
    bool isConflict(int tableId, const std::string &date, const std::string &time) const;
    const Table *findBestTable(int guests, const std::string &date, const std::string &time) const;
    void createBooking();
    void showBookings() const;
    void searchBooking() const;
    void cancelBooking();

    // Dashboard & Analytics (Console)
    void dashboard() const;

    // Programmatic & API Interface (for Visual Companion & Automation)
    const std::vector<Table> &getTables() const;
    const std::vector<Booking> &getBookings() const;
    const std::vector<ActivityLog> &getActivityLogs() const;
    
    bool createBookingProgrammatic(const std::string &guestName, int guests,
                                   const std::string &date, const std::string &time,
                                   std::vector<std::string> &trace,
                                   Booking &createdBooking,
                                   std::string &errorMsg,
                                   int requestedTableId = 0);
    
    bool cancelBookingProgrammatic(int bookingId, std::string &errorMsg);
    
    bool addTableProgrammatic(int id, int capacity, const std::string &type, std::string &errorMsg);

    void getSlotAvailability(const std::string &date, const std::string &time,
                             std::vector<int> &availableTableIds,
                             std::vector<int> &occupiedTableIds) const;

    std::string getStateJson() const;
};

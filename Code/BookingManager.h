#pragma once

#include <vector>
#include <string>
#include "Table.h"
#include "Booking.h"

class BookingManager
{
private:
    std::vector<Table> m_tables;
    std::vector<Booking> m_bookings;
    int m_nextBookingId;

    // Helper lookup methods
    Table *findTableByIdInternal(int id);

public:
    BookingManager();

    // Data persistence
    void loadData();
    void saveData() const;

    // Table Management
    void showTables() const;
    void showAvailableTables(const std::string &date = "", const std::string &time = "") const;
    void checkSlotAvailability() const;
    void addTable();
    void updateTable();
    void deleteTable();
    const Table *findTableById(int id) const;

    // Scheduling & Booking Logic
    bool isConflict(int tableId, const std::string &date, const std::string &time) const;
    const Table *findBestTable(int guests, const std::string &date, const std::string &time) const;
    void createBooking();
    void showBookings() const;
    void searchBooking() const;
    void cancelBooking();

    // Dashboard & Analytics
    void dashboard() const;
};

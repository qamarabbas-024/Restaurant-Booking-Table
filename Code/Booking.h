#pragma once

#include <string>

class Booking
{
private:
    int m_bookingId;
    int m_tableId;
    std::string m_guestName;
    int m_guests;
    std::string m_date;
    std::string m_time;

public:
    // Constructors
    Booking();
    Booking(int bookingId, int tableId, const std::string &guestName, int guests,
            const std::string &date, const std::string &time);

    // Getters
    int getBookingId() const;
    int getTableId() const;
    const std::string &getGuestName() const;
    int getGuests() const;
    const std::string &getDate() const;
    const std::string &getTime() const;

    // Domain & Query Methods
    bool conflictsWith(int tableId, const std::string &date, const std::string &time) const;
    bool matchesGuestName(const std::string &query) const;
    bool matchesDate(const std::string &date) const;

    // Display
    void displayRow() const;
    void printReceipt() const;
};

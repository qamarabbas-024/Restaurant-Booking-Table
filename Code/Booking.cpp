#include "Booking.h"
#include "Utils.h"
#include <iostream>
#include <iomanip>

Booking::Booking()
    : m_bookingId(0), m_tableId(0), m_guestName(""), m_guests(1), m_date(""), m_time("")
{
}

Booking::Booking(int bookingId, int tableId, const std::string &guestName, int guests,
                 const std::string &date, const std::string &time)
    : m_bookingId(bookingId),
      m_tableId(tableId),
      m_guestName(guestName.empty() ? "Guest" : guestName),
      m_guests(guests > 0 ? guests : 1),
      m_date(date),
      m_time(time)
{
}

int Booking::getBookingId() const
{
    return m_bookingId;
}

int Booking::getTableId() const
{
    return m_tableId;
}

const std::string &Booking::getGuestName() const
{
    return m_guestName;
}

int Booking::getGuests() const
{
    return m_guests;
}

const std::string &Booking::getDate() const
{
    return m_date;
}

const std::string &Booking::getTime() const
{
    return m_time;
}

bool Booking::conflictsWith(int tableId, const std::string &date, const std::string &time) const
{
    return (m_tableId == tableId && m_date == date && m_time == time);
}

bool Booking::matchesGuestName(const std::string &query) const
{
    std::string lowerQuery = toLowerCase(trim(query));
    std::string lowerName = toLowerCase(m_guestName);
    return (lowerName.find(lowerQuery) != std::string::npos);
}

bool Booking::matchesDate(const std::string &date) const
{
    return (trim(m_date) == trim(date));
}

void Booking::displayRow() const
{
    std::cout << "| " << std::left << std::setw(6) << m_bookingId
              << "| " << std::setw(8) << m_tableId
              << "| " << std::setw(22) << (m_guestName.length() > 20 ? m_guestName.substr(0, 19) + "." : m_guestName)
              << "| " << std::setw(8) << m_guests
              << "| " << std::setw(12) << m_date
              << "| " << std::setw(11) << m_time
              << "|\n";
}

void Booking::printReceipt() const
{
    std::cout << "\n================================================================================\n";
    std::cout << "                             BOOKING RECEIPT\n";
    std::cout << "================================================================================\n";
    std::cout << "  Booking ID   : #" << m_bookingId << "\n";
    std::cout << "  Guest Name   : " << m_guestName << "\n";
    std::cout << "  Table Number : Table " << m_tableId << "\n";
    std::cout << "  Party Size   : " << m_guests << " Guest(s)\n";
    std::cout << "  Date         : " << m_date << "\n";
    std::cout << "  Time Slot    : " << m_time << "\n";
    std::cout << "  Status       : CONFIRMED\n";
    std::cout << "================================================================================\n";
}
#include "FileHandler.h"
#include "Utils.h"
#include <fstream>
#include <sstream>
#include <iostream>

static std::string getTablesPath()
{
    std::ifstream f("tables.txt");
    if (f.good()) return "tables.txt";
    std::ifstream f2("Code/tables.txt");
    if (f2.good()) return "Code/tables.txt";
    return "tables.txt";
}

static std::string getBookingsPath()
{
    std::ifstream f("bookings.txt");
    if (f.good()) return "bookings.txt";
    std::ifstream f2("Code/bookings.txt");
    if (f2.good()) return "Code/bookings.txt";
    return "bookings.txt";
}

void FileHandler::saveTables(const std::vector<Table> &tables)
{
    std::ofstream file(getTablesPath().c_str());
    if (!file.is_open())
    {
        return;
    }

    for (const auto &t : tables)
    {
        file << t.getId() << "|"
             << t.getCapacity() << "|"
             << t.getType() << "|"
             << t.getStatus() << "\n";
    }
}

void FileHandler::saveBookings(const std::vector<Booking> &bookings)
{
    std::ofstream file(getBookingsPath().c_str());
    if (!file.is_open())
    {
        return;
    }

    for (const auto &b : bookings)
    {
        file << b.getBookingId() << "|"
             << b.getTableId() << "|"
             << b.getGuestName() << "|"
             << b.getGuests() << "|"
             << b.getDate() << "|"
             << b.getTime() << "\n";
    }
}

void FileHandler::loadTables(std::vector<Table> &tables)
{
    std::ifstream file(getTablesPath().c_str());
    if (!file.is_open())
    {
        return;
    }

    tables.clear();
    std::string line;

    while (std::getline(file, line))
    {
        line = trim(line);
        if (line.empty())
        {
            continue;
        }

        try
        {
            if (line.find('|') != std::string::npos)
            {
                // Pipe delimited format: id|capacity|type|status
                std::stringstream ss(line);
                std::string sId, sCap, type, status;

                std::getline(ss, sId, '|');
                std::getline(ss, sCap, '|');
                std::getline(ss, type, '|');
                std::getline(ss, status, '|');

                int id = std::stoi(trim(sId));
                int cap = std::stoi(trim(sCap));
                tables.push_back(Table(id, cap, trim(type), trim(status)));
            }
            else
            {
                // Space delimited format: id capacity type status
                std::stringstream ss(line);
                int id, capacity;
                std::string type, status;

                if (ss >> id >> capacity >> type >> status)
                {
                    tables.push_back(Table(id, capacity, type, status));
                }
            }
        }
        catch (const std::exception &)
        {
            // Skip corrupted line safely
            continue;
        }
    }
}

void FileHandler::loadBookings(std::vector<Booking> &bookings, int &nextBookingId)
{
    std::ifstream file(getBookingsPath().c_str());
    if (!file.is_open())
    {
        return;
    }

    bookings.clear();
    std::string line;

    while (std::getline(file, line))
    {
        line = trim(line);
        if (line.empty())
        {
            continue;
        }

        try
        {
            std::stringstream ss(line);
            std::string sBookingId, sTableId, guestName, sGuests, date, time;

            std::getline(ss, sBookingId, '|');
            std::getline(ss, sTableId, '|');
            std::getline(ss, guestName, '|');
            std::getline(ss, sGuests, '|');
            std::getline(ss, date, '|');
            std::getline(ss, time, '|');

            if (sBookingId.empty() || sTableId.empty())
            {
                continue;
            }

            int bookingId = std::stoi(trim(sBookingId));
            int tableId = std::stoi(trim(sTableId));
            int guests = std::stoi(trim(sGuests));

            bookings.push_back(Booking(bookingId, tableId, trim(guestName), guests, trim(date), trim(time)));

            if (bookingId >= nextBookingId)
            {
                nextBookingId = bookingId + 1;
            }
        }
        catch (const std::exception &)
        {
            // Skip corrupted record safely
            continue;
        }
    }
}
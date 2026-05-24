#include "BookingManager.h"
#include <limits>
#include "FileHandler.h"
#include "Utils.h"
#include <iostream>
 
using namespace std;
 
BookingManager::BookingManager()
{
    nextBookingId = 1;
}
 
void BookingManager::loadData()
{
    FileHandler::loadTables(tables);
 
    FileHandler::loadBookings(
        bookings,
        nextBookingId);
 
    if (tables.empty())
    {
        tables.push_back(Table(1, 2, "Couple"));
        tables.push_back(Table(2, 4, "Family"));
        tables.push_back(Table(3, 6, "VIP"));
    }
 
    for (auto &t : tables)
    {
        t.status = "Available";
    }
 
    for (auto &b : bookings)
    {
        for (auto &t : tables)
        {
            if (t.id == b.tableId)
            {
                t.status = "Reserved";
            }
        }
    }
}
 
void BookingManager::saveData()
{
    FileHandler::saveTables(tables);
    FileHandler::saveBookings(bookings);
}
 
void BookingManager::dashboard()
{
    int available = 0;
    int reserved = 0;
 
    for (auto &t : tables)
    {
        if (t.status == "Available")
            available++;
        else
            reserved++;
    }
 
    cout << "\n========== DASHBOARD ==========\n";
    cout << "Total Tables     : " << tables.size() << endl;
    cout << "Available Tables : " << available << endl;
    cout << "Reserved Tables  : " << reserved << endl;
    cout << "Total Bookings   : " << bookings.size() << endl;
}
 
void BookingManager::showTables()
{
    cout << "\n========== TABLES ==========\n";
 
    for (auto &t : tables)
    {
        cout
            << "Table ID : " << t.id
            << " | Capacity : " << t.capacity
            << " | Status : " << t.status
            << endl;
    }
}
 
void BookingManager::showAvailableTables()
{
    cout << "\n====== AVAILABLE TABLES ======\n";
 
    for (auto &t : tables)
    {
        if (t.status == "Available")
        {
            cout
                << "Table ID : " << t.id
                << " | Capacity : " << t.capacity
                << " | Type : " << t.type
                << endl;
        }
    }
}
 
void BookingManager::addTable()
{
    int id;
    int capacity;
    string type;
 
    cout << "Enter Table ID: ";
    id = safeInt();
 
    for (auto &t : tables)
    {
        if (t.id == id)
        {
            cout << "Table Already Exists!";
            return;
        }
    }
 
    cout << "Enter Capacity: ";
    capacity = safeInt();
 
    cout << "Enter Type: ";
    cin >> type;
 
    tables.push_back(Table(id, capacity, type));
 
    cout << "Table Added Successfully!";
 
    saveData();
}
 
bool BookingManager::isConflict(
    int tableId,
    string date,
    string time)
{
    for (auto &b : bookings)
    {
        if (
            b.tableId == tableId &&
            b.date == date &&
            b.time == time)
        {
            return true;
        }
    }
 
    return false;
}
 
Table *BookingManager::findBestTable(
    int guests,
    string date,
    string time)
{
    Table *bestTable = nullptr;
 
    for (auto &t : tables)
    {
        if (
            t.capacity >= guests &&
            t.status == "Available" &&
            !isConflict(t.id, date, time))
        {
            if (
                bestTable == nullptr ||
                t.capacity < bestTable->capacity)
            {
                bestTable = &t;
            }
        }
    }
 
    return bestTable;
}
 
void BookingManager::printReceipt(
    Booking &b)
{
    cout << "\n====== BOOKING RECEIPT ======\n";
    cout << "Booking ID : " << b.bookingId << endl;
    cout << "Guest Name : " << b.guestName << endl;
    cout << "Table ID   : " << b.tableId << endl;
    cout << "Guests     : " << b.guests << endl;
    cout << "Date       : " << b.date << endl;
    cout << "Time       : " << b.time << endl;
}
 
void BookingManager::createBooking()
{
    string guestName;
    string date;
    string time;
    int guests;
 
    cout << "Guest Name: ";
 
    cin.ignore(
        numeric_limits<streamsize>::max(),
        '\n');
 
    getline(cin, guestName);
 
    cout << "Enter Number Of Guests: ";
    guests = safeInt();
 
    cout << "Enter Date: ";
    cin >> date;
 
    time = chooseTimeSlot();
 
    Table *bestTable = findBestTable(guests, date, time);
 
    if (bestTable == nullptr)
    {
        cout << "No Table Available!";
        return;
    }
 
    Booking newBooking(
        nextBookingId++,
        bestTable->id,
        guestName,
        guests,
        date,
        time);
 
    bookings.push_back(newBooking);
 
    bestTable->status = "Reserved";
 
    cout << "\nBooking Created!\n";
 
    printReceipt(newBooking);
 
    saveData();
}
 
void BookingManager::showBookings()
{
    cout << "\n========== BOOKINGS ==========\n";
 
    for (auto &b : bookings)
    {
        cout
            << "Booking ID : " << b.bookingId
            << " | Guest : " << b.guestName
            << " | Table : " << b.tableId
            << " | Guests : " << b.guests
            << " | Date : " << b.date
            << " | Time : " << b.time
            << endl;
    }
}
 
void BookingManager::searchBooking()
{
    int id;
 
    cout << "Enter Booking ID: ";
    id = safeInt();
 
    for (auto &b : bookings)
    {
        if (b.bookingId == id)
        {
            printReceipt(b);
            return;
        }
    }
 
    cout << "Booking Not Found!";
}
 
void BookingManager::cancelBooking()
{
    int id;
 
    cout << "Enter Booking ID: ";
    id = safeInt();
 
    for (int i = 0; i < (int)bookings.size(); i++)
    {
        if (bookings[i].bookingId == id)
        {
            int tableId = bookings[i].tableId;
 
            bookings.erase(bookings.begin() + i);
 
            for (auto &t : tables)
            {
                if (t.id == tableId)
                {
                    t.status = "Available";
                }
            }
 
            cout << "Booking Cancelled!";
 
            saveData();
 
            return;
        }
    }
 
    cout << "Booking Not Found!";
}
 
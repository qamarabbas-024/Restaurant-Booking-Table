#include "FileHandler.h"

#include <fstream>

using namespace std;

void FileHandler::saveTables(
    vector<Table> &tables)
{

    ofstream file("tables.txt");

    for (auto &t : tables)
    {

        file
            << t.id << " "
            << t.capacity << " "
            << t.type << " "
            << t.status << endl;
    }
}

void FileHandler::saveBookings(
    vector<Booking> &bookings)
{

    ofstream file("bookings.txt");

    for (auto &b : bookings)
    {

        file
            << b.bookingId << " "
            << b.tableId << " "
            << b.guestName << " "
            << b.guests << " "
            << b.date << " "
            << b.time << endl;
    }
}

void FileHandler::loadTables(
    vector<Table> &tables)
{

    ifstream file("tables.txt");

    tables.clear();

    int id;
    int capacity;

    string type;
    string status;

    while (
        file >>
        id >>
        capacity >>
        type >>
        status)
    {

        Table t(id, capacity, type);

        t.status = status;

        tables.push_back(t);
    }
}

void FileHandler::loadBookings(
    vector<Booking> &bookings,
    int &nextBookingId)
{

    ifstream file("bookings.txt");

    bookings.clear();

    int bookingId;
    int tableId;
    int guests;

    string guestName;
    string date;
    string time;

    while (
        file >>
        bookingId >>
        tableId >>
        guestName >>
        guests >>
        date >>
        time)
    {

        bookings.push_back(

            Booking(
                bookingId,
                tableId,
                guestName,
                guests,
                date,
                time));

        if (bookingId >= nextBookingId)
        {

            nextBookingId =
                bookingId + 1;
        }
    }
}
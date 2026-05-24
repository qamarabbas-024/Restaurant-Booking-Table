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
 
    // FIX 1: pipe | delimiter so guest names with spaces save correctly
    for (auto &b : bookings)
    {
        file
            << b.bookingId << "|"
            << b.tableId << "|"
            << b.guestName << "|"
            << b.guests << "|"
            << b.date << "|"
            << b.time << "\n";
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
 
    while (file >> id >> capacity >> type >> status)
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
 
    string line;
 
    // FIX 1: Read line by line, split by | delimiter
    while (getline(file, line))
    {
        if (line.empty()) continue;
 
        int pos = 0;
 
        auto nextToken = [&](string &out) {
            int found = line.find('|', pos);
            if (found == (int)string::npos)
            {
                out = line.substr(pos);
                pos = line.size();
            }
            else
            {
                out = line.substr(pos, found - pos);
                pos = found + 1;
            }
        };
 
        string sBookingId, sTableId, guestName, sGuests, date, time;
 
        nextToken(sBookingId);
        nextToken(sTableId);
        nextToken(guestName);
        nextToken(sGuests);
        nextToken(date);
        nextToken(time);
 
        if (sBookingId.empty()) continue;
 
        int bookingId = stoi(sBookingId);
        int tableId   = stoi(sTableId);
        int guests    = stoi(sGuests);
 
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
            nextBookingId = bookingId + 1;
        }
    }
}
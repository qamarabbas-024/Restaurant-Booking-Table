#pragma once
#include <vector>
#include "Table.h"
#include "Booking.h"
using namespace std;
class BookingManager
{

private:
    vector<Table> tables;

    vector<Booking> bookings;

    int nextBookingId;

public:
    BookingManager();

    void loadData();

    void saveData();

    void dashboard();

    void showTables();

    void showAvailableTables();

    void addTable();

    bool isConflict(
        int tableId,
        string date,
        string time);

    Table *findBestTable(
        int guests,
        string date,
        string time);

    void createBooking();

    void showBookings();

    void searchBooking();

    void cancelBooking();

    void printReceipt(
        Booking &b);
};

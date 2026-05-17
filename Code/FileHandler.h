#pragma once
#include <vector>

#include "Table.h"
#include "Booking.h"

using namespace std;

class FileHandler
{

public:
    static void saveTables(
        vector<Table> &tables);

    static void saveBookings(
        vector<Booking> &bookings);

    static void loadTables(
        vector<Table> &tables);

    static void loadBookings(
        vector<Booking> &bookings,
        int &nextBookingId);
};

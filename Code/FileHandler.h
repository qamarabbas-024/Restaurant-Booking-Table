#pragma once

#include <vector>
#include "Table.h"
#include "Booking.h"

class FileHandler
{
public:
    static void saveTables(const std::vector<Table> &tables);
    static void saveBookings(const std::vector<Booking> &bookings);
    static void loadTables(std::vector<Table> &tables);
    static void loadBookings(std::vector<Booking> &bookings, int &nextBookingId);
};

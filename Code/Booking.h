#pragma once
#include <string>
using namespace std;

class Booking
{

public:
    int bookingId;
    int tableId;

    string guestName;

    int guests;

    string date;
    string time;

    Booking(
        int bookingId = 0,
        int tableId = 0,
        string guestName = "",
        int guests = 0,
        string date = "",
        string time = "");
};

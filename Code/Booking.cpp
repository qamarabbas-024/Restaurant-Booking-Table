#include "Booking.h"
Booking::Booking(
    int bookingId,
    int tableId,
    string guestName,
    int guests,
    string date,
    string time)
{

    this->bookingId = bookingId;

    this->tableId = tableId;

    this->guestName = guestName;

    this->guests = guests;

    this->date = date;

    this->time = time;
}
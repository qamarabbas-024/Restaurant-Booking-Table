#include "Table.h"

Table::Table(
    int id,
    int capacity,
    string type)
{

    this->id = id;

    this->capacity = capacity;

    this->type = type;

    this->status = "Available";
}
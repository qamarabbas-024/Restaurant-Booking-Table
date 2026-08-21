#include "Table.h"
#include <iostream>
#include <iomanip>

Table::Table()
    : m_id(0), m_capacity(1), m_type("Standard"), m_status("Available")
{
}

Table::Table(int id, int capacity, const std::string &type, const std::string &status)
    : m_id(id), m_capacity(capacity > 0 ? capacity : 1), m_type(type.empty() ? "Standard" : type), m_status(status.empty() ? "Available" : status)
{
}

int Table::getId() const
{
    return m_id;
}

int Table::getCapacity() const
{
    return m_capacity;
}

const std::string &Table::getType() const
{
    return m_type;
}

const std::string &Table::getStatus() const
{
    return m_status;
}

bool Table::isOperational() const
{
    return (m_status == "Available");
}

bool Table::canSeat(int guests) const
{
    return (isOperational() && m_capacity >= guests);
}

void Table::setCapacity(int capacity)
{
    if (capacity > 0)
    {
        m_capacity = capacity;
    }
}

void Table::setType(const std::string &type)
{
    if (!type.empty())
    {
        m_type = type;
    }
}

void Table::setOperationalStatus(const std::string &status)
{
    if (status == "Available" || status == "Maintenance")
    {
        m_status = status;
    }
}

void Table::displayRow() const
{
    std::cout << "| " << std::left << std::setw(8) << m_id
              << "| " << std::setw(11) << (std::to_string(m_capacity) + " Guests")
              << "| " << std::setw(20) << m_type
              << "| " << std::setw(15) << m_status
              << "|\n";
}
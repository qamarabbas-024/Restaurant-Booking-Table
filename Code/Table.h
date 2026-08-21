#pragma once

#include <string>

class Table
{
private:
    int m_id;
    int m_capacity;
    std::string m_type;
    std::string m_status; // Operational status: "Available" or "Maintenance"

public:
    // Constructors
    Table();
    Table(int id, int capacity, const std::string &type, const std::string &status = "Available");

    // Getters
    int getId() const;
    int getCapacity() const;
    const std::string &getType() const;
    const std::string &getStatus() const;

    // Domain & State Methods
    bool isOperational() const;
    bool canSeat(int guests) const;
    void setCapacity(int capacity);
    void setType(const std::string &type);
    void setOperationalStatus(const std::string &status);

    // Display
    void displayRow() const;
};
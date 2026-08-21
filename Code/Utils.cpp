#include "Utils.h"
#include <iostream>
#include <limits>
#include <cstdlib>
#include <algorithm>
#include <cctype>
#include <sstream>

void clearScreen()
{
#ifdef _WIN32
    std::system("cls");
#else
    std::system("clear");
#endif
}

void pauseScreen()
{
    std::cout << "\nPress Enter to continue...";
    std::cin.sync();
    // Clear any leftover characters up to newline
    std::string dummy;
    std::getline(std::cin, dummy);
}

std::string trim(const std::string &str)
{
    size_t first = str.find_first_not_of(" \t\r\n");
    if (first == std::string::npos)
        return "";
    size_t last = str.find_last_not_of(" \t\r\n");
    return str.substr(first, (last - first + 1));
}

std::string toLowerCase(const std::string &str)
{
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return result;
}

int safeInt(const std::string &prompt)
{
    int value;
    while (true)
    {
        if (!prompt.empty())
        {
            std::cout << prompt;
        }

        std::string line;
        if (!std::getline(std::cin, line))
        {
            std::cin.clear();
            continue;
        }

        line = trim(line);
        if (line.empty())
        {
            std::cout << "[ERROR] Input cannot be empty! Enter number: ";
            continue;
        }

        std::stringstream ss(line);
        if (ss >> value)
        {
            std::string remaining;
            if (!(ss >> remaining)) // Ensure no trailing non-numeric garbage
            {
                return value;
            }
        }

        std::cout << "[ERROR] Invalid input! Please enter a valid number: ";
    }
}

int safePositiveInt(const std::string &prompt)
{
    while (true)
    {
        int value = safeInt(prompt);
        if (value > 0)
        {
            return value;
        }
        std::cout << "[ERROR] Value must be greater than 0! Try again.\n";
    }
}

int safeIntRange(int min, int max, const std::string &prompt)
{
    while (true)
    {
        int value = safeInt(prompt);
        if (value >= min && value <= max)
        {
            return value;
        }
        std::cout << "[ERROR] Value must be between " << min << " and " << max << "! Try again.\n";
    }
}

std::string safeStringInput(const std::string &prompt, bool allowEmpty)
{
    while (true)
    {
        std::cout << prompt;
        std::string line;
        if (!std::getline(std::cin, line))
        {
            std::cin.clear();
            continue;
        }

        // Sanitize delimiter to avoid file corruption
        std::replace(line.begin(), line.end(), '|', '-');
        line = trim(line);

        if (line.empty() && !allowEmpty)
        {
            std::cout << "[ERROR] Input cannot be blank! Please enter text.\n";
            continue;
        }

        return line;
    }
}

std::string safeDateInput(const std::string &prompt)
{
    while (true)
    {
        std::string date = safeStringInput(prompt, false);
        // Ensure non-empty and reasonably structured (e.g. contains numbers/slashes)
        if (date.length() >= 5 && date.length() <= 12)
        {
            return date;
        }
        std::cout << "[ERROR] Invalid date format! Example: 24/05/2026 or 2026-05-24.\n";
    }
}

std::string chooseTimeSlot()
{
    std::cout << "\n================ TIME SLOTS ================\n";
    std::cout << "  1. 12:00 PM (Lunch)\n";
    std::cout << "  2.  2:00 PM (Afternoon)\n";
    std::cout << "  3.  4:00 PM (Late Afternoon)\n";
    std::cout << "  4.  6:00 PM (Early Dinner)\n";
    std::cout << "  5.  8:00 PM (Prime Dinner)\n";
    std::cout << "  6. 10:00 PM (Late Night)\n";
    std::cout << "  7. Custom Time Slot\n";
    std::cout << "============================================\n";

    int choice = safeIntRange(1, 7, "Select Time Slot (1-7): ");

    switch (choice)
    {
    case 1:
        return "12:00 PM";
    case 2:
        return "2:00 PM";
    case 3:
        return "4:00 PM";
    case 4:
        return "6:00 PM";
    case 5:
        return "8:00 PM";
    case 6:
        return "10:00 PM";
    case 7:
        return safeStringInput("Enter Custom Time Slot (e.g. 7:30 PM): ", false);
    default:
        return "8:00 PM";
    }
}

void printHeader(const std::string &title)
{
    std::cout << "\n================================================================================\n";
    std::cout << "                     " << title << "\n";
    std::cout << "================================================================================\n";
}

void printSubHeader(const std::string &title)
{
    std::cout << "\n----------------------------- " << title << " -----------------------------\n";
}

void printSuccess(const std::string &message)
{
    std::cout << "\n[SUCCESS] " << message << "\n";
}

void printError(const std::string &message)
{
    std::cout << "\n[ERROR] " << message << "\n";
}

void printInfo(const std::string &message)
{
    std::cout << "\n[INFO] " << message << "\n";
}
#pragma once

#include <string>

// Console utility and input validation functions
void clearScreen();
void pauseScreen();

// Robust numeric input
int safeInt(const std::string &prompt = "");
int safePositiveInt(const std::string &prompt);
int safeIntRange(int min, int max, const std::string &prompt);

// Robust string and date input
std::string safeStringInput(const std::string &prompt, bool allowEmpty = false);
std::string safeDateInput(const std::string &prompt = "Enter Date (DD/MM/YYYY): ");
std::string chooseTimeSlot();

// String helpers
std::string trim(const std::string &str);
std::string toLowerCase(const std::string &str);

// UI Formatting helpers
void printHeader(const std::string &title);
void printSubHeader(const std::string &title);
void printSuccess(const std::string &message);
void printError(const std::string &message);
void printInfo(const std::string &message);

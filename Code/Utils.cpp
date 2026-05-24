#include "Utils.h"
#include <iostream>
#include <limits>
#include <cstdlib>
 
using namespace std;
 
void clearScreen()
{
    #ifdef _WIN32
        system("cls");
    #else
        system("clear");
    #endif
}
 
void pauseScreen()
{
 
    cout << "\nPress Enter To Continue...";
 
    cin.ignore();
    cin.get();
}
 
int safeInt()
{
 
    int value;
 
    while (!(cin >> value))
    {
 
        cin.clear();
 
        cin.ignore(
            numeric_limits<streamsize>::max(),
            '\n');
 
        cout << "Invalid Input! Enter Number Again: ";
    }
 
    return value;
}
 
string chooseTimeSlot()
{
 
    int choice;
 
    cout << "\n========== TIME SLOTS ==========\n";
 
    cout << "1. 12:00 PM\n";
    cout << "2. 2:00 PM\n";
    cout << "3. 4:00 PM\n";
    cout << "4. 6:00 PM\n";
    cout << "5. 8:00 PM\n";
    cout << "6. Custom Time\n";
 
    cout << "Select Option: ";
 
    choice = safeInt();
 
    switch (choice)
    {
 
    case 1:
        return "12:00PM";
 
    case 2:
        return "2:00PM";
 
    case 3:
        return "4:00PM";
 
    case 4:
        return "6:00PM";
 
    case 5:
        return "8:00PM";
 
    case 6:
    {
 
        string customTime;
 
        cin.ignore(
            numeric_limits<streamsize>::max(),
            '\n');
 
        cout << "Enter Custom Time: ";
 
        getline(cin, customTime);
 
        return customTime;
    }
 
    default:
        return "8:00PM";
    }
}
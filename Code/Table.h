#pragma once
#include <string>
using namespace std;

class Table
{

public:
    int id;
    int capacity;

    string type;
    string status;

    Table(
        int id = 0,
        int capacity = 0,
        string type = "");
};
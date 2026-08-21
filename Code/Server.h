#pragma once

#include "BookingManager.h"
#include <string>

class Server
{
public:
    static void startCompanionServer(BookingManager &manager, int port = 8080);
    static void openBrowser(const std::string &url);
};

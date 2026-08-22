#include "Server.h"
#include "Utils.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <cstring>
#include <cstdlib>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#ifdef _MSC_VER
#pragma comment(lib, "ws2_32.lib")
#endif
typedef int socklen_t;
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#define closesocket close
#define SOCKET int
#define INVALID_SOCKET -1
#define SOCKET_ERROR -1
#endif

static std::string urlDecode(const std::string &src)
{
    std::string ret;
    char ch;
    int i, ii;
    for (i = 0; i < (int)src.length(); i++)
    {
        if (src[i] == '%')
        {
            if (i + 2 < (int)src.length())
            {
                std::string hex = src.substr(i + 1, 2);
                std::istringstream iss(hex);
                if (iss >> std::hex >> ii)
                {
                    ch = static_cast<char>(ii);
                    ret += ch;
                    i = i + 2;
                }
                else
                {
                    ret += '%';
                }
            }
            else
            {
                ret += '%';
            }
        }
        else if (src[i] == '+')
        {
            ret += ' ';
        }
        else
        {
            ret += src[i];
        }
    }
    return ret;
}

static std::string getMimeType(const std::string &path)
{
    if (path.rfind(".html") != std::string::npos) return "text/html";
    if (path.rfind(".css") != std::string::npos) return "text/css";
    if (path.rfind(".js") != std::string::npos) return "application/javascript";
    if (path.rfind(".json") != std::string::npos) return "application/json";
    if (path.rfind(".svg") != std::string::npos) return "image/svg+xml";
    if (path.rfind(".png") != std::string::npos) return "image/png";
    return "text/plain";
}

static void sendHttpResponse(SOCKET clientSocket, int statusCode, const std::string &statusText,
                             const std::string &contentType, const std::string &body)
{
    std::ostringstream ss;
    ss << "HTTP/1.1 " << statusCode << " " << statusText << "\r\n";
    ss << "Content-Type: " << contentType << "; charset=utf-8\r\n";
    ss << "Content-Length: " << body.size() << "\r\n";
    ss << "Access-Control-Allow-Origin: *\r\n";
    ss << "Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS\r\n";
    ss << "Access-Control-Allow-Headers: Content-Type\r\n";
    ss << "Connection: close\r\n\r\n";
    ss << body;

    std::string response = ss.str();
    send(clientSocket, response.c_str(), (int)response.size(), 0);
}

// Simple robust JSON string extraction helper
static std::string extractJsonString(const std::string &json, const std::string &key)
{
    std::string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return "";

    pos += search.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\r' || json[pos] == '\n')) pos++;
    if (pos >= json.length() || json[pos] != ':') return "";
    pos++; // skip ':'
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\r' || json[pos] == '\n')) pos++;

    if (pos < json.length() && json[pos] == '"')
    {
        pos++;
        size_t end = json.find('"', pos);
        if (end != std::string::npos)
        {
            return json.substr(pos, end - pos);
        }
    }
    return "";
}

static int extractJsonInt(const std::string &json, const std::string &key)
{
    std::string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return 0;

    pos += search.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\r' || json[pos] == '\n')) pos++;
    if (pos >= json.length() || json[pos] != ':') return 0;
    pos++; // skip ':'
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\r' || json[pos] == '\n')) pos++;

    size_t end = pos;
    while (end < json.length() && ((json[end] >= '0' && json[end] <= '9') || json[end] == '-'))
    {
        end++;
    }

    if (end > pos)
    {
        try
        {
            return std::stoi(json.substr(pos, end - pos));
        }
        catch (...)
        {
            return 0;
        }
    }
    return 0;
}

void Server::openBrowser(const std::string &url)
{
#ifdef _WIN32
    std::string cmd = "start " + url;
    std::system(cmd.c_str());
#elif __APPLE__
    std::string cmd = "open " + url;
    std::system(cmd.c_str());
#else
    std::string cmd = "xdg-open " + url;
    std::system(cmd.c_str());
#endif
}

void Server::startCompanionServer(BookingManager &manager, int port)
{
#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
    {
        std::cerr << "[ERROR] Winsock startup failed.\n";
        return;
    }
#endif

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET)
    {
        std::cerr << "[ERROR] Could not create server socket.\n";
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }

    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (char *)&opt, sizeof(opt));

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = inet_addr("127.0.0.1"); // Strictly local loopback
    serverAddr.sin_port = htons((u_short)port);

    if (bind(serverSocket, (sockaddr *)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
    {
        std::cerr << "[ERROR] Could not bind server to 127.0.0.1:" << port << " (Port may be in use).\n";
        closesocket(serverSocket);
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }

    if (listen(serverSocket, 10) == SOCKET_ERROR)
    {
        std::cerr << "[ERROR] Listen failed.\n";
        closesocket(serverSocket);
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }

    std::string localUrl = "http://localhost:" + std::to_string(port);
    std::cout << "\n================================================================================\n";
    std::cout << "                 RESTAURANT VISUAL COMPANION SERVER LIVE\n";
    std::cout << "================================================================================\n";
    std::cout << "  * Local Visual Web UI : " << localUrl << "\n";
    std::cout << "  * Server Engine       : C++17 Embedded REST HTTP Server (Winsock)\n";
    std::cout << "  * Shared Core State   : Connected with BookingManager & tables.txt/bookings.txt\n";
    std::cout << "  * Press Ctrl+C in terminal to stop server and return.\n";
    std::cout << "================================================================================\n\n";

    // Auto-launch browser
    openBrowser(localUrl);

    while (true)
    {
        sockaddr_in clientAddr;
        socklen_t clientLen = sizeof(clientAddr);
        SOCKET clientSocket = accept(serverSocket, (sockaddr *)&clientAddr, &clientLen);

        if (clientSocket == INVALID_SOCKET)
        {
            break;
        }

#ifdef _WIN32
        DWORD timeoutMs = 2500;
        setsockopt(clientSocket, SOL_SOCKET, SO_RCVTIMEO, (char *)&timeoutMs, sizeof(timeoutMs));
        setsockopt(clientSocket, SOL_SOCKET, SO_SNDTIMEO, (char *)&timeoutMs, sizeof(timeoutMs));
#else
        struct timeval tv;
        tv.tv_sec = 2;
        tv.tv_usec = 500000;
        setsockopt(clientSocket, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof(tv));
        setsockopt(clientSocket, SOL_SOCKET, SO_SNDTIMEO, (const char *)&tv, sizeof(tv));
#endif

        char buffer[8192];
        int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        if (bytesRead <= 0)
        {
            closesocket(clientSocket);
            continue;
        }

        buffer[bytesRead] = '\0';
        std::string request(buffer);

        std::istringstream reqStream(request);
        std::string method, fullPath, version;
        reqStream >> method >> fullPath >> version;

        // Parse query params
        std::string path = fullPath;
        std::string queryStr;
        size_t qPos = fullPath.find('?');
        if (qPos != std::string::npos)
        {
            path = fullPath.substr(0, qPos);
            queryStr = fullPath.substr(qPos + 1);
        }

        // Extract body
        std::string body;
        size_t headerEnd = request.find("\r\n\r\n");
        if (headerEnd != std::string::npos)
        {
            body = request.substr(headerEnd + 4);
        }

        if (method == "OPTIONS")
        {
            sendHttpResponse(clientSocket, 200, "OK", "text/plain", "");
            closesocket(clientSocket);
            continue;
        }

        // ================= API ROUTING =================
        if (path == "/api/state" && method == "GET")
        {
            std::string stateJson = manager.getStateJson();
            sendHttpResponse(clientSocket, 200, "OK", "application/json", stateJson);
        }
        else if (path == "/api/availability" && method == "GET")
        {
            std::string date = "";
            std::string time = "";

            std::istringstream qss(queryStr);
            std::string pair;
            while (std::getline(qss, pair, '&'))
            {
                size_t eq = pair.find('=');
                if (eq != std::string::npos)
                {
                    std::string k = pair.substr(0, eq);
                    std::string v = urlDecode(pair.substr(eq + 1));
                    if (k == "date") date = v;
                    else if (k == "time") time = v;
                }
            }

            std::vector<int> avail, occ;
            manager.getSlotAvailability(date, time, avail, occ);

            std::ostringstream resp;
            resp << "{\n  \"date\": \"" << date << "\",\n  \"time\": \"" << time << "\",\n";
            resp << "  \"available\": [";
            for (size_t i = 0; i < avail.size(); ++i)
                resp << avail[i] << (i + 1 < avail.size() ? ", " : "");
            resp << "],\n  \"occupied\": [";
            for (size_t i = 0; i < occ.size(); ++i)
                resp << occ[i] << (i + 1 < occ.size() ? ", " : "");
            resp << "]\n}\n";

            sendHttpResponse(clientSocket, 200, "OK", "application/json", resp.str());
        }
        else if (path == "/api/bookings" && method == "POST")
        {
            std::string guestName = extractJsonString(body, "guestName");
            int guests = extractJsonInt(body, "guests");
            std::string date = extractJsonString(body, "date");
            std::string time = extractJsonString(body, "time");
            int requestedTableId = extractJsonInt(body, "tableId");

            std::vector<std::string> trace;
            Booking createdBooking;
            std::string errorMsg;

            bool ok = manager.createBookingProgrammatic(guestName, guests, date, time, trace, createdBooking, errorMsg, requestedTableId);

            std::ostringstream resp;
            resp << "{\n";
            resp << "  \"success\": " << (ok ? "true" : "false") << ",\n";
            resp << "  \"error\": \"" << errorMsg << "\",\n";
            resp << "  \"trace\": [\n";
            for (size_t i = 0; i < trace.size(); ++i)
            {
                resp << "    \"" << trace[i] << "\"" << (i + 1 < trace.size() ? "," : "") << "\n";
            }
            resp << "  ]";

            if (ok)
            {
                resp << ",\n  \"booking\": {\n";
                resp << "    \"bookingId\": " << createdBooking.getBookingId() << ",\n";
                resp << "    \"tableId\": " << createdBooking.getTableId() << ",\n";
                resp << "    \"guestName\": \"" << createdBooking.getGuestName() << "\",\n";
                resp << "    \"guests\": " << createdBooking.getGuests() << ",\n";
                resp << "    \"date\": \"" << createdBooking.getDate() << "\",\n";
                resp << "    \"time\": \"" << createdBooking.getTime() << "\"\n";
                resp << "  }\n";
            }
            else
            {
                resp << "\n";
            }
            resp << "}\n";

            sendHttpResponse(clientSocket, ok ? 200 : 400, ok ? "OK" : "Bad Request", "application/json", resp.str());
        }
        else if ((path == "/api/cancel" && method == "POST") || (path.rfind("/api/bookings/", 0) == 0 && method == "DELETE"))
        {
            int bookingId = extractJsonInt(body, "bookingId");
            if (bookingId == 0 && path.rfind("/api/bookings/", 0) == 0)
            {
                try
                {
                    bookingId = std::stoi(path.substr(14));
                }
                catch (...) {}
            }

            std::string errorMsg;
            bool ok = manager.cancelBookingProgrammatic(bookingId, errorMsg);

            std::ostringstream resp;
            resp << "{\n  \"success\": " << (ok ? "true" : "false") << ",\n";
            resp << "  \"error\": \"" << errorMsg << "\"\n}\n";

            sendHttpResponse(clientSocket, ok ? 200 : 400, ok ? "OK" : "Bad Request", "application/json", resp.str());
        }
        else if (path == "/api/tables" && method == "POST")
        {
            int id = extractJsonInt(body, "id");
            int cap = extractJsonInt(body, "capacity");
            std::string type = extractJsonString(body, "type");

            std::string errorMsg;
            bool ok = manager.addTableProgrammatic(id, cap, type, errorMsg);

            std::ostringstream resp;
            resp << "{\n  \"success\": " << (ok ? "true" : "false") << ",\n";
            resp << "  \"error\": \"" << errorMsg << "\"\n}\n";

            sendHttpResponse(clientSocket, ok ? 200 : 400, ok ? "OK" : "Bad Request", "application/json", resp.str());
        }
        else if (path == "/api/tables/status" && method == "POST")
        {
            int id = extractJsonInt(body, "id");
            std::string status = extractJsonString(body, "status");

            std::string errorMsg;
            bool ok = manager.updateTableStatusProgrammatic(id, status, errorMsg);

            std::ostringstream resp;
            resp << "{\n  \"success\": " << (ok ? "true" : "false") << ",\n";
            resp << "  \"error\": \"" << errorMsg << "\"\n}\n";

            sendHttpResponse(clientSocket, ok ? 200 : 400, ok ? "OK" : "Bad Request", "application/json", resp.str());
        }
        else if (path == "/api/tables/delete" && method == "POST")
        {
            int id = extractJsonInt(body, "id");

            std::string errorMsg;
            bool ok = manager.deleteTableProgrammatic(id, errorMsg);

            std::ostringstream resp;
            resp << "{\n  \"success\": " << (ok ? "true" : "false") << ",\n";
            resp << "  \"error\": \"" << errorMsg << "\"\n}\n";

            sendHttpResponse(clientSocket, ok ? 200 : 400, ok ? "OK" : "Bad Request", "application/json", resp.str());
        }
        // ================= STATIC FILE SERVING =================
        else
        {
            std::string relPath = path;
            if (relPath == "/" || relPath.empty())
            {
                relPath = "/index.html";
            }

            // Path Traversal Security: Prevent directory traversal
            if (relPath.find("..") != std::string::npos)
            {
                sendHttpResponse(clientSocket, 403, "Forbidden", "text/plain", "Forbidden");
                closesocket(clientSocket);
                continue;
            }

            std::string filePath = "web" + relPath;
            std::ifstream file(filePath.c_str(), std::ios::binary);
            if (!file.is_open())
            {
                filePath = "Code/web" + relPath;
                file.open(filePath.c_str(), std::ios::binary);
            }

            if (file.is_open())
            {
                std::ostringstream ss;
                ss << file.rdbuf();
                std::string fileContent = ss.str();
                std::string mime = getMimeType(filePath);
                sendHttpResponse(clientSocket, 200, "OK", mime, fileContent);
            }
            else
            {
                sendHttpResponse(clientSocket, 404, "Not Found", "text/plain", "404 Not Found: " + relPath);
            }
        }

        closesocket(clientSocket);
    }

    closesocket(serverSocket);
#ifdef _WIN32
    WSACleanup();
#endif
}

#pragma once
#include <string>
#include <vector>
namespace chimera {
struct RuntimeEntry { std::string id, role, linux_provider, windows_provider; };
struct Catalog { static std::vector<RuntimeEntry> runtimes(); static std::vector<std::string> filesystems(); static std::vector<std::string> scanners(); static std::vector<std::string> applications(); static std::vector<std::string> gnu_services(); };
}

#pragma once
#include <string>
#include <vector>
#include <cstdint>
namespace chimera {
enum class HostFamily { Linux, Windows, Wsl, MacOS, Unix, Unknown };
enum class CapabilityKind { KernelABI, Command, Utility, Runtime, Filesystem, Network, Desktop, PackageManager, Compatibility, Service };
struct Capability { std::string id; std::string provider; CapabilityKind kind; std::string interface_name; bool optional; };
class PlatformCompatibilityCatalog {
public:
  static HostFamily detect_host();
  static const std::vector<Capability>& linux_kernel();
  static const std::vector<Capability>& microsoft_open_source();
  static const std::vector<Capability>& commands_and_utilities();
  static const std::vector<Capability>& filesystems();
  static const std::vector<Capability>& networking();
  static const std::vector<Capability>& optional_services();
};
}

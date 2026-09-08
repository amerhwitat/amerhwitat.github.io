#pragma once
#include <string>
#include <vector>
#include <cstdint>
namespace chimera {
enum class HostFamily { Linux, Windows, Wsl, MacOS, Unix, Unknown };
enum class CapabilityKind { KernelABI, Command, Utility, Runtime, Filesystem, Network, Desktop, PackageManager, Compatibility, Service };
struct Capability {
  std::string id;
  std::string provider;
  CapabilityKind kind;
  std::string interface_name;
  bool optional;

  static CapabilityKind kind_from_name(const char* name) {
    std::string s(name);
    if (s == "KernelABI") return CapabilityKind::KernelABI;
    if (s == "Command") return CapabilityKind::Command;
    if (s == "Utility") return CapabilityKind::Utility;
    if (s == "Runtime") return CapabilityKind::Runtime;
    if (s == "Filesystem") return CapabilityKind::Filesystem;
    if (s == "Network") return CapabilityKind::Network;
    if (s == "Desktop") return CapabilityKind::Desktop;
    if (s == "PackageManager") return CapabilityKind::PackageManager;
    if (s == "Compatibility") return CapabilityKind::Compatibility;
    return CapabilityKind::Service;
  }

  Capability(const char* id_, const char* provider_, const char* kind_, const char* interface_, bool optional_)
      : id(id_), provider(provider_), kind(kind_from_name(kind_)), interface_name(interface_), optional(optional_) {}
};
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

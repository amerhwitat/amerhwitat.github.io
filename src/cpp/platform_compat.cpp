#include "chimera/platform_compat.hpp"
#if defined(_WIN32)
#include <windows.h>
#endif
namespace chimera {
HostFamily PlatformCompatibilityCatalog::detect_host() {
#if defined(_WIN32)
  return HostFamily::Windows;
#elif defined(__linux__)
  return HostFamily::Linux;
#elif defined(__APPLE__)
  return HostFamily::MacOS;
#elif defined(__unix__)
  return HostFamily::Unix;
#else
  return HostFamily::Unknown;
#endif
}
const std::vector<Capability>& PlatformCompatibilityCatalog::linux_kernel() {
  static const std::vector<Capability> v = {
    {"syscall","Linux","KernelABI","syscall",false},{"vfs","Linux","KernelABI","VFS",false},
    {"procfs","Linux","Filesystem","/proc",false},{"sysfs","Linux","Filesystem","/sys",false},
    {"epoll","Linux","KernelABI","epoll",true},{"eventfd","Linux","KernelABI","eventfd",true},
    {"signalfd","Linux","KernelABI","signalfd",true},{"netlink","Linux","KernelABI","netlink",true},
    {"namespaces","Linux","KernelABI","namespaces",true},{"cgroups","Linux","KernelABI","cgroups",true},
    {"io_uring","Linux","KernelABI","io_uring",true},{"seccomp","Linux","KernelABI","seccomp",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::microsoft_open_source() {
  static const std::vector<Capability> v = {
    {"wsl","Microsoft","Compatibility","WSL",true},{"wsl2","Microsoft","Compatibility","WSL2",true},
    {"wslg","Microsoft","Desktop","WSLg",true},{"powershell","Microsoft","Command","PowerShell",true},
    {"openssh","Microsoft","Network","OpenSSH",true},{"terminal","Microsoft","Desktop","Windows Terminal",true},
    {"winget","Microsoft","PackageManager","WinGet",true},{"powertoys","Microsoft","Utility","PowerToys",true},
    {"coreutils-windows","Microsoft/uutils","Command","Coreutils",true},{"conpty","Microsoft","Compatibility","ConPTY",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::commands_and_utilities() {
  static const std::vector<Capability> v = {
    {"bash","GNU","Command","bash",false},{"zsh","Zsh","Command","zsh",true},{"fish","fish","Command","fish",true},
    {"powershell","Microsoft","Command","pwsh",true},{"coreutils","GNU/uutils","Utility","coreutils",false},
    {"util-linux","Linux","Utility","util-linux",true},{"findutils","GNU","Utility","findutils",true},
    {"grep","GNU","Utility","grep",false},{"sed","GNU","Utility","sed",false},{"awk","GNU","Utility","awk",true},
    {"procps","Linux","Utility","procps",true},{"iproute2","Linux","Network","iproute2",true},
    {"iputils","Linux","Network","iputils",true},{"openssh-client","OpenSSH","Network","ssh",true},
    {"curl","curl","Network","curl",false},{"wget","GNU","Network","wget",true},{"rsync","rsync","Utility","rsync",true},
    {"git","Git","Utility","git",true},{"tar","GNU","Utility","tar",false}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::filesystems() {
  static const std::vector<Capability> v = {
    {"fat","cross","Filesystem","FAT12/16/32",true},{"exfat","Microsoft","Filesystem","exFAT",true},
    {"ntfs","Microsoft","Filesystem","NTFS",true},{"refs","Microsoft","Filesystem","ReFS",true},
    {"ext4","Linux","Filesystem","ext4",true},{"xfs","Linux","Filesystem","XFS",true},{"btrfs","Linux","Filesystem","Btrfs",true},
    {"zfs","OpenZFS","Filesystem","ZFS",true},{"nfs4","Linux","Filesystem","NFSv4",true},{"smb3","Samba/Microsoft","Filesystem","SMB3",true},
    {"ufs","Unix","Filesystem","UFS/UFS2",true},{"apfs","Apple","Filesystem","APFS",true},{"hfsplus","Apple","Filesystem","HFS+",true},
    {"tmpfs","Linux","Filesystem","tmpfs",true},{"overlayfs","Linux","Filesystem","overlayfs",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::networking() {
  static const std::vector<Capability> v = {
    {"ipv4","IETF","Network","IPv4",false},{"ipv6","IETF","Network","IPv6",false},
    {"tcp","POSIX","Network","TCP",false},{"udp","POSIX","Network","UDP",false},{"dns","BIND","Network","DNS",true},
    {"smb","Samba/Microsoft","Network","SMB/CIFS",true},{"nfs","Linux/Unix","Network","NFS",true},{"netlink","Linux","Network","Netlink",true},
    {"wireguard","WireGuard","Network","WireGuard",true},{"openvpn","OpenVPN","Network","OpenVPN",true}
  }; return v;
}
}

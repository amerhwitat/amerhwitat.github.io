#include "chimera/platform_compat.hpp"
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
    {"devfs","Linux","Filesystem","/dev",false},{"epoll","Linux","KernelABI","epoll",true},
    {"eventfd","Linux","KernelABI","eventfd",true},{"signalfd","Linux","KernelABI","signalfd",true},
    {"timerfd","Linux","KernelABI","timerfd",true},{"inotify","Linux","KernelABI","inotify",true},
    {"netlink","Linux","KernelABI","netlink",true},{"namespaces","Linux","KernelABI","namespaces",true},
    {"cgroups","Linux","KernelABI","cgroups",true},{"io_uring","Linux","KernelABI","io_uring",true},
    {"seccomp","Linux","KernelABI","seccomp",true},{"landlock","Linux","KernelABI","landlock",true},
    {"fanotify","Linux","KernelABI","fanotify",true},{"userfaultfd","Linux","KernelABI","userfaultfd",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::microsoft_open_source() {
  static const std::vector<Capability> v = {
    {"wsl","Microsoft","Compatibility","WSL",true},{"wsl2","Microsoft","Compatibility","WSL2",true},
    {"wslg","Microsoft","Desktop","WSLg",true},{"powershell","Microsoft","Command","pwsh",true},
    {"openssh","Microsoft/OpenSSH","Network","OpenSSH",true},{"terminal","Microsoft","Desktop","Windows Terminal",true},
    {"winget","Microsoft","PackageManager","WinGet",true},{"powertoys","Microsoft","Utility","PowerToys",true},
    {"coreutils-windows","Microsoft/uutils","Command","Coreutils for Windows",true},
    {"conpty","Microsoft","Compatibility","ConPTY",true},{"windows-developer-config","Microsoft","Utility","WindowsDeveloperConfig",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::commands_and_utilities() {
  static const std::vector<Capability> v = {
    {"bash","GNU","Command","bash",false},{"zsh","Zsh","Command","zsh",true},{"fish","fish","Command","fish",true},
    {"powershell","Microsoft/PowerShell","Command","pwsh",true},{"coreutils","GNU/uutils","Utility","coreutils",false},
    {"util-linux","Linux","Utility","util-linux",true},{"findutils","GNU","Utility","findutils",true},
    {"grep","GNU","Utility","grep",false},{"sed","GNU","Utility","sed",false},{"awk","POSIX/GNU","Utility","awk",true},
    {"gawk","GNU","Utility","gawk",true},{"diffutils","GNU","Utility","diff",true},{"patch","GNU","Utility","patch",true},
    {"procps","Linux","Utility","procps",true},{"psmisc","Linux","Utility","psmisc",true},
    {"iproute2","Linux","Network","iproute2",true},{"iputils","Linux","Network","iputils",true},
    {"openssh-client","OpenSSH","Network","ssh",true},{"openssh-server","OpenSSH","Service","sshd",true},
    {"curl","curl","Network","curl",false},{"wget","GNU","Network","wget",true},{"rsync","rsync","Utility","rsync",true},
    {"git","Git","Utility","git",true},{"tar","GNU","Utility","tar",false},{"cpio","GNU","Utility","cpio",true},
    {"gzip","GNU","Utility","gzip",true},{"bzip2","bzip2","Utility","bzip2",true},{"xz","Tukaani","Utility","xz",true},
    {"zstd","Facebook/Meta","Utility","zstd",true},{"jq","jqlang","Utility","jq",true},{"yq","mikefarah","Utility","yq",true},
    {"make","GNU","Utility","make",true},{"binutils","GNU","Utility","binutils",true},{"gcc","GNU","Utility","gcc",true},
    {"gdb","GNU","Utility","gdb",true},{"m4","GNU","Utility","m4",true},{"autoconf","GNU","Utility","autoconf",true},
    {"automake","GNU","Utility","automake",true},{"libtool","GNU","Utility","libtool",true},
    {"screen","GNU","Utility","screen",true},{"emacs","GNU","Utility","emacs",true},{"nano","GNU","Utility","nano",true},
    {"less","GNU","Utility","less",true},{"file","file","Utility","file",true},{"tree","tree","Utility","tree",true},
    {"openssl","OpenSSL","Utility","openssl",true},{"gnutls-cli","GnuTLS","Utility","gnutls-cli",true},
    {"sqlite3","SQLite","Utility","sqlite3",true},{"python3","Python","Runtime","python3",true},{"java","OpenJDK","Runtime","java",true},
    {"dotnet",".NET","Runtime","dotnet",true},{"node","Node.js","Runtime","node",true},{"rustc","Rust","Runtime","rustc",true},
    {"cargo","Rust","Utility","cargo",true},{"perl","Perl","Runtime","perl",true},{"ruby","Ruby","Runtime","ruby",true},
    {"php","PHP","Runtime","php",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::filesystems() {
  static const std::vector<Capability> v = {
    {"fat","cross","Filesystem","FAT12/16/32",true},{"exfat","Microsoft","Filesystem","exFAT",true},
    {"ntfs","Microsoft","Filesystem","NTFS",true},{"refs","Microsoft","Filesystem","ReFS",true},
    {"ext2","Linux","Filesystem","ext2",true},{"ext3","Linux","Filesystem","ext3",true},{"ext4","Linux","Filesystem","ext4",true},
    {"xfs","Linux","Filesystem","XFS",true},{"btrfs","Linux","Filesystem","Btrfs",true},{"zfs","OpenZFS","Filesystem","ZFS",true},
    {"nfs4","Linux","Filesystem","NFSv4",true},{"smb3","Samba/Microsoft","Filesystem","SMB3",true},{"cifs","Samba","Filesystem","CIFS",true},
    {"ufs","Unix","Filesystem","UFS/UFS2",true},{"apfs","Apple","Filesystem","APFS",true},{"hfsplus","Apple","Filesystem","HFS+",true},
    {"tmpfs","Linux","Filesystem","tmpfs",true},{"overlayfs","Linux","Filesystem","overlayfs",true},{"squashfs","Linux","Filesystem","SquashFS",true},
    {"iso9660","Linux/Unix","Filesystem","ISO9660",true},{"udf","Linux/Unix","Filesystem","UDF",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::networking() {
  static const std::vector<Capability> v = {
    {"ipv4","IETF","Network","IPv4",false},{"ipv6","IETF","Network","IPv6",false},{"tcp","POSIX","Network","TCP",false},
    {"udp","POSIX","Network","UDP",false},{"icmp","IETF","Network","ICMP",true},{"dns","BIND","Network","DNS",true},
    {"dhcp","ISC","Network","DHCP",true},{"smb","Samba/Microsoft","Network","SMB/CIFS",true},{"nfs","Linux/Unix","Network","NFS",true},
    {"netlink","Linux","Network","Netlink",true},{"wireguard","WireGuard","Network","WireGuard",true},{"openvpn","OpenVPN","Network","OpenVPN",true},
    {"ssh","OpenSSH","Network","SSH",true},{"http","IETF","Network","HTTP",false},{"https","IETF","Network","HTTPS",true},
    {"quic","IETF","Network","QUIC",true},{"smtp","IETF","Network","SMTP",true},{"imap","IETF","Network","IMAP",true},
    {"ntp","IETF","Network","NTP",true},{"ldap","OpenLDAP","Network","LDAP",true}
  }; return v;
}
const std::vector<Capability>& PlatformCompatibilityCatalog::optional_services() {
  static const std::vector<Capability> v = {
    {"sshd","OpenSSH","Service","sshd",true},{"samba","Samba","Service","smbd/nmbd/winbindd",true},
    {"nfs-server","Linux/NFS","Service","nfs-server",true},{"dns","BIND","Service","named",true},{"dnsmasq","dnsmasq","Service","dnsmasq",true},
    {"httpd","Apache","Service","httpd",true},{"nginx","NGINX","Service","nginx",true},{"caddy","Caddy","Service","caddy",true},
    {"postfix","Postfix","Service","postfix",true},{"dovecot","Dovecot","Service","dovecot",true},{"chrony","Chrony","Service","chronyd",true},
    {"ntpd","NTP","Service","ntpd",true},{"rsyslog","rsyslog","Service","rsyslogd",true},{"syslog-ng","syslog-ng","Service","syslog-ng",true},
    {"cron","Vixie-cron","Service","cron",true},{"systemd","systemd","Service","systemd",true},{"dbus","D-Bus","Service","dbus-daemon",true},
    {"avahi","Avahi","Service","avahi-daemon",true},{"cups","OpenPrinting","Service","cupsd",true},{"bluetooth","BlueZ","Service","bluetoothd",true},
    {"libvirt","libvirt","Service","libvirtd",true},{"podman","Podman","Service","podman",true},{"docker","Docker","Service","dockerd",true},
    {"containerd","containerd","Service","containerd",true},{"k3s","SUSE","Service","k3s",true},{"postgresql","PostgreSQL","Service","postgres",true},
    {"mariadb","MariaDB","Service","mariadbd",true},{"redis","Redis","Service","redis-server",true},{"mosquitto","Eclipse","Service","mosquitto",true}
  }; return v;
}
}

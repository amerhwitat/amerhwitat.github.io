#include "chimera/platform_compat.hpp"
#include "chimera/cpu.hpp"
#include <cassert>
#include <cstdint>
#include <algorithm>
#include <string>

static bool has_id(const std::vector<chimera::Capability>& caps, const char* id) {
  return std::any_of(caps.begin(), caps.end(), [id](const auto& c) { return c.id == id; });
}

int main(){
  using namespace chimera;
  assert(!PlatformCompatibilityCatalog::linux_kernel().empty());
  assert(!PlatformCompatibilityCatalog::microsoft_open_source().empty());
  assert(!PlatformCompatibilityCatalog::commands_and_utilities().empty());
  assert(!PlatformCompatibilityCatalog::filesystems().empty());
  assert(!PlatformCompatibilityCatalog::networking().empty());
  assert(!PlatformCompatibilityCatalog::optional_services().empty());

  // Microsoft PowerShell 7+ is open source and cross-platform, including Linux.
  assert(has_id(PlatformCompatibilityCatalog::microsoft_open_source(), "powershell"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "awk"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "sed"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "findutils"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "util-linux"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "diffutils"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "gawk"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "gzip"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "bzip2"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "xz"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "make"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "gcc"));
  assert(has_id(PlatformCompatibilityCatalog::commands_and_utilities(), "gdb"));
  assert(has_id(PlatformCompatibilityCatalog::optional_services(), "sshd"));
  assert(has_id(PlatformCompatibilityCatalog::optional_services(), "samba"));
  assert(has_id(PlatformCompatibilityCatalog::optional_services(), "dns"));
  assert(has_id(PlatformCompatibilityCatalog::optional_services(), "httpd"));
  assert(has_id(PlatformCompatibilityCatalog::optional_services(), "nfs-server"));

  Cpu c;
  c.r[1].lane[0]=6; c.r[2].lane[0]=7;
  c.execute({Cpu::OP_MUL,3,1,2,0}); assert(c.r[3].lane[0]==42);
  c.execute({Cpu::OP_CMPEQ,4,3,3,0}); assert(c.r[4].lane[0]==1);
  c.execute({Cpu::OP_ROL,5,3,0,1}); assert(c.r[5].lane[0]==84);
  c.execute({Cpu::OP_DIV,6,3,2,0}); assert(c.r[6].lane[0]==21);
  c.execute({Cpu::OP_REM,7,3,2,0}); assert(c.r[7].lane[0]==0);
  c.privilege=3; c.execute({Cpu::OP_POLICY_UPDATE,8,0,0,0});
  return 0;
}

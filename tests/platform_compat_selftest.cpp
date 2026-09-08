#include "chimera/platform_compat.hpp"
#include "chimera/cpu.hpp"
#include <cassert>
#include <cstdint>
int main(){
  using namespace chimera;
  assert(!PlatformCompatibilityCatalog::linux_kernel().empty());
  assert(!PlatformCompatibilityCatalog::microsoft_open_source().empty());
  assert(!PlatformCompatibilityCatalog::commands_and_utilities().empty());
  assert(!PlatformCompatibilityCatalog::filesystems().empty());
  assert(!PlatformCompatibilityCatalog::networking().empty());
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

#include "chimera/cpu.hpp"
#include "chimera/desktop.hpp"
#include <cassert>
int main(){chimera::Cpu c;c.r[1].lane[0]=7;c.r[2].lane[0]=5;chimera_instruction_t i{1,3,1,2,0};c.execute(i);assert(c.r[3].lane[0]==12);chimera::BootDesktopProgressCoordinator p;p.complete_all_boot();assert(p.boot_complete());p.set_desktop_percent(50);assert(p.desktop_sweep_degrees()==180);p.set_desktop_percent(100);assert(p.startup_complete());return 0;}

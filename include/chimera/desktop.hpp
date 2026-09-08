#pragma once
#include <string>
#include <vector>
namespace chimera {
class SpitfireBootProgress { std::vector<std::string> stages_; std::vector<bool> done_; public: SpitfireBootProgress(); explicit SpitfireBootProgress(std::vector<std::string>); int complete(const std::string&); int percent() const; bool complete_all() const; const std::vector<std::string>& stages() const; };
class DesktopLoadingProgress { int p_=0; public: int set(int); int percent() const; int sweep_degrees() const; bool complete() const; };
class BootDesktopProgressCoordinator { SpitfireBootProgress boot_; DesktopLoadingProgress desktop_; public: int boot_percent() const; bool boot_complete() const; bool desktop_started() const; void complete_boot_stage(const std::string&); void complete_all_boot(); void set_desktop_percent(int); int desktop_percent() const; int desktop_sweep_degrees() const; bool startup_complete() const; };
}

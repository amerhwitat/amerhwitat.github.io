#pragma once
#include "types.h"
#include <array>
#include <cstdint>
#include <stdexcept>
namespace chimera {
class Cpu {
public:
  static constexpr size_t REG_COUNT=1024;
  std::array<chimera_reg8192_t,REG_COUNT> r{};
  uint64_t pc=0; uint16_t privilege=0;
  void execute(const chimera_instruction_t& i);
  static chimera_instruction_t decode(const uint8_t b[16]);
  static void encode(const chimera_instruction_t&,uint8_t b[16]);
};
}

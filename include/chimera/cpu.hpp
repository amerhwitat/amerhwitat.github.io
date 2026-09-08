#pragma once
#include "types.h"
#include <array>
#include <cstdint>
#include <stdexcept>
namespace chimera {
class Cpu {
public:
  static constexpr size_t REG_COUNT=1024;
  enum : uint16_t {
    OP_ADD=0x0001, OP_SUB=0x0002, OP_AND=0x0003, OP_OR=0x0004, OP_XOR=0x0005,
    OP_NOT=0x0006, OP_MOV=0x0007, OP_SHL=0x0008, OP_SHR=0x0009,
    OP_MUL=0x000A, OP_MULHI=0x000B, OP_ROL=0x000C, OP_ROR=0x000D,
    OP_DIV=0x000E, OP_REM=0x000F, OP_CMP=0x0010, OP_CMPEQ=0x0011, OP_CMPLT=0x0012,
    OP_SYS_CALL=0x0013, OP_BARRIER=0x0014, OP_POLICY_UPDATE=0x0015
  };
  std::array<chimera_reg8192_t,REG_COUNT> r{};
  uint64_t pc=0; uint16_t privilege=0;
  void execute(const chimera_instruction_t& i);
  static chimera_instruction_t decode(const uint8_t b[16]);
  static void encode(const chimera_instruction_t&,uint8_t b[16]);
private:
  static uint64_t mulhi64(uint64_t a,uint64_t b);
};
}

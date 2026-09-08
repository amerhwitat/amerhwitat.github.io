#pragma once
#include <stdint.h>
#include <stddef.h>
#ifdef __cplusplus
#include <array>
#include <string>
#include <vector>
#endif
#define CHIMERA_LANES 128u
#define CHIMERA_REG_BITS 8192u
#define CHIMERA_REG_BYTES 1024u
#define CHIMERA_INSTR_BYTES 16u

typedef struct { uint64_t lane[CHIMERA_LANES]; } chimera_reg8192_t;
typedef struct { uint16_t opcode, dst, src_a, src_b; uint64_t immediate; } chimera_instruction_t;
#ifdef __cplusplus
static_assert(sizeof(chimera_reg8192_t)==1024);
#endif

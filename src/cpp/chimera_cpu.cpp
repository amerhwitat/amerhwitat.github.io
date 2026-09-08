#include "chimera/cpu.hpp"
#include <cstring>
#include <limits>
namespace chimera {
static uint64_t laneop(uint64_t a,uint64_t b,uint16_t op){switch(op){case 1:return a+b;case 2:return a-b;case 3:return a&b;case 4:return a|b;case 5:return a^b;case 6:return ~a;default:throw std::invalid_argument("unsupported opcode");}}
chimera_instruction_t Cpu::decode(const uint8_t b[16]){ chimera_instruction_t i{}; i.opcode=b[0]|((uint16_t)b[1]<<8); i.dst=b[2]|((uint16_t)b[3]<<8); i.src_a=b[4]|((uint16_t)b[5]<<8); i.src_b=b[6]|((uint16_t)b[7]<<8); std::memcpy(&i.immediate,b+8,8); return i; }
void Cpu::encode(const chimera_instruction_t&i,uint8_t b[16]){std::memset(b,0,16);b[0]=i.opcode;b[1]=i.opcode>>8;b[2]=i.dst;b[3]=i.dst>>8;b[4]=i.src_a;b[5]=i.src_a>>8;b[6]=i.src_b;b[7]=i.src_b>>8;std::memcpy(b+8,&i.immediate,8);}
void Cpu::execute(const chimera_instruction_t&i){if(i.dst>=REG_COUNT||i.src_a>=REG_COUNT||i.src_b>=REG_COUNT)throw std::out_of_range("register");for(size_t n=0;n<CHIMERA_LANES;n++){switch(i.opcode){case 1:case 2:case 3:case 4:case 5:r[i.dst].lane[n]=laneop(r[i.src_a].lane[n],r[i.src_b].lane[n],i.opcode);break;case 6:r[i.dst].lane[n]=~r[i.src_a].lane[n];break;case 7:r[i.dst].lane[n]=r[i.src_a].lane[n];break;case 8:r[i.dst].lane[n]=r[i.src_a].lane[n]<< (i.immediate&63);break;case 9:r[i.dst].lane[n]=r[i.src_a].lane[n]>> (i.immediate&63);break;default:throw std::invalid_argument("unsupported opcode");}}pc+=CHIMERA_INSTR_BYTES;}
}

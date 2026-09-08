#include "chimera/cpu.hpp"
#include <cstring>
#include <limits>
namespace chimera {
static uint64_t laneop(uint64_t a,uint64_t b,uint16_t op){switch(op){case Cpu::OP_ADD:return a+b;case Cpu::OP_SUB:return a-b;case Cpu::OP_AND:return a&b;case Cpu::OP_OR:return a|b;case Cpu::OP_XOR:return a^b;default:throw std::invalid_argument("unsupported binary opcode");}}
static uint64_t rol64(uint64_t x,unsigned n){n&=63u;return n?(x<<n)|(x>>(64u-n)):x;}
static uint64_t ror64(uint64_t x,unsigned n){n&=63u;return n?(x>>n)|(x<<(64u-n)):x;}
chimera_instruction_t Cpu::decode(const uint8_t b[16]){chimera_instruction_t i{};i.opcode=b[0]|((uint16_t)b[1]<<8);i.dst=b[2]|((uint16_t)b[3]<<8);i.src_a=b[4]|((uint16_t)b[5]<<8);i.src_b=b[6]|((uint16_t)b[7]<<8);std::memcpy(&i.immediate,b+8,8);return i;}
void Cpu::encode(const chimera_instruction_t&i,uint8_t b[16]){std::memset(b,0,16);b[0]=i.opcode;b[1]=i.opcode>>8;b[2]=i.dst;b[3]=i.dst>>8;b[4]=i.src_a;b[5]=i.src_a>>8;b[6]=i.src_b;b[7]=i.src_b>>8;std::memcpy(b+8,&i.immediate,8);}
uint64_t Cpu::mulhi64(uint64_t a,uint64_t b){
#if defined(__SIZEOF_INT128__)
  return static_cast<uint64_t>((static_cast<unsigned __int128>(a)*b)>>64);
#else
  const uint64_t a0=a&0xffffffffULL,a1=a>>32,b0=b&0xffffffffULL,b1=b>>32;
  return a1*b1 + ((a1*b0+a0*b1)>>32);
#endif
}
void Cpu::execute(const chimera_instruction_t&i){
  if(i.dst>=REG_COUNT||i.src_a>=REG_COUNT||i.src_b>=REG_COUNT)throw std::out_of_range("register");
  if(i.opcode==OP_SYS_CALL && privilege<1)throw std::runtime_error("privilege required");
  if(i.opcode==OP_POLICY_UPDATE && privilege<3)throw std::runtime_error("policy privilege required");
  for(size_t n=0;n<CHIMERA_LANES;n++){
    const uint64_t a=r[i.src_a].lane[n],b=r[i.src_b].lane[n]; unsigned s=static_cast<unsigned>(i.immediate&63ULL);
    switch(i.opcode){
      case OP_ADD:case OP_SUB:case OP_AND:case OP_OR:case OP_XOR:r[i.dst].lane[n]=laneop(a,b,i.opcode);break;
      case OP_NOT:r[i.dst].lane[n]=~a;break; case OP_MOV:r[i.dst].lane[n]=a;break;
      case OP_SHL:r[i.dst].lane[n]=a<<s;break; case OP_SHR:r[i.dst].lane[n]=a>>s;break;
      case OP_ROL:r[i.dst].lane[n]=rol64(a,s);break; case OP_ROR:r[i.dst].lane[n]=ror64(a,s);break;
      case OP_MUL:r[i.dst].lane[n]=a*b;break; case OP_MULHI:r[i.dst].lane[n]=mulhi64(a,b);break;
      case OP_DIV:if(!b)throw std::domain_error("division by zero");r[i.dst].lane[n]=a/b;break;
      case OP_REM:if(!b)throw std::domain_error("division by zero");r[i.dst].lane[n]=a%b;break;
      case OP_CMP:r[i.dst].lane[n]=(a>b?1ULL:(a<b?static_cast<uint64_t>(-1):0ULL));break;
      case OP_CMPEQ:r[i.dst].lane[n]=(a==b);break; case OP_CMPLT:r[i.dst].lane[n]=(a<b);break;
      case OP_BARRIER:case OP_SYS_CALL:case OP_POLICY_UPDATE:break;
      default:throw std::invalid_argument("unsupported opcode");
    }
  }
  pc+=CHIMERA_INSTR_BYTES;
}
}

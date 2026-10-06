#include "chimera/types.h"
#include <string.h>
void chimera_reg_zero(chimera_reg8192_t* r){ memset(r,0,sizeof(*r)); }
void chimera_reg_copy(chimera_reg8192_t* d,const chimera_reg8192_t* s){ memcpy(d,s,sizeof(*d)); }
void chimera_reg_xor(chimera_reg8192_t* d,const chimera_reg8192_t* a,const chimera_reg8192_t* b){ for(size_t i=0;i<CHIMERA_LANES;i++) d->lane[i]=a->lane[i]^b->lane[i]; }
void chimera_reg_add(chimera_reg8192_t* d,const chimera_reg8192_t* a,const chimera_reg8192_t* b){ uint64_t c=0; for(size_t i=0;i<CHIMERA_LANES;i++){ uint64_t x=a->lane[i]+b->lane[i]; uint64_t c1=(x<a->lane[i]); uint64_t y=x+c; uint64_t c2=(y<x); d->lane[i]=y; c=c1|c2; } }

#include "chimera/koronos.hpp"
#include <cmath>
namespace chimera { double Vector128D::dot(const Vector128D&o)const{double s=0;for(size_t i=0;i<128;i++)s+=v[i]*o.v[i];return s;} void Vector128D::add(const Vector128D&o,double lr){for(size_t i=0;i<128;i++)v[i]+=lr*o.v[i];} const Vector128D& KoronosRnn128::state()const{return state_;} void KoronosRnn128::observe(const Vector128D&x){state_=x;} void KoronosRnn128::learn(const Vector128D&target,double lr){state_.add(target,lr);} }

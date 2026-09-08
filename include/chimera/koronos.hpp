#pragma once
#include <array>
#include <cstdint>
namespace chimera {
struct Vector128D { std::array<double,128> v{}; double dot(const Vector128D&) const; void add(const Vector128D&,double); };
class KoronosRnn128 { Vector128D state_; public: const Vector128D& state() const; void observe(const Vector128D&); void learn(const Vector128D&,double); };
}

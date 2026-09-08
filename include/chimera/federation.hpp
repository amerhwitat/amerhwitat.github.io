#pragma once
#include <array>
#include <cstdint>
#include <string>
namespace chimera {
struct SignedMessage { std::string sender,message_id,timestamp,topic,payload; std::array<uint8_t,32> digest{}; std::vector<uint8_t> signature; };
bool verify_message(const SignedMessage&,const std::array<uint8_t,32>& trusted_key);
}
